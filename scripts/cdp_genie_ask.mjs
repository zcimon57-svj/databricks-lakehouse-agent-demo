#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-answer.png");
const question = "哪个区域未解决的 P1 售后工单最多？请给出各区域数量，并说明使用的数据表。";
const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
const startedAt = Date.now();

try {
  const context = browser.contexts()[0];
  const page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname.startsWith("dbc-");
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("No workspace page is open");

  const topChatBox = await page.evaluate(() => {
    const element = [...document.querySelectorAll("button")].find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return (candidate.textContent || "").trim() === "Chat"
        && rect.x > 600 && rect.y < 110 && rect.width > 0;
    });
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  if (topChatBox) {
    await page.mouse.click(topChatBox.x + topChatBox.width / 2, topChatBox.y + topChatBox.height / 2);
    await page.waitForTimeout(1_500);
  }

  const prompt = page.locator('textarea[aria-label="Prompt Input"]').first();
  await prompt.waitFor({ state: "visible", timeout: 30_000 });
  await prompt.fill(question);

  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((element) => (
    element.getAttribute("aria-label") === "Send"
    && element.getBoundingClientRect().width > 0
    && !element.disabled
  )), null, { timeout: 30_000 });
  const sendBox = await page.evaluate(() => {
    const element = [...document.querySelectorAll("button")].find((candidate) => (
      candidate.getAttribute("aria-label") === "Send"
      && candidate.getBoundingClientRect().width > 0
      && !candidate.disabled
    ));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.mouse.click(sendBox.x + sendBox.width / 2, sendBox.y + sendBox.height / 2);

  await page.waitForFunction(() => {
    const text = document.body?.innerText || "";
    return text.includes("西南") && text.includes("华南") && text.includes("after_sales_cases");
  }, null, { timeout: 240_000, polling: 1_000 });
  await page.waitForTimeout(4_000);
  await page.screenshot({ path: output, fullPage: false });
  const text = await page.locator("body").innerText();

  console.log(JSON.stringify({
    output,
    elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
    hasSouthwest: text.includes("西南"),
    hasSouthChina: text.includes("华南"),
    hasSource: text.includes("after_sales_cases"),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
  }));
} finally {
  await browser.close();
}
