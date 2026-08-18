#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-configure.png");
const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
const clean = (value) => String(value || "")
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]")
  .trim()
  .slice(0, 160);

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

  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((element) => (
    (element.textContent || "").replace(/\s+/g, " ").trim() === "Configure"
    && element.getBoundingClientRect().width > 0
  )), null, { timeout: 90_000 });
  const box = await page.evaluate(() => {
    const element = [...document.querySelectorAll("button")].find((candidate) => (
      (candidate.textContent || "").replace(/\s+/g, " ").trim() === "Configure"
      && candidate.getBoundingClientRect().width > 0
    ));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(5_000);
  await page.screenshot({ path: output, fullPage: false });

  const info = await page.evaluate(() => ({
    headings: [...document.querySelectorAll("h1,h2,h3")]
      .map((element) => (element.textContent || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 30),
    fields: [...document.querySelectorAll("input,textarea,[role='combobox']")]
      .filter((element) => element.getBoundingClientRect().width > 0)
      .map((element) => ({
        tag: element.tagName,
        aria: element.getAttribute("aria-label") || "",
        placeholder: element.getAttribute("placeholder") || "",
        name: element.getAttribute("name") || "",
        value: element.value || "",
      })).slice(0, 40),
    buttons: [...document.querySelectorAll("button")]
      .filter((element) => element.getBoundingClientRect().width > 0)
      .map((element) => (element.textContent || element.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 100),
  }));

  console.log(JSON.stringify({
    output,
    headings: info.headings.map(clean),
    fields: info.fields.map((field) => Object.fromEntries(Object.entries(field).map(([key, value]) => [key, clean(value)]))),
    buttons: info.buttons.map(clean),
  }, null, 2));
} finally {
  await browser.close();
}
