#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-new.png");
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

  const link = page.getByRole("link", { name: "New", exact: true });
  await link.click();
  await page.waitForTimeout(5_000);
  await page.screenshot({ path: output, fullPage: false });

  const fields = await page.evaluate(() => [...document.querySelectorAll("input,textarea,[role='combobox']")]
    .filter((element) => element.getBoundingClientRect().width > 0)
    .map((element) => ({
      tag: element.tagName,
      aria: element.getAttribute("aria-label") || "",
      placeholder: element.getAttribute("placeholder") || "",
      name: element.getAttribute("name") || "",
      role: element.getAttribute("role") || "",
    })).slice(0, 40));
  const buttons = await page.evaluate(() => [...document.querySelectorAll("button")]
    .filter((element) => element.getBoundingClientRect().width > 0)
    .map((element) => (element.textContent || element.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 60));

  console.log(JSON.stringify({
    output,
    fields: fields.map((field) => Object.fromEntries(Object.entries(field).map(([key, value]) => [key, clean(value)]))),
    buttons: buttons.map(clean),
  }, null, 2));
} finally {
  await browser.close();
}
