#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-benchmark-add.png");
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
  const add = page.getByRole("button", { name: "Add benchmark", exact: true });
  await add.waitFor({ state: "visible", timeout: 30_000 });
  await add.click();
  await page.waitForTimeout(2_000);
  await page.screenshot({ path: output, fullPage: false });
  const fields = await page.locator("input,textarea,[role='textbox'],[contenteditable='true']").evaluateAll((elements) => elements
    .filter((element) => element.getBoundingClientRect().width > 0)
    .map((element) => ({
      tag: element.tagName,
      aria: element.getAttribute("aria-label") || "",
      placeholder: element.getAttribute("placeholder") || "",
      testid: element.getAttribute("data-testid") || "",
    })));
  const buttons = (await page.locator("button").allTextContents())
    .map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean).slice(-30);
  console.log(JSON.stringify({ output, fields, buttons }, null, 2));
} finally {
  await browser.close();
}
