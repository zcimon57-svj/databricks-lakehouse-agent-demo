#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const [action, outputArg] = process.argv.slice(2);
const actions = {
  home: "Home",
  workspace: "Workspace",
  catalog: "Catalog",
  jobs: "Jobs & Pipelines",
  sql: "SQL Editor",
  dashboards: "Dashboards",
  genie: "Genie Agents",
  warehouses: "SQL Warehouses",
  ingestion: "Data Ingestion",
};

if (!actions[action] || !outputArg) {
  console.error(`Usage: node scripts/cdp_ui_navigate.mjs <${Object.keys(actions).join("|")}> <screenshot.png>`);
  process.exit(2);
}

const endpoint = process.env.CDP_ENDPOINT || "http://127.0.0.1:9223";
const output = resolve(outputArg);
const browser = await chromium.connectOverCDP(endpoint);

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

  const closeNotification = page.getByRole("button", { name: "Close notification" });
  if (await closeNotification.count()) {
    await closeNotification.first().click().catch(() => {});
  }

  const target = page.getByRole("link", { name: actions[action], exact: true });
  await target.waitFor({ state: "visible", timeout: 20_000 });
  await target.click();
  await page.waitForLoadState("domcontentloaded", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(3_000);
  await page.screenshot({ path: output, fullPage: false });

  const summary = await page.evaluate(() => ({
    headings: [...document.querySelectorAll("h1,h2,h3")]
      .map((element) => (element.textContent || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 12),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(document.body?.innerText || ""),
  }));

  console.log(JSON.stringify({
    action,
    hostname: new URL(page.url()).hostname,
    output,
    summary,
  }));
} finally {
  await browser.close();
}
