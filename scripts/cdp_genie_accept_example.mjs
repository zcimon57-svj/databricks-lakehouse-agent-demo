#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-example-accepted.png");
const question = "哪些负面、高优先级且未解决的售后工单应优先处理？";
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

  const dialog = page.getByRole("dialog");
  const inputs = dialog.locator("input");
  let title = null;
  for (let index = 0; index < await inputs.count(); index += 1) {
    const candidate = inputs.nth(index);
    if (/negative sentiment/i.test(await candidate.inputValue())) {
      title = candidate;
      break;
    }
  }
  if (!title) throw new Error("Suggested query title input was not found");
  await title.fill(question);

  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((element) => (
    (element.textContent || "").trim() === "Accept" && element.getBoundingClientRect().width > 0
  )), null, { timeout: 30_000 });
  const box = await page.evaluate(() => {
    const element = [...document.querySelectorAll("button")].find((candidate) => (
      (candidate.textContent || "").trim() === "Accept" && candidate.getBoundingClientRect().width > 0
    ));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(4_000);
  await page.screenshot({ path: output, fullPage: false });
  const text = await page.locator("body").innerText();

  console.log(JSON.stringify({
    output,
    questionSaved: text.includes(question) || !text.includes("Review Suggested Queries"),
  }));
} finally {
  await browser.close();
}
