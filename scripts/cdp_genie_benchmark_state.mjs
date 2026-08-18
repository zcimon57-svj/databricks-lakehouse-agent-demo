#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-benchmark-state.png");
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
  await page.screenshot({ path: output, fullPage: false });
  const text = (await page.locator("body").innerText())
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]");
  const assessed = text.match(/(\d+)\s+of\s+(\d+)\s+assessed/i);
  console.log(JSON.stringify({
    output,
    assessed: assessed ? Number(assessed[1]) : null,
    total: assessed ? Number(assessed[2]) : null,
    generating: /Genie is generating an answer/i.test(text),
    evaluating: /Evaluating|Scoring/i.test(text),
    hasError: /Failed|Error/i.test(text),
    excerpt: text.replace(/\s+/g, " ").slice(-1200),
  }));
} finally {
  await browser.close();
}
