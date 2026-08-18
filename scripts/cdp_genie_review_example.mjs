#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-review-example.png");
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

  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((element) => (
    (element.textContent || "").trim() === "Review" && element.getBoundingClientRect().width > 0
  )), null, { timeout: 30_000 });
  const box = await page.evaluate(() => {
    const element = [...document.querySelectorAll("button")].find((candidate) => (
      (candidate.textContent || "").trim() === "Review" && candidate.getBoundingClientRect().width > 0
    ));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(3_000);
  await page.screenshot({ path: output, fullPage: false });

  const text = await page.locator("body").innerText();
  const buttons = await page.locator("button").allTextContents();
  console.log(JSON.stringify({
    output,
    hasQueueQuery: text.includes("after_sales_cases") || text.includes("dbops_incident_context"),
    buttons: buttons.map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean).slice(-30),
  }));
} finally {
  await browser.close();
}
