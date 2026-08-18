#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const key = process.argv[2];
const output = resolve(process.argv[3] || `/tmp/databricks-genie-${key || "answer"}.png`);
const questions = {
  refund_all: {
    text: "统计所有状态的退款记录时，哪种退款原因对应的退款总金额最高？请给出原因、金额和使用的数据表。",
    expected: ["与描述不符", "refunds"],
  },
  dbops: {
    text: "三个数据库事故的根因和解决办法是什么？请按事故编号列出，并明确真实修复操作需要人工审批。",
    expected: ["INC-001", "INC-002", "INC-003"],
  },
  approval: {
    text: "基于上面的分析，哪些步骤可以自动生成建议或草稿，哪些真实操作必须经过人工审批？",
    expected: ["人工审批"],
  },
};

if (!questions[key]) {
  console.error(`Usage: node scripts/cdp_genie_ask_question.mjs <${Object.keys(questions).join("|")}> <output.png>`);
  process.exit(2);
}

const item = questions[key];
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

  if (await page.getByRole("dialog").count()) await page.keyboard.press("Escape");
  const configPanelVisible = await page.getByText("Teach your agent how to answer questions with curated examples.", { exact: true }).isVisible().catch(() => false);
  if (configPanelVisible) {
    const closePanel = page.getByRole("button", { name: "Close", exact: true }).last();
    if (await closePanel.isVisible().catch(() => false)) await closePanel.click();
    else {
      const toggled = await page.evaluate(() => {
        const button = [...document.querySelectorAll("button")].find((candidate) => {
          const rect = candidate.getBoundingClientRect();
          return (candidate.textContent || "").trim() === "Configure" && rect.width > 0 && rect.height > 0;
        });
        button?.click();
        return Boolean(button);
      });
      if (!toggled) throw new Error("Visible Configure toggle was not found");
    }
    await page.waitForTimeout(800);
  }

  const prompt = page.locator('textarea[aria-label="Prompt Input"]').first();
  await prompt.waitFor({ state: "visible", timeout: 30_000 });
  const completionCountBefore = ((await page.locator("body").innerText()).match(/Thinking complete/g) || []).length;
  await prompt.fill(item.text);
  const send = page.getByRole("button", { name: "Send", exact: true });
  await send.waitFor({ state: "visible", timeout: 30_000 });
  await send.click();

  await page.waitForFunction(({ expected, priorCompletions }) => {
    const text = document.body?.innerText || "";
    return expected.every((token) => text.includes(token))
      && (text.match(/Thinking complete/g) || []).length > priorCompletions
      && !/Thinking\.\.\.|Genie is (generating|thinking|working)/i.test(text);
  }, { expected: item.expected, priorCompletions: completionCountBefore }, { timeout: 360_000, polling: 1_000 });
  await page.waitForTimeout(3_000);
  await page.screenshot({ path: output, fullPage: false });
  const body = (await page.locator("body").innerText())
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[对象ID已隐藏]");
  console.log(JSON.stringify({
    key,
    output,
    elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
    expectedFound: item.expected.every((token) => body.includes(token)),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(body),
    excerpt: body.replace(/\s+/g, " ").slice(-1800),
  }));
} finally {
  await browser.close();
}
