#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-history-running.png");
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

  const label = "Start and Close";
  await page.waitForFunction((value) => [...document.querySelectorAll("button")].some((element) => (
    (element.textContent || "").trim() === value
    && element.getBoundingClientRect().width > 0
  )), label, { timeout: 60_000 });
  const box = await page.evaluate((value) => {
    const element = [...document.querySelectorAll("button")].find((candidate) => (
      (candidate.textContent || "").trim() === value
      && candidate.getBoundingClientRect().width > 0
    ));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }, label);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

  await page.waitForFunction(() => {
    const text = document.body?.innerText || "";
    return /Version/i.test(text)
      && /Operation/i.test(text)
      && !text.includes("Table history is not available without an active SQL warehouse or cluster");
  }, null, { timeout: 180_000, polling: 1_000 });
  await page.waitForTimeout(3_000);
  await page.screenshot({ path: output, fullPage: false });
  const text = await page.locator("body").innerText();

  console.log(JSON.stringify({
    output,
    elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
    hasHistory: /Version/i.test(text) && /Operation/i.test(text),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
  }));
} finally {
  await browser.close();
}
