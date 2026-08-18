#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const outputDir = resolve(process.argv[2] || "/tmp");
const runTimestamp = process.argv[3] || null;
const questions = [
  { key: "dbops", text: "三个数据库事故的根因和解决办法是什么？" },
  { key: "refund", text: "统计所有状态的退款记录时，哪种退款原因对应的退款总金额最高？请给出原因和金额。" },
  { key: "p1", text: "哪个区域未解决的 P1 售后工单最多？请给出各区域数量，并说明使用的数据表。" },
];

const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname.endsWith(".databricks.com");
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("No workspace page is open");

  const evaluations = page.getByText("Evaluations", { exact: true }).first();
  await evaluations.click();
  await page.waitForTimeout(1_000);
  const runLink = runTimestamp
    ? page.getByText(runTimestamp, { exact: true }).first()
    : page.getByText(/^Aug 17, 2026,/).first();
  if (await runLink.count()) {
    await runLink.click();
    await page.waitForTimeout(1_500);
  }

  const results = [];
  for (const item of questions) {
    const button = page.getByRole("button").filter({ hasText: item.text }).first();
    if (!await button.count()) continue;
    await button.click();
    await page.waitForFunction((label) => {
      const text = document.body?.innerText || "";
      return text.includes(label) && text.includes("Assessment:") && !text.includes("Loading...");
    }, item.text, { timeout: 60_000, polling: 500 }).catch(() => {});
    await page.waitForTimeout(1_200);
    const body = (await page.locator("body").innerText())
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]")
      .replace(/\s+/g, " ");
    const assessment = body.match(/Assessment:\s*(Passed|Failed)/i)?.[1] || null;
    const scoreReason = body.match(/Score reason:\s*([^Q]+?)(?=Question|$)/i)?.[1]?.trim() || null;
    const output = resolve(outputDir, `dbx-genie-eval-${item.key}.png`);
    await page.screenshot({ path: output, fullPage: false });
    const anchor = body.lastIndexOf(item.text);
    results.push({
      key: item.key,
      assessment,
      scoreReason,
      output,
      excerpt: body.slice(Math.max(0, anchor), Math.max(0, anchor) + 1500),
    });
  }

  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
