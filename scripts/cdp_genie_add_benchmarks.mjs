#!/usr/bin/env node

import { chromium } from "playwright";

const benchmarks = [
  {
    question: "哪个区域未解决的 P1 售后工单最多？请给出各区域数量，并说明使用的数据表。",
    sql: `SELECT customer_region, COUNT(*) AS unresolved_p1_count
FROM workspace.dbx_demo_20260814.after_sales_cases
WHERE priority = 'P1'
  AND ticket_status NOT IN ('resolved', 'closed')
GROUP BY customer_region
ORDER BY unresolved_p1_count DESC`,
    note: "区域数量必须为西南 3、华南 2、东北 1、华北 1，并说明使用 after_sales_cases。",
  },
  {
    question: "统计所有状态的退款记录时，哪种退款原因对应的退款总金额最高？请给出原因和金额。",
    sql: `SELECT reason, ROUND(SUM(amount), 2) AS total_refund_amount
FROM workspace.dbx_demo_20260814.refunds
GROUP BY reason
ORDER BY total_refund_amount DESC
LIMIT 1`,
    note: "统计所有状态而不是只统计 approved；最高指总金额而不是单笔金额；结果应为与描述不符，80135.35。",
  },
  {
    question: "三个数据库事故的根因和解决办法是什么？",
    sql: `SELECT incident_id, root_cause, resolution
FROM workspace.dbx_demo_20260814.dbops_incident_context
ORDER BY incident_id`,
    note: "必须覆盖 INC-001、INC-002、INC-003，不得生成额外事故或声称已经执行修复。",
  },
];

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

  for (let index = 0; index < benchmarks.length; index += 1) {
    const item = benchmarks[index];
    let dialog = page.getByRole("dialog");
    if (!await dialog.count()) {
      await page.getByRole("button", { name: "Add benchmark", exact: true }).first().click();
      dialog = page.getByRole("dialog");
    }
    await dialog.waitFor({ state: "visible", timeout: 30_000 });
    await dialog.locator('textarea[placeholder*="ARR over the last 4 years"]').fill(item.question);
    await dialog.locator('textarea[aria-label="The ground truth SQL statement that correctly answers your benchmark question"]').fill(item.sql);
    await dialog.locator('textarea[placeholder*="year-over-year comparison"]').fill(item.note);
    await dialog.getByRole("button", { name: "Add benchmark", exact: true }).click();
    await dialog.waitFor({ state: "hidden", timeout: 60_000 });
    await page.waitForTimeout(1_500);
  }

  await page.waitForFunction(() => (document.body?.innerText || "").includes("Questions (3)"), null, { timeout: 60_000 });
  console.log(JSON.stringify({ added: benchmarks.length, questionsVisible: true }));
} finally {
  await browser.close();
}
