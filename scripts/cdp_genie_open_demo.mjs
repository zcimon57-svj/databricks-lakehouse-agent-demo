#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-demo-open.png");
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
  const agents = page.getByRole("link", { name: "Genie Agents", exact: true });
  await agents.waitFor({ state: "visible", timeout: 30_000 });
  await agents.click();
  const demo = page.getByRole("link", { name: "Customer Service and Order Management", exact: true });
  await demo.waitFor({ state: "visible", timeout: 90_000 });
  await demo.click();
  await page.waitForFunction(() => {
    const text = document.body?.innerText || "";
    return text.includes("哪个区域未解决的 P1 售后工单最多")
      && text.includes("Configure");
  }, null, { timeout: 90_000 });
  await page.waitForTimeout(3_000);
  await page.screenshot({ path: output, fullPage: false });
  console.log(JSON.stringify({ output, opened: true }));
} finally {
  await browser.close();
}
