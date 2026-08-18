#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const [target = "schema", outputArg = "/tmp/databricks-catalog-demo.png"] = process.argv.slice(2);
if (!["schema", "orders"].includes(target)) {
  console.error("Target must be schema or orders");
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

  const visibleAnchorExists = (label) => [...document.querySelectorAll("a")].some((element) => {
    const rect = element.getBoundingClientRect();
    return (element.textContent || "").trim() === label && rect.width > 0 && rect.height > 0;
  });
  const clickVisibleAnchor = async (label, timeout = 90_000) => {
    await page.waitForFunction(visibleAnchorExists, label, { timeout });
    await page.evaluate((value) => {
      const element = [...document.querySelectorAll("a")].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return (candidate.textContent || "").trim() === value && rect.width > 0 && rect.height > 0;
      });
      element?.click();
    }, label);
  };

  if (!(await page.evaluate(visibleAnchorExists, "dbx_demo_20260814"))) {
    if (!(await page.evaluate(visibleAnchorExists, "workspace"))) {
      await clickVisibleAnchor("Catalog");
    }
    await clickVisibleAnchor("workspace");
    await clickVisibleAnchor("dbx_demo_20260814");
  }
  if (!(await page.evaluate(visibleAnchorExists, "orders"))) {
    await clickVisibleAnchor("dbx_demo_20260814");
  }

  if (target === "orders") {
    await clickVisibleAnchor("orders");
  }

  await page.waitForTimeout(4_000);
  await page.screenshot({ path: resolve(outputArg), fullPage: false });
  const visibleText = await page.locator("body").innerText();
  console.log(JSON.stringify({
    target,
    output: resolve(outputArg),
    hasDemoSchema: visibleText.includes("dbx_demo_20260814"),
    hasOrders: visibleText.includes("orders"),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(visibleText),
  }));
} finally {
  await browser.close();
}
