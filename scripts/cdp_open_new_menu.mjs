#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-new-menu.png");
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

  const button = page.getByTestId("NewDropdown");
  await button.click();
  await page.waitForTimeout(1_500);
  await page.screenshot({ path: output, fullPage: false });
  const text = await page.locator("body").innerText();
  console.log(JSON.stringify({
    output,
    entries: ["Notebook", "Query", "Dashboard", "Genie", "Job", "Pipeline", "App", "Upload data"]
      .filter((entry) => text.toLowerCase().includes(entry.toLowerCase())),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
  }));
} finally {
  await browser.close();
}
