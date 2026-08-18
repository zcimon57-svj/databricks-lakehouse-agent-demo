#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-selected.png");
const tables = [
  "after_sales_cases",
  "refunds",
  "support_policies",
  "dbops_incident_context",
  "runbooks",
  "orders",
  "customers",
];

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
  await dialog.getByText("Connect your data", { exact: true }).waitFor({ state: "visible", timeout: 30_000 });
  const search = dialog.locator('input[placeholder="Search"]').first();

  for (const table of tables) {
    await search.fill(table);
    await page.waitForFunction((value) => [...document.querySelectorAll("button")].some((element) => {
      const rect = element.getBoundingClientRect();
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      return rect.width > 0 && rect.height > 0
        && (element.getAttribute("aria-label") === value || text.startsWith(value));
    }), table, { timeout: 30_000 });
    const box = await page.evaluate((value) => {
      const element = [...document.querySelectorAll("button")].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        const text = (candidate.textContent || "").replace(/\s+/g, " ").trim();
        return rect.width > 0 && rect.height > 0
          && (candidate.getAttribute("aria-label") === value || text.startsWith(value));
      });
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }, table);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(350);
  }

  await search.fill("");
  await page.waitForTimeout(1_000);
  await page.screenshot({ path: output, fullPage: false });

  const create = dialog.getByRole("button", { name: "Create", exact: true });
  console.log(JSON.stringify({
    output,
    selectedTables: tables,
    createEnabled: await create.isEnabled(),
  }));
} finally {
  await browser.close();
}
