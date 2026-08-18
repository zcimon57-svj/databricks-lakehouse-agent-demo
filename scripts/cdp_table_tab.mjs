#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const [tab, outputArg] = process.argv.slice(2);
const allowed = new Set(["Overview", "Sample Data", "Details", "Permissions", "History", "Lineage", "Insights", "Quality"]);
if (!allowed.has(tab) || !outputArg) {
  console.error("Usage: node scripts/cdp_table_tab.mjs <Overview|Sample Data|Details|Permissions|History|Lineage|Insights|Quality> <screenshot.png>");
  process.exit(2);
}

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

  const nudge = page.getByRole("button", { name: "Dismiss learning nudge" });
  if (await nudge.count()) await nudge.first().click().catch(() => {});

  const clickVisibleButton = async (label) => {
    await page.waitForFunction((value) => [...document.querySelectorAll("button")].some((element) => {
      const rect = element.getBoundingClientRect();
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      return (text === value || text === `${value} Beta`) && rect.width > 0 && rect.height > 0;
    }), label, { timeout: 90_000 });
    const box = await page.evaluate((value) => {
      const element = [...document.querySelectorAll("button")].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        const text = (candidate.textContent || "").replace(/\s+/g, " ").trim();
        return (text === value || text === `${value} Beta`) && rect.width > 0 && rect.height > 0;
      });
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }, label);
    if (!box) throw new Error(`Visible button disappeared: ${label}`);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  };
  await clickVisibleButton(tab);
  await page.waitForTimeout(tab === "Sample Data" ? 12_000 : 5_000);
  await page.screenshot({ path: resolve(outputArg), fullPage: false });
  const body = await page.locator("body").innerText();
  console.log(JSON.stringify({
    tab,
    output: resolve(outputArg),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(body),
    hasOrders: body.includes("orders"),
  }));
} finally {
  await browser.close();
}
