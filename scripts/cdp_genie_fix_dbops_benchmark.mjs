#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-benchmark-fixed.png");
const correctedSql = `SELECT incident_id, root_cause, resolution
FROM workspace.dbx_demo_20260814.dbops_incident_context
ORDER BY incident_id`;

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

  const questions = page.getByText(/^Questions \(\d+\)$/).first();
  if (await questions.count()) {
    await questions.click();
    await page.waitForTimeout(1_000);
  }

  const editButtons = page.getByRole("button", { name: "Edit benchmark" });
  if ((await editButtons.count()) < 1) throw new Error("No benchmark edit button is visible");
  await editButtons.first().click();

  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 30_000 });
  const sqlEditor = dialog.locator(".monaco-editor").first();
  await sqlEditor.click({ position: { x: 220, y: 70 } });
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.type(correctedSql, { delay: 1 });
  await page.waitForTimeout(500);
  const editorText = (await dialog.innerText()).replace(/\s+/g, " ");
  if (editorText.includes("resolution_summary")) throw new Error("Monaco SQL replacement did not remove the old query");

  const save = dialog.getByRole("button", { name: /Save|Update/i }).last();
  await save.click();
  await dialog.waitFor({ state: "hidden", timeout: 60_000 });
  await page.waitForTimeout(1_500);
  await page.screenshot({ path: output, fullPage: false });

  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  console.log(JSON.stringify({
    output,
    hasSuccess: body.includes("Benchmark updated successfully"),
    excerpt: body.slice(-1400),
  }));
} finally {
  await browser.close();
}
