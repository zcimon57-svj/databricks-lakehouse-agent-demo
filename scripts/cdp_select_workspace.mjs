#!/usr/bin/env node

import { chromium } from "playwright";

const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname === "accounts.cloud.databricks.com";
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("Databricks workspace selector is not open");
  const workspace = page.locator('a[aria-label="Continue with workspace"]');
  await workspace.waitFor({ state: "visible", timeout: 30_000 });
  await workspace.click();
  await page.waitForTimeout(8_000);
  console.log(JSON.stringify({
    host: new URL(page.url()).hostname,
    hasWorkspaceNavigation: /Catalog|SQL Editor|Genie Agents/.test(await page.locator("body").innerText().catch(() => "")),
  }));
} finally {
  await browser.close();
}
