#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const [tab = "lakebase", outputArg = "/tmp/databricks-compute-tab.png"] = process.argv.slice(2);
const labels = {
  warehouses: "SQL warehouses",
  lakebase: "Lakebase Preview",
  lakebase_home: "Lakebase Preview",
};

if (!labels[tab]) {
  console.error(`Usage: node scripts/cdp_compute_tab.mjs <${Object.keys(labels).join("|")}> [screenshot.png]`);
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

  const compute = page.getByRole("link", { name: "Compute", exact: true });
  await compute.waitFor({ state: "visible", timeout: 30_000 });
  await compute.click();
  const target = tab.startsWith("lakebase")
    ? page.getByTestId("clusters-main--database-instances-tab")
    : page.getByRole("button", { name: labels[tab], exact: true });
  await target.waitFor({ state: "visible", timeout: 30_000 });
  await target.click();
  if (tab === "lakebase_home") {
    const go = page.getByRole("button", { name: /Go to Lakebase Postgres/i });
    await go.waitFor({ state: "visible", timeout: 30_000 });
    await go.click();
  }
  await page.waitForTimeout(4_000);
  await page.screenshot({ path: resolve(outputArg), fullPage: false });

  const summary = await page.evaluate(() => ({
    headings: [...document.querySelectorAll("h1,h2,h3")]
      .map((element) => (element.textContent || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 12),
    body: (document.body?.innerText || "")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]")
      .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,36}\b/gi, "[对象ID已隐藏]")
      .replace(/\s+/g, " ")
      .slice(0, 1200),
  }));
  console.log(JSON.stringify({ tab, output: resolve(outputArg), summary }));
} finally {
  await browser.close();
}
