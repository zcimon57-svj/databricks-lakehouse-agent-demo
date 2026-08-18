#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-benchmark-running.png");
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
  const runAll = page.getByRole("button", { name: "Run all benchmarks", exact: true });
  await runAll.waitFor({ state: "visible", timeout: 30_000 });
  await runAll.click();
  await page.waitForTimeout(1_500);
  const dialog = page.getByRole("dialog");
  if (await dialog.count()) {
    const confirm = dialog.getByRole("button", { name: /Run.*benchmark/i });
    if (await confirm.count()) await confirm.last().click();
  }
  await page.waitForTimeout(3_000);
  await page.screenshot({ path: output, fullPage: false });
  const text = (await page.locator("body").innerText())
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]");
  console.log(JSON.stringify({
    output,
    hasRunning: /Running|In progress|Pending/i.test(text),
    excerpt: text.replace(/\s+/g, " ").slice(-1200),
  }));
} finally {
  await browser.close();
}
