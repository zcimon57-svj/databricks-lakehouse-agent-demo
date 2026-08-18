#!/usr/bin/env node

import { chromium } from "playwright";

const endpoint = process.env.CDP_ENDPOINT || "http://127.0.0.1:9223";
const browser = await chromium.connectOverCDP(endpoint);

const clean = (value) => String(value || "")
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 120);

try {
  const context = browser.contexts()[0];
  const page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname.endsWith("databricks.com");
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("No workspace page is open");

  const inventory = await page.evaluate(() => {
    const pick = (elements) => elements.map((element) => ({
      text: element.innerText || element.textContent || "",
      aria: element.getAttribute("aria-label") || "",
      title: element.getAttribute("title") || "",
      testid: element.getAttribute("data-testid") || "",
    }));
    return {
      headings: pick([...document.querySelectorAll("h1,h2,h3")].slice(0, 60)),
      buttons: pick([...document.querySelectorAll("button")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).slice(0, 120)),
      links: pick([...document.querySelectorAll("a")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).slice(0, 120)),
    };
  });

  const sanitize = (items) => items
    .map((item) => Object.fromEntries(
      Object.entries(item).map(([key, value]) => [key, clean(value)]),
    ))
    .filter((item) => Object.values(item).some(Boolean));

  console.log(JSON.stringify({
    headings: sanitize(inventory.headings),
    buttons: sanitize(inventory.buttons),
    links: sanitize(inventory.links),
  }, null, 2));
} finally {
  await browser.close();
}
