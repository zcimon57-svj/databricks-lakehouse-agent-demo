#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-google-state.png");
const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
try {
  const context = browser.contexts()[0];
  const page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname === "accounts.google.com";
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("Google account page is not open");
  await page.evaluate(() => {
    const redact = (value) => String(value || "")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]");
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) walker.currentNode.nodeValue = redact(walker.currentNode.nodeValue);
    for (const element of document.querySelectorAll("[data-identifier],[data-profileindex],img")) {
      element.style.filter = "blur(12px)";
    }
  });
  await page.screenshot({ path: output, fullPage: false });
  const text = (await page.locator("body").innerText())
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]");
  console.log(JSON.stringify({
    output,
    chooseAccount: /Choose an account/i.test(text),
    requiresPassword: /Enter your password|Forgot password/i.test(text),
    hasContinue: /Continue/i.test(text),
    selectorCounts: {
      dataIdentifier: await page.locator("[data-identifier]").count(),
      dataEmail: await page.locator("[data-email]").count(),
      dataProfileIndex: await page.locator("[data-profileindex]").count(),
      listItem: await page.locator("li").count(),
      roleLink: await page.locator('[role="link"]').count(),
      roleButton: await page.locator('[role="button"]').count(),
    },
  }));
} finally {
  await browser.close();
}
