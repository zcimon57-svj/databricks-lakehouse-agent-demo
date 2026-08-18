#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-select-compute.png");
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
    (element.textContent || "").trim() === "Select compute"
    && element.getBoundingClientRect().width > 0
  )), null, { timeout: 90_000 });
  const box = await page.evaluate(() => {
    const element = [...document.querySelectorAll("button")].find((candidate) => (
      (candidate.textContent || "").trim() === "Select compute"
      && candidate.getBoundingClientRect().width > 0
    ));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(2_000);
  await page.screenshot({ path: output, fullPage: false });

  const text = await page.locator("body").innerText();
  console.log(JSON.stringify({
    output,
    hasStarterWarehouse: text.includes("Serverless Starter Warehouse"),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
  }));
} finally {
  await browser.close();
}
