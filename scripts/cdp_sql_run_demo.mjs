#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const [scenario, outputArg] = process.argv.slice(2);
const queries = {
  after_sales: {
    sql: `-- 自然语言问题：哪个区域未解决的 P1 售后工单最多？
SELECT customer_region, COUNT(*) AS ticket_count
FROM workspace.dbx_demo_20260814.after_sales_cases
WHERE priority = 'P1'
  AND ticket_status NOT IN ('resolved', 'closed')
GROUP BY customer_region
ORDER BY ticket_count DESC, customer_region
LIMIT 5;`,
    expected: ["西南", "华南"],
  },
  after_sales_queue: {
    sql: `-- 智能售后：负面、高优先级、未解决工单行动队列（合成数据）
SELECT ticket_id, is_vip, customer_region, category, priority,
       ticket_status, refund_status, summary
FROM workspace.dbx_demo_20260814.after_sales_cases
WHERE sentiment = 'negative'
  AND priority IN ('P1', 'P2')
  AND ticket_status NOT IN ('resolved', 'closed')
ORDER BY is_vip DESC, priority, created_ts
LIMIT 30;`,
    expected: ["T000697", "T000616", "T000353"],
  },
  dbops: {
    sql: `-- 数据库智能运维：三个事故的根因和已验证解决办法是什么？
SELECT incident_id, instance_name, severity, symptom, root_cause, resolution
FROM workspace.dbx_demo_20260814.dbops_incident_context
ORDER BY started_ts;`,
    expected: ["INC-001", "INC-002", "INC-003"],
  },
};

if (!queries[scenario] || !outputArg) {
  console.error("Usage: node scripts/cdp_sql_run_demo.mjs <after_sales|after_sales_queue|dbops> <screenshot.png>");
  process.exit(2);
}

const output = resolve(outputArg);
const browser = await chromium.connectOverCDP(process.env.CDP_ENDPOINT || "http://127.0.0.1:9223");
const startedAt = Date.now();

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

  const editor = page.locator(".monaco-editor").first();
  await editor.waitFor({ state: "visible", timeout: 90_000 });
  const box = await editor.boundingBox();
  if (!box) throw new Error("SQL editor has no visible bounding box");
  await page.mouse.click(box.x + Math.min(180, box.width / 3), box.y + 35);
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(queries[scenario].sql);
  await page.waitForTimeout(1_000);

  const editorText = await page.locator(".view-lines").first().innerText().catch(() => "");
  if (!editorText.includes("dbx_demo_20260814")) {
    throw new Error("The fixed demo query was not inserted into the SQL editor");
  }

  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((element) => (
    /^Run all/.test((element.textContent || "").trim())
    && element.getBoundingClientRect().width > 0
  )), null, { timeout: 30_000 });
  const runBox = await page.evaluate(() => {
    const element = [...document.querySelectorAll("button")].find((candidate) => (
      /^Run all/.test((candidate.textContent || "").trim())
      && candidate.getBoundingClientRect().width > 0
    ));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.mouse.click(runBox.x + runBox.width / 2, runBox.y + runBox.height / 2);

  await page.waitForFunction((values) => {
    const text = document.body?.innerText || "";
    return values.every((value) => text.includes(value));
  }, queries[scenario].expected, { timeout: 180_000, polling: 1_000 });
  await page.waitForTimeout(2_000);
  await page.screenshot({ path: output, fullPage: false });

  const bodyText = await page.locator("body").innerText();
  console.log(JSON.stringify({
    scenario,
    output,
    elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
    expectedValuesVisible: queries[scenario].expected.every((value) => bodyText.includes(value)),
    hasEmailText: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(bodyText),
  }));
} finally {
  await browser.close();
}
