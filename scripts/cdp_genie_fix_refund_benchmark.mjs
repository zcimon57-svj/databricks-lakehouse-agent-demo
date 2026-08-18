#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-refund-benchmark-fixed.png");
const correctedQuestion = "统计所有状态的退款记录时，哪种退款原因对应的退款总金额最高？请给出原因和金额。";
const correctedSql = `SELECT reason, ROUND(SUM(amount), 2) AS total_refund_amount
FROM workspace.dbx_demo_20260814.refunds
GROUP BY reason
ORDER BY total_refund_amount DESC
LIMIT 1`;
const correctedNote = "统计所有状态而不是只统计 approved；最高指总金额而不是单笔金额；结果应为与描述不符，80135.35。";

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

  if (await page.getByRole("dialog").count()) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  const evaluations = page.getByRole("link", { name: "Evaluations", exact: true });
  if (await evaluations.count()) {
    await evaluations.click();
    await page.waitForTimeout(900);
  }
  const questions = page.getByText(/^Questions \(\d+\)$/).first();
  await questions.click();
  await page.waitForTimeout(900);

  const editButtons = page.getByRole("button", { name: "Edit benchmark" });
  if ((await editButtons.count()) < 2) throw new Error("Refund benchmark edit button is not visible");
  await editButtons.nth(1).click();

  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 30_000 });
  await dialog.locator('textarea[placeholder*="ARR over the last 4 years"]').fill(correctedQuestion);
  const sqlEditor = dialog.locator(".monaco-editor").first();
  await sqlEditor.click({ position: { x: 220, y: 70 } });
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(correctedSql, { delay: 1 });
  await page.waitForTimeout(500);
  const editorText = (await dialog.innerText()).replace(/\s+/g, " ");
  if (/\brefund_reason\b/.test(editorText) || /SUM\s*\(\s*refund_amount\s*\)/i.test(editorText)) {
    throw new Error("Monaco SQL replacement did not remove the old query");
  }
  await dialog.locator('textarea[placeholder*="year-over-year comparison"]').fill(correctedNote);
  await dialog.getByRole("button", { name: /Save|Update/i }).last().click();
  await dialog.waitFor({ state: "hidden", timeout: 60_000 });
  await page.waitForTimeout(1_500);
  await page.screenshot({ path: output, fullPage: false });

  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  console.log(JSON.stringify({
    output,
    hasSuccess: body.includes("Benchmark updated successfully"),
    correctedQuestionVisible: body.includes(correctedQuestion),
    correctedColumnsVisible: body.includes("SELECT reason") && body.includes("SUM(amount)"),
  }));
} finally {
  await browser.close();
}
