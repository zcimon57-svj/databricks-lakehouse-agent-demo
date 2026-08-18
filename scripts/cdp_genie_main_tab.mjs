#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const [tab, outputArg] = process.argv.slice(2);
if (!new Set(["Chat", "Monitor", "Benchmark"]).has(tab) || !outputArg) {
  console.error("Usage: node scripts/cdp_genie_main_tab.mjs <Chat|Monitor|Benchmark> <screenshot.png>");
  process.exit(2);
}
const output = resolve(outputArg);
const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
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

  const closeConfig = page.locator('button[aria-label="Close"],button[aria-label="Close panel"]');
  if (await closeConfig.count()) await closeConfig.last().click().catch(() => {});
  await page.waitForFunction((label) => [...document.querySelectorAll("*")].some((element) => {
    const rect = element.getBoundingClientRect();
    return (element.textContent || "").trim() === label
      && rect.width > 0 && rect.height > 0 && rect.y < 120;
  }), tab, { timeout: 30_000 });
  const box = await page.evaluate((label) => {
    const element = [...document.querySelectorAll("*")].find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return (candidate.textContent || "").trim() === label
        && rect.width > 0 && rect.height > 0 && rect.y < 120;
    });
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }, tab);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(4_000);
  await page.screenshot({ path: output, fullPage: false });
  const text = (await page.locator("body").innerText())
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]");
  console.log(JSON.stringify({
    tab,
    output,
    excerpt: text.replace(/\s+/g, " ").slice(-900),
  }));
} finally {
  await browser.close();
}
