#!/usr/bin/env node

import { chromium } from "playwright";

const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
const redactPath = (value) => value
  .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "[id]")
  .replace(/\b\d{8,}\b/g, "[id]")
  .slice(0, 180);

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

  const entries = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => ({
    name: entry.name,
    duration: Math.round(entry.duration),
    transferSize: entry.transferSize,
    responseStatus: entry.responseStatus || null,
  })));

  const summarized = entries.map((entry) => {
    let hostname = "unknown";
    let pathname = "unknown";
    try {
      const url = new URL(entry.name);
      hostname = url.hostname;
      pathname = redactPath(url.pathname);
    } catch {
      pathname = redactPath(entry.name);
    }
    return { ...entry, hostname, pathname };
  });

  const suspicious = summarized.filter((entry) => (
    entry.responseStatus === 0
    || (entry.responseStatus !== null && entry.responseStatus >= 400)
    || entry.duration >= 15_000
  )).slice(-80);

  console.log(JSON.stringify({
    resourceCount: summarized.length,
    recent: summarized.slice(-40),
    suspicious,
  }, null, 2));
} finally {
  await browser.close();
}
