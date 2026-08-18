#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-benchmark-questions.png");
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
    await page.waitForTimeout(1_500);
  }

  const questions = page.getByText(/^Questions \(\d+\)$/).first();
  if (await questions.count()) {
    await questions.click();
    await page.waitForTimeout(1_500);
  }

  await page.screenshot({ path: output, fullPage: false });
  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  const buttons = await page.getByRole("button").allTextContents();
  console.log(JSON.stringify({
    output,
    hasQuestions: body.includes("Questions (3)"),
    hasEvaluations: body.includes("Evaluations"),
    buttons: buttons.filter(Boolean).slice(-30),
    excerpt: body.slice(-1800),
  }));
} finally {
  await browser.close();
}
