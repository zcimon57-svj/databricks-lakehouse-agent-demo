#!/usr/bin/env node

import { chromium } from "playwright";

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
  const controls = await page.evaluate(() => [...document.querySelectorAll("button,a")].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      tag: element.tagName,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
      aria: (element.getAttribute("aria-label") || "").slice(0, 80),
      title: (element.getAttribute("title") || "").slice(0, 80),
      testid: (element.getAttribute("data-testid") || "").slice(0, 120),
    };
  }).filter((item) => item.width > 0 && item.height > 0 && item.y < 150 && item.x > 1000));
  console.log(JSON.stringify(controls, null, 2));
} finally {
  await browser.close();
}
