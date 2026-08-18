#!/usr/bin/env node

import { chromium } from "playwright";
import { resolve } from "node:path";

const output = resolve(process.argv[2] || "/tmp/databricks-genie-instructions-saved.png");
const instructions = `- 默认使用中文回答，并展示或概述实际执行的只读 SQL。
- “未解决工单”定义为 ticket_status NOT IN ('resolved', 'closed')。
- 售后问题优先使用 after_sales_cases；退款使用 refunds；政策与审批要求使用 support_policies。
- 数据库事故优先使用 dbops_incident_context，处置建议必须参考 runbooks。
- 只允许读取、分析、总结与生成草稿。退款、改订单、发客户消息、变更工单状态或执行数据库修复都必须明确标注“需要人工审批”，不得生成或执行变更 SQL。
- 无法从已连接数据确认时回答“未知”，不要猜测。`;

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

  const editors = page.locator(".monaco-editor");
  await editors.first().waitFor({ state: "visible", timeout: 30_000 });
  let target = null;
  for (let index = 0; index < await editors.count(); index += 1) {
    const candidate = editors.nth(index);
    const box = await candidate.boundingBox();
    if (box && box.x > 900 && box.width > 200 && box.height > 100) {
      target = { locator: candidate, box };
      break;
    }
  }
  if (!target) throw new Error("General Instructions editor was not found");

  await page.mouse.click(target.box.x + 40, target.box.y + 35);
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(instructions);
  await page.waitForTimeout(1_000);

  const editorText = await target.locator.locator(".view-lines").innerText().catch(() => "");
  if (!editorText.includes("只读") && !editorText.includes("after_sales_cases")) {
    throw new Error("Fixed safety instructions were not inserted");
  }

  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((element) => (
    (element.textContent || "").trim() === "Save"
    && element.getBoundingClientRect().width > 0
    && !element.disabled
  )), null, { timeout: 30_000 });
  const saveBox = await page.evaluate(() => {
    const element = [...document.querySelectorAll("button")].find((candidate) => (
      (candidate.textContent || "").trim() === "Save"
      && candidate.getBoundingClientRect().width > 0
      && !candidate.disabled
    ));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  await page.mouse.click(saveBox.x + saveBox.width / 2, saveBox.y + saveBox.height / 2);
  await page.waitForTimeout(3_000);
  await page.screenshot({ path: output, fullPage: false });

  console.log(JSON.stringify({ output, saved: true, instructionLines: instructions.split("\n").length }));
} finally {
  await browser.close();
}
