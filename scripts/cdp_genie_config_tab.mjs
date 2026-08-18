#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const [tab, outputArg] = process.argv.slice(2);
if (!["About", "Sources", "Instructions", "Examples"].includes(tab) || !outputArg) {
  console.error("Usage: node scripts/cdp_genie_config_tab.mjs <About|Sources|Instructions|Examples> <screenshot.png>");
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

  await page.waitForFunction((value) => [...document.querySelectorAll("*")].some((element) => {
    const rect = element.getBoundingClientRect();
    return (element.textContent || "").trim() === value
      && rect.x > 900 && rect.y < 150 && rect.width > 0 && rect.height > 0;
  }), tab, { timeout: 30_000 });
  const box = await page.evaluate((value) => {
    const element = [...document.querySelectorAll("*")].find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return (candidate.textContent || "").trim() === value
        && rect.x > 900 && rect.y < 150 && rect.width > 0 && rect.height > 0;
    });
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }, tab);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(3_000);
  await page.screenshot({ path: output, fullPage: false });

  const text = await page.locator("body").innerText();
  console.log(JSON.stringify({
    tab,
    output,
    hasAfterSales: text.includes("after_sales_cases"),
    hasDbops: text.includes("dbops_incident_context"),
    hasInstructions: text.includes("Instructions"),
    hasExamples: text.includes("Examples"),
  }));
} finally {
  await browser.close();
}
