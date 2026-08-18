#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-created.png");
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

  const dialog = page.getByRole("dialog");
  const create = dialog.getByRole("button", { name: "Create", exact: true });
  await create.click();
  await dialog.waitFor({ state: "hidden", timeout: 120_000 });
  await page.waitForTimeout(8_000);
  await page.screenshot({ path: output, fullPage: false });

  const state = await page.evaluate(() => {
    const text = document.body?.innerText || "";
    return {
      hasPromptInput: Boolean(document.querySelector('textarea[aria-label="Prompt Input"]')),
      hasConfigure: text.includes("Configure"),
      hasAfterSales: text.includes("after_sales_cases"),
      hasDbops: text.includes("dbops_incident_context"),
      hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),
    };
  });

  console.log(JSON.stringify({ output, state }));
} finally {
  await browser.close();
}
