#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-current-answer.png");
const question = "基于上面的分析，哪些步骤可以自动生成建议或草稿，哪些真实操作必须经过人工审批？";
const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
const startedAt = Date.now();
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
  await page.waitForFunction((expectedQuestion) => {
    const text = document.body?.innerText || "";
    const completions = (text.match(/Thinking complete/g) || []).length;
    return text.includes(expectedQuestion)
      && completions >= 3
      && !/Thinking\.\.\.|Genie is (generating|thinking|working)/i.test(text);
  }, question, { timeout: 360_000, polling: 1_000 });
  await page.waitForTimeout(2_000);
  await page.screenshot({ path: output, fullPage: false });
  const body = (await page.locator("body").innerText())
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]")
    .replace(/\s+/g, " ");
  console.log(JSON.stringify({
    output,
    elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
    completed: true,
    excerpt: body.slice(-1800),
  }));
} finally {
  await browser.close();
}
