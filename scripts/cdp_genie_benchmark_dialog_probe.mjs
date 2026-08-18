#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const index = Number(process.argv[2] || "0");
const output = resolve(process.argv[3] || "/tmp/databricks-genie-benchmark-dialog.png");
const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");

try {
  const context = browser.contexts()[0];
  const page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname.endsWith(".databricks.com");
    } catch {
      return false;
    }
  });
  if (!page) throw new Error("No workspace page is open");

  const evaluations = page.getByRole("link", { name: "Evaluations", exact: true });
  if (await evaluations.count()) {
    await evaluations.click();
    await page.waitForTimeout(800);
  }
  const questions = page.getByText(/^Questions \(\d+\)$/).first();
  await questions.click();
  await page.waitForTimeout(800);
  const edits = page.getByRole("button", { name: "Edit benchmark" });
  await edits.nth(index).click();

  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 30_000 });
  const textareas = await dialog.locator("textarea").evaluateAll((nodes) => nodes.map((node) => ({
    aria: node.getAttribute("aria-label"),
    placeholder: node.getAttribute("placeholder"),
    value: node.value,
    className: node.className,
  })));
  const editables = await dialog.locator('[contenteditable="true"]').evaluateAll((nodes) => nodes.map((node) => ({
    role: node.getAttribute("role"),
    aria: node.getAttribute("aria-label"),
    text: node.textContent,
    className: node.className,
  })));
  const buttons = await dialog.getByRole("button").evaluateAll((nodes) => nodes.map((node) => ({
    text: node.textContent?.trim(),
    aria: node.getAttribute("aria-label"),
  })));
  await page.screenshot({ path: output, fullPage: false });
  console.log(JSON.stringify({ index, output, textareas, editables, buttons }));
  await page.keyboard.press("Escape");
} finally {
  await browser.close();
}
