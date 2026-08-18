#!/usr/bin/env node

import { chromium } from "playwright";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

const [scenario, outputArg] = process.argv.slice(2);
const allowedScenarios = new Set([
  "workspace",
  "catalog",
  "ingestion",
  "jobs",
  "compute",
  "sql_after_sales",
  "sql_after_sales_queue",
  "sql_dbops",
  "genie",
  "genie_business",
  "genie_authoring",
]);
if (!allowedScenarios.has(scenario) || !outputArg) {
  console.error(`Usage: node scripts/record_workspace_ui.mjs <${[...allowedScenarios].join("|")}> <output.mp4>`);
  process.exit(2);
}

const endpoint = process.env.CDP_ENDPOINT || "http://127.0.0.1:9223";
const ffmpeg = process.env.PLAYWRIGHT_FFMPEG
  || resolve("node_modules/ffmpeg-static/ffmpeg");
const output = resolve(outputArg);
const fps = 4;
const frameIntervalMs = 1000 / fps;
const temporary = await mkdtemp(`${tmpdir()}/dbx-ui-recording-`);
await mkdir(dirname(output), { recursive: true });

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

function installPrivacyAndDemoOverlay() {
  const redact = (value) => String(value || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[账号已隐藏]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[对象ID已隐藏]");
  const sensitiveSelector = [
    '[data-testid*="profile" i]',
    '[data-testid*="user-menu" i]',
    '[data-testid*="account-menu" i]',
    'button[aria-label*="profile" i]',
    'button[aria-label*="account" i]',
    'button[aria-label*="user menu" i]',
  ].join(",");

  const scrub = (root) => {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const redacted = redact(node.nodeValue || "");
      if (redacted !== (node.nodeValue || "")) node.nodeValue = redacted;
    }
    for (const element of root.querySelectorAll?.("[aria-label],[title],[alt]") || []) {
      for (const attribute of ["aria-label", "title", "alt"]) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, redact(value));
      }
    }
    for (const element of root.querySelectorAll?.(sensitiveSelector) || []) {
      element.setAttribute("data-demo-private", "true");
    }
  };

  let style = document.getElementById("dbx-demo-recording-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "dbx-demo-recording-style";
    style.textContent = `
      [data-demo-private="true"] { filter: blur(12px) !important; }
      #dbx-demo-caption {
        position: fixed; left: 220px; bottom: 22px; z-index: 2147483646;
        max-width: 760px; padding: 12px 16px; border-radius: 10px;
        color: #fff; background: rgba(16, 24, 40, .92);
        box-shadow: 0 8px 30px rgba(0,0,0,.25);
        font-family: Arial, "Microsoft YaHei", sans-serif;
        pointer-events: none;
      }
      #dbx-demo-caption strong { display: block; font-size: 17px; line-height: 1.4; }
      #dbx-demo-caption span { display: block; margin-top: 3px; font-size: 13px; opacity: .88; }
      #dbx-demo-pointer {
        position: fixed; z-index: 2147483647; width: 24px; height: 24px;
        margin: -12px 0 0 -12px; border: 3px solid #ff5f46; border-radius: 50%;
        background: rgba(255,95,70,.16); pointer-events: none;
        transition: left .18s ease, top .18s ease, transform .18s ease;
      }
    `;
    document.documentElement.appendChild(style);
  }

  let caption = document.getElementById("dbx-demo-caption");
  if (!caption) {
    caption = document.createElement("div");
    caption.id = "dbx-demo-caption";
    caption.innerHTML = "<strong></strong><span></span>";
    document.documentElement.appendChild(caption);
  }
  let pointer = document.getElementById("dbx-demo-pointer");
  if (!pointer) {
    pointer = document.createElement("div");
    pointer.id = "dbx-demo-pointer";
    pointer.style.left = "-100px";
    pointer.style.top = "-100px";
    document.documentElement.appendChild(pointer);
  }

  scrub(document.documentElement);
  globalThis.__dbxDemoPrivacyObserver?.disconnect();
  globalThis.__dbxDemoPrivacyObserver = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "characterData") scrub(record.target.parentElement);
      for (const node of record.addedNodes || []) {
        if (node.nodeType === Node.ELEMENT_NODE) scrub(node);
      }
    }
  });
  globalThis.__dbxDemoPrivacyObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });
}

const browser = await chromium.connectOverCDP(endpoint);
let capture = true;
let frameCount = 0;
let captureFailure = null;

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
  await page.bringToFront();
  await page.evaluate(installPrivacyAndDemoOverlay);

  const visibleElementBox = async (selector, label, kind = "text") => {
    await page.waitForFunction(({ css, value, mode }) => [...document.querySelectorAll(css)].some((element) => {
      const rect = element.getBoundingClientRect();
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      return rect.width > 0 && rect.height > 0 && (mode === "text" ? text === value : element.getAttribute(mode) === value);
    }), { css: selector, value: label, mode: kind }, { timeout: 90_000 });
    return page.evaluate(({ css, value, mode }) => {
      const element = [...document.querySelectorAll(css)].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        const text = (candidate.textContent || "").replace(/\s+/g, " ").trim();
        return rect.width > 0 && rect.height > 0 && (mode === "text" ? text === value : candidate.getAttribute(mode) === value);
      });
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }, { css: selector, value: label, mode: kind });
  };

  const pointAt = async (box) => {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.evaluate(({ left, top }) => {
      const pointer = document.getElementById("dbx-demo-pointer");
      if (pointer) {
        pointer.style.left = `${left}px`;
        pointer.style.top = `${top}px`;
        pointer.style.transform = "scale(1.35)";
        setTimeout(() => { pointer.style.transform = "scale(1)"; }, 220);
      }
    }, { left: x, top: y });
    await page.mouse.move(x, y);
    await sleep(420);
    return { x, y };
  };

  const clickText = async (selector, label) => {
    const box = await visibleElementBox(selector, label);
    const point = await pointAt(box);
    await page.mouse.click(point.x, point.y);
  };

  const clickTopGenieTab = async (label) => {
    const box = await page.evaluate((value) => {
      const element = [...document.querySelectorAll("*")].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return (candidate.textContent || "").trim() === value
          && rect.x > 600 && rect.y < 115 && rect.width > 0 && rect.height > 0;
      });
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }, label);
    if (!box) throw new Error(`Top Genie tab is not visible: ${label}`);
    const point = await pointAt(box);
    await page.mouse.click(point.x, point.y);
    await sleep(1_200);
  };

  const toggleConfigurePanel = async () => {
    const box = await page.evaluate(() => {
      const element = [...document.querySelectorAll("button")].find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return (candidate.textContent || "").trim() === "Configure"
          && rect.width > 0 && rect.height > 0;
      });
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    if (!box) throw new Error("Configure toggle is not visible");
    const point = await pointAt(box);
    await page.mouse.click(point.x, point.y);
    await sleep(1_000);
  };

  const scrollToExactText = async (label) => {
    const locator = page.getByText(label, { exact: true }).last();
    await locator.waitFor({ state: "visible", timeout: 60_000 });
    await locator.scrollIntoViewIfNeeded();
    await sleep(700);
    return locator;
  };

  const setCaption = async (title, detail) => {
    await page.evaluate(({ heading, subheading }) => {
      const caption = document.getElementById("dbx-demo-caption");
      if (!caption) return;
      caption.querySelector("strong").textContent = heading;
      caption.querySelector("span").textContent = subheading;
    }, { heading: title, subheading: detail });
  };

  const dismiss = async (ariaLabel) => {
    const candidates = page.locator(`button[aria-label="${ariaLabel}"]`);
    if (await candidates.count()) await candidates.first().click().catch(() => {});
  };

  const dismissTextButton = async (label) => {
    const candidates = page.getByRole("button", { name: label, exact: true });
    if (await candidates.count()) await candidates.first().click().catch(() => {});
  };

  const ensureCatalogReady = async () => {
    await clickText("a", "Catalog");
    await visibleElementBox("a", "workspace");
    await dismiss("Dismiss learning nudge");
    await dismiss("Close notification");
    const gotIt = page.getByRole("button", { name: "Got it!" });
    if (await gotIt.count()) await gotIt.first().click().catch(() => {});
    await sleep(2_000);
  };

  const ensureHomeReady = async () => {
    await clickText("a", "Home");
    await page.waitForFunction(() => (document.body?.innerText || "").includes("Welcome to Databricks"), null, { timeout: 60_000 });
    await dismiss("Close notification");
    await sleep(1_500);
  };

  const ensureIngestionReady = async () => {
    await clickText("a", "Data Ingestion");
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("Add data")
        && text.includes("Upload files to a volume")
        && text.includes("Databricks connectors");
    }, null, { timeout: 90_000 });
    await dismissTextButton("Not now");
    await dismiss("Close notification");
  };

  const ensureJobsReady = async () => {
    await clickText("a", "Jobs & Pipelines");
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("Jobs & Pipelines")
        && text.includes("Ingestion pipeline")
        && text.includes("ETL pipeline")
        && text.includes("No jobs or pipelines found");
    }, null, { timeout: 90_000 });
    await dismissTextButton("Not now");
    await dismiss("Close notification");
  };

  const ensureComputeReady = async () => {
    await clickText("a", "SQL Warehouses");
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("Compute")
        && text.includes("SQL warehouses")
        && text.includes("Serverless Starter Warehouse")
        && text.includes("Lakebase");
    }, null, { timeout: 90_000 });
    await dismissTextButton("Not now");
    await dismiss("Close notification");
  };

  const ensureAfterSalesSqlReady = async () => {
    const editor = page.locator(".monaco-editor").first();
    await editor.waitFor({ state: "visible", timeout: 90_000 });
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      const editorText = document.querySelector(".view-lines")?.textContent || "";
      return editorText.includes("dbx_demo_20260814")
        && text.includes("西南")
        && text.includes("华南");
    }, null, { timeout: 90_000 });
    await dismiss("Close notification");
  };

  const ensureDbopsSqlReady = async () => {
    const editor = page.locator(".monaco-editor").first();
    await editor.waitFor({ state: "visible", timeout: 90_000 });
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      const editorText = document.querySelector(".view-lines")?.textContent || "";
      return editorText.includes("dbops_incident_context")
        && text.includes("INC-001")
        && text.includes("INC-002")
        && text.includes("INC-003");
    }, null, { timeout: 90_000 });
    await dismiss("Close notification");
  };

  const ensureAfterSalesQueueReady = async () => {
    const editor = page.locator(".monaco-editor").first();
    await editor.waitFor({ state: "visible", timeout: 90_000 });
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      const editorText = document.querySelector(".view-lines")?.textContent || "";
      return editorText.includes("negative")
        && editorText.includes("after_sales_cases")
        && text.includes("T000697")
        && text.includes("T000616")
        && text.includes("18 rows");
    }, null, { timeout: 90_000 });
    await dismiss("Close notification");
  };

  const ensureGenieReady = async () => {
    const configOpen = await page.evaluate(() => [...document.querySelectorAll("*")].some((element) => {
      const rect = element.getBoundingClientRect();
      return (element.textContent || "").trim() === "Examples"
        && rect.x > 900 && rect.y < 160 && rect.width > 0;
    }));
    if (configOpen) {
      await clickText("button", "Configure");
      await sleep(1_200);
    }
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("哪个区域未解决的 P1 售后工单最多")
        && text.includes("西南区域有 3 张未解决的 P1 工单")
        && text.includes("Show code");
    }, null, { timeout: 90_000 });
    await dismiss("Close notification");
  };

  const ensureGenieBusinessReady = async () => {
    await clickTopGenieTab("Chat");
    const panelOpen = await page.getByText("Teach your agent how to answer questions with curated examples.", { exact: true }).isVisible().catch(() => false);
    if (panelOpen) await toggleConfigurePanel();
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("¥80,135.35")
        && text.includes("INC-001") && text.includes("INC-002") && text.includes("INC-003")
        && text.includes("人工审批");
    }, null, { timeout: 120_000 });
  };

  const ensureGenieAuthoringReady = async () => {
    await clickTopGenieTab("Chat");
    await page.waitForFunction(() => (document.body?.innerText || "").includes("Customer Service and Order Management"), null, { timeout: 60_000 });
  };

  if (scenario === "catalog") await ensureCatalogReady();
  if (scenario === "workspace") await ensureHomeReady();
  if (scenario === "ingestion") await ensureIngestionReady();
  if (scenario === "jobs") await ensureJobsReady();
  if (scenario === "compute") await ensureComputeReady();
  if (scenario === "sql_after_sales") await ensureAfterSalesSqlReady();
  if (scenario === "sql_after_sales_queue") await ensureAfterSalesQueueReady();
  if (scenario === "sql_dbops") await ensureDbopsSqlReady();
  if (scenario === "genie") await ensureGenieReady();
  if (scenario === "genie_business") await ensureGenieBusinessReady();
  if (scenario === "genie_authoring") await ensureGenieAuthoringReady();
  const captureStartedAt = Date.now();
  const captureLoop = (async () => {
    while (capture) {
      const framePath = `${temporary}/frame-${String(frameCount).padStart(6, "0")}.jpg`;
      try {
        await page.screenshot({ path: framePath, type: "jpeg", quality: 86, fullPage: false });
      } catch (error) {
        captureFailure = error;
        capture = false;
        break;
      }
      frameCount += 1;
      const targetTime = captureStartedAt + frameCount * frameIntervalMs;
      await sleep(Math.max(0, targetTime - Date.now()));
    }
  })();

  if (scenario === "workspace") {
    const logo = await visibleElementBox("a", "Databricks Free Edition", "aria-label");
    await pointAt(logo);
    await setCaption("M01 · Workspace 与版本确认", "真实 UI 已明确显示 Databricks Free Edition；适合学习、原型和非敏感合成数据演示");
    await sleep(3_200);

    await clickText("button", "New");
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("Add or upload data") && text.includes("Metric view") && text.includes("ETL pipeline");
    }, null, { timeout: 30_000 });
    await setCaption("统一 New 入口", "数据接入、Notebook、Query、Dashboard、Genie Agent、Metric View、Job、ETL Pipeline、App");
    await sleep(5_200);
  }

  if (scenario === "ingestion") {
    const heading = await visibleElementBox("h1,h2", "Add data");
    await pointAt(heading);
    await setCaption("M05 · 数据接入入口", "本地文件、Unity Catalog Volume、对象存储、数据库和 SaaS Connector 从同一页面进入");
    await sleep(3_200);

    const volume = await visibleElementBox("*", "Upload files to a volume");
    await pointAt(volume);
    await setCaption("文件到 Lakehouse", "本次实测采用 Files API → managed Volume → read_files → 14 个 Delta managed tables");
    await sleep(4_200);

    const connector = await visibleElementBox("*", "SQL Server");
    await pointAt(connector);
    await setCaption("托管连接器", "数据库与 SaaS 可交给 Lakeflow Connect 持续摄取；身份、目标表和运行状态显式管理");
    await sleep(4_500);
  }

  if (scenario === "jobs") {
    const ingestion = await visibleElementBox("*", "Ingestion pipeline");
    await pointAt(ingestion);
    await setCaption("M06 · 从接入到可运营流程", "Ingestion pipeline 负责连接源系统并持续落表；当前演示工作区没有既有任务");
    await sleep(3_800);

    const etl = await visibleElementBox("*", "ETL pipeline");
    await pointAt(etl);
    await setCaption("ETL Pipeline", "使用 SQL 或 Python 声明数据转换、质量规则与增量处理，产出受治理 Delta 表");
    await sleep(3_800);

    const job = await visibleElementBox("*", "Job");
    await pointAt(job);
    await setCaption("Job 编排", "把 Notebook、Pipeline、Query 与通知串成定时或事件驱动工作流；外部可用 CLI、SDK、REST/Bundles 自动化");
    await sleep(4_500);
  }

  if (scenario === "compute") {
    const warehouse = await visibleElementBox("a", "Serverless Starter Warehouse");
    await pointAt(warehouse);
    await setCaption("M07 · SQL Warehouse", "Delta 表的分析 SQL 在 Serverless Warehouse 上执行；本账号为 Free Edition 的 2X-Small Starter Warehouse");
    await sleep(4_200);

    const lakebase = await visibleElementBox("button", "Lakebase");
    await pointAt(lakebase);
    await setCaption("M10 · Lakebase 与 Lakehouse 分工", "Lakehouse 面向分析与历史数据；Lakebase Postgres 面向应用的低延迟事务。当前只验证入口，不创建实例");
    await sleep(4_200);

    await setCaption("内嵌 vs 外部", "内嵌 SQL Editor 自动承接身份和计算选择；外部 JDBC/ODBC/Statement API 必须显式管理 OAuth、连接、重试与审计");
    await sleep(4_800);
  }

  if (scenario === "sql_after_sales") {
    const editorBox = await page.locator(".monaco-editor").first().boundingBox();
    if (editorBox) await pointAt({ x: editorBox.x + 20, y: editorBox.y + 10, width: 320, height: 40 });
    await setCaption("C2 · 自然语言问题的可信 SQL 基线", "问题：哪个区域未解决的 P1 售后工单最多？先用可审计 SQL 固定正确答案");
    await sleep(3_200);

    const run = page.getByTestId("notebook-query-run-button-idle");
    await run.waitFor({ state: "visible", timeout: 90_000 });
    const runBox = await run.boundingBox();
    if (!runBox) throw new Error("Run query button is not visible");
    const runPoint = await pointAt(runBox);
    await page.mouse.click(runPoint.x, runPoint.y);
    await setCaption("Databricks SQL Warehouse 执行", "同一 Unity Catalog 权限、同一 Delta 表；UI 会展示 SQL、运行时间和结果表");
    await sleep(7_000);
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("西南") && text.includes("华南") && !text.includes("Cancel running query");
    }, null, { timeout: 60_000 });
    await setCaption("可信答案", "西南 3、华南 2、东北 1、华北 1；后续 Genie 回答必须与此结果一致");
    await sleep(4_500);
  }

  if (scenario === "sql_dbops") {
    const editorBox = await page.locator(".monaco-editor").first().boundingBox();
    if (editorBox) await pointAt({ x: editorBox.x + 20, y: editorBox.y + 10, width: 420, height: 40 });
    await setCaption("C4 · 数据库智能运维", "结构化汇聚指标、慢 SQL、告警、变更、事故和 Runbook；本例查询三个事故的根因与处置");
    await sleep(3_200);

    const run = page.getByTestId("notebook-query-run-button-idle");
    await run.waitFor({ state: "visible", timeout: 90_000 });
    const runBox = await run.boundingBox();
    if (!runBox) throw new Error("Run query button is not visible");
    const runPoint = await pointAt(runBox);
    await page.mouse.click(runPoint.x, runPoint.y);
    await setCaption("只读诊断查询", "SQL Warehouse 在 Unity Catalog 权限下运行；实例名使用 .invalid，未连接任何生产数据库");
    await sleep(6_500);
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("INC-001") && text.includes("INC-002") && text.includes("INC-003")
        && !text.includes("Cancel running query");
    }, null, { timeout: 60_000 });
    await setCaption("Agent 动作边界", "可以总结根因、推荐 Runbook、生成工单草稿；真实修复命令必须经过人工审批与幂等校验");
    await sleep(4_800);
  }

  if (scenario === "sql_after_sales_queue") {
    const editorBox = await page.locator(".monaco-editor").first().boundingBox();
    if (editorBox) await pointAt({ x: editorBox.x + 20, y: editorBox.y + 10, width: 440, height: 40 });
    await setCaption("C3 · 智能售后行动队列", "从 700 条工单筛选负面、高优先级且未解决的案例，并关联客户、订单与退款上下文");
    await sleep(3_200);

    const run = page.getByTestId("notebook-query-run-button-idle");
    await run.waitFor({ state: "visible", timeout: 90_000 });
    const runBox = await run.boundingBox();
    if (!runBox) throw new Error("Run query button is not visible");
    const runPoint = await pointAt(runBox);
    await page.mouse.click(runPoint.x, runPoint.y);
    await setCaption("从分析到 Agent", "读取队列 → 查询政策 → 推荐下一步 → 生成工单/消息草稿；所有数据仍受 Unity Catalog 治理");
    await sleep(6_000);
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("T000697") && text.includes("T000616") && text.includes("18 rows")
        && !text.includes("Cancel running query");
    }, null, { timeout: 60_000 });
    await setCaption("18 条待处理工单", "分析和建议可自动化；退款、改订单、发客户消息、变更工单状态必须走审批工具");
    await sleep(4_800);
  }

  if (scenario === "genie") {
    const questionButton = page.locator('button[title="Click to rename"]').first();
    const questionBox = await questionButton.boundingBox();
    if (questionBox) await pointAt(questionBox);
    await setCaption("M09 · 内嵌 Genie Agent", "业务用户直接用中文提问；身份、数据权限、Warehouse、语义配置和反馈闭环由工作区承接");
    await sleep(4_000);

    await setCaption("回答与可信 SQL 一致", "西南 3、华南 2、东北 1、华北 1；回答同时提供图表、引用、反馈与下载入口");
    await sleep(4_500);

    const showCode = page.getByTestId("data-rooms.embedded.components.toggle-generated-code-button");
    await showCode.waitFor({ state: "visible", timeout: 30_000 });
    const codeBox = await showCode.boundingBox();
    if (!codeBox) throw new Error("Show code button is not visible");
    const codePoint = await pointAt(codeBox);
    await page.mouse.click(codePoint.x, codePoint.y);
    await page.waitForTimeout(1_500);
    await setCaption("可解释与可审计", "可展开 Genie 生成的只读 SQL，并与 9/9 可信基线查询逐项比对");
    await sleep(4_500);

    await clickText("button", "Configure");
    await visibleElementBox("a", "Sources");
    await clickText("a", "Sources");
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("All (7)") && text.includes("dbops_incident_context") && text.includes("support_policies");
    }, null, { timeout: 60_000 });
    await setCaption("领域专家配置：Sources", "7 个受治理表/视图；同一个 Agent 同时覆盖售后分析与数据库运维上下文");
    await sleep(4_500);

    await clickText("a", "Instructions");
    await sleep(1_500);
    await setCaption("领域专家配置：Instructions", "中文业务口径、表选择优先级、未知处理和“写操作必须审批”均显式固化");
    await sleep(4_500);

    await clickText("a", "Examples");
    await page.waitForFunction(() => (document.body?.innerText || "").includes("哪些负面、高优先级且未解决"), null, { timeout: 30_000 });
    await setCaption("领域专家配置：Curated Examples", "真实运行过的售后队列 SQL 已转成受信示例，帮助 Agent 学会企业口径而不是自行猜测");
    await sleep(4_500);
  }

  if (scenario === "genie_business") {
    const refundQuestion = "统计所有状态的退款记录时，哪种退款原因对应的退款总金额最高？请给出原因、金额和使用的数据表。";
    const dbopsQuestion = "三个数据库事故的根因和解决办法是什么？请按事故编号列出，并明确真实修复操作需要人工审批。";
    const approvalQuestion = "基于上面的分析，哪些步骤可以自动生成建议或草稿，哪些真实操作必须经过人工审批？";

    const refund = await scrollToExactText(refundQuestion);
    const refundBox = await refund.boundingBox();
    if (refundBox) await pointAt(refundBox);
    await setCaption("G1 · 第一种用法：明确口径的业务问答", "问题明确“所有状态”，避免把退款总额误解为只统计 approved；Agent mode 以用户权限运行");
    await sleep(6_500);

    const refundAnswer = page.getByText(/80,135\.35/).last();
    await refundAnswer.scrollIntoViewIfNeeded();
    const answerBox = await refundAnswer.boundingBox();
    if (answerBox) await pointAt(answerBox);
    await setCaption("回答与可信 SQL 一致", "与描述不符 · ¥80,135.35 · 51 笔；同时给出数据表、详细排名、来源和反馈入口");
    await sleep(8_000);

    const showCodeButtons = page.getByTestId("data-rooms.embedded.components.toggle-generated-code-button");
    if (await showCodeButtons.count()) {
      const firstCode = showCodeButtons.first();
      await firstCode.scrollIntoViewIfNeeded();
      const codeBox = await firstCode.boundingBox();
      if (codeBox) {
        const point = await pointAt(codeBox);
        await page.mouse.click(point.x, point.y);
        await sleep(1_200);
      }
    }
    await setCaption("第二种用法：查看生成 SQL", "业务用户不必手写 SQL，但领域专家仍能展开代码，核对字段、过滤条件、聚合与排序");
    await sleep(7_000);

    const dbops = await scrollToExactText(dbopsQuestion);
    const dbopsBox = await dbops.boundingBox();
    if (dbopsBox) await pointAt(dbopsBox);
    await setCaption("第三种用法：跨事故的多步骤分析", "同一个 Agent 切换到数据库运维域，按 INC-001 / 002 / 003 汇总根因、处置与证据");
    await sleep(7_000);

    const incident = page.getByText(/INC-003/).last();
    await incident.scrollIntoViewIfNeeded();
    const incidentBox = await incident.boundingBox();
    if (incidentBox) await pointAt(incidentBox);
    await setCaption("Agent mode 适合结构化报告", "可规划并执行多次查询、合并证据、形成报告；复杂分析不代表自动执行修复");
    await sleep(9_000);

    const approval = await scrollToExactText(approvalQuestion);
    const approvalBox = await approval.boundingBox();
    if (approvalBox) await pointAt(approvalBox);
    await setCaption("第四种用法：连续追问动作边界", "同一会话沿用上下文，继续区分建议/草稿自动化与真实退款、改订单、发消息、修库审批");
    await sleep(8_000);

    const approvalAnswer = page.getByText(/人工审批/).last();
    await approvalAnswer.scrollIntoViewIfNeeded();
    const approvalAnswerBox = await approvalAnswer.boundingBox();
    if (approvalAnswerBox) await pointAt(approvalAnswerBox);
    await setCaption("内嵌 Genie 的独特点", "平台串起身份、数据权限、Warehouse、SQL、图表、引用、追问和反馈；写动作仍交给独立审批工具");
    await sleep(8_500);
  }

  if (scenario === "genie_authoring") {
    const panelOpen = await page.getByText("Teach your agent how to answer questions with curated examples.", { exact: true }).isVisible().catch(() => false);
    if (!panelOpen) await toggleConfigurePanel();

    await clickText("a", "Sources");
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("All (7)") && text.includes("dbops_incident_context") && text.includes("support_policies");
    }, null, { timeout: 60_000 });
    await setCaption("G2 · 实现第一步：选择受治理 Sources", "7 个高质量表/视图覆盖售后、退款、政策、订单、客户、事故与 Runbook；不是把整个 Catalog 都塞给 Agent");
    await sleep(8_000);

    await clickText("a", "Instructions");
    await sleep(1_200);
    await setCaption("实现第二步：写清业务口径和安全边界", "中文回答、未解决定义、选表优先级、未知处理，以及“所有真实写操作必须人工审批”");
    await sleep(8_000);

    await clickText("a", "Examples");
    await page.waitForFunction(() => (document.body?.innerText || "").includes("哪些负面、高优先级且未解决"), null, { timeout: 30_000 });
    await setCaption("实现第三步：Curated Example / Trusted Asset", "把人工审查过的售后行动队列 SQL 收录为示例，让正确口径可复用；Example 与 Benchmark 作用不同");
    await sleep(8_000);

    await toggleConfigurePanel();
    await clickTopGenieTab("Monitor");
    await page.waitForTimeout(1_500);
    await setCaption("Monitor：看真实用户怎样问、哪里失败", "对话历史和反馈用于人工审查；好答案可以转成 Example，错误要归因到数据、口径、SQL 或权限");
    await sleep(9_000);

    await clickTopGenieTab("Benchmark");
    await page.waitForFunction(() => (document.body?.innerText || "").includes("Evaluations") && (document.body?.innerText || "").includes("Questions (3)"), null, { timeout: 60_000 });
    await setCaption("Benchmark：离线回归，不是训练数据", "3 个代表问题分别覆盖 P1 售后、退款指标和数据库事故；问题不会进入回答上下文");
    await sleep(8_000);

    const questionsTab = page.getByText("Questions (3)", { exact: true }).first();
    await questionsTab.click();
    await sleep(1_000);
    await setCaption("每题都有真值与判分标准", "Ground-truth SQL 检查事实；Agent mode 的 Evaluation note 约束报告必须覆盖什么、不能声称什么");
    await sleep(9_000);

    const evaluationsTab = page.getByText("Evaluations", { exact: true }).first();
    await evaluationsTab.click();
    await sleep(1_000);
    await setCaption("三次历史运行均为 33%", "前两次暴露评测真值/编辑器维护错误；第三次才是有效模型评测，不能把三次失败混成同一原因");
    await sleep(9_000);

    const latestRun = page.getByText(/^Aug 17, 2026, 10:27:28$/).first();
    if (await latestRun.count()) {
      const latestBox = await latestRun.boundingBox();
      if (latestBox) await pointAt(latestBox);
    }
    await setCaption("第三次有效运行仍为 33%", "P1 通过；退款事实正确但输出契约失败；DBOps 的 Empty Result 与可见报告矛盾，需人工复核评测器");
    await sleep(9_000);
  }

  if (scenario === "catalog") {
    await setCaption("M02 · Catalog Explorer", "Catalog → Schema → Managed Delta Table：同一入口完成发现、治理与血缘追踪");
    await sleep(2_200);

    const schemaVisible = await page.evaluate(() => [...document.querySelectorAll("a")].some((element) => (
      (element.textContent || "").trim() === "dbx_demo_20260814" && element.getBoundingClientRect().width > 0
    )));
    if (!schemaVisible) await clickText("a", "workspace");
    const ordersVisible = await page.evaluate(() => [...document.querySelectorAll("a")].some((element) => (
      (element.textContent || "").trim() === "orders" && element.getBoundingClientRect().width > 0
    )));
    if (!ordersVisible) await clickText("a", "dbx_demo_20260814");
    await clickText("a", "dbx_demo_20260814");
    await page.waitForFunction(() => [...document.querySelectorAll("h1,h2,h3")].some((element) => (
      (element.textContent || "").trim() === "dbx_demo_20260814"
    )) && (document.body?.innerText || "").includes("Synthetic, non-sensitive"), null, { timeout: 60_000 });
    await setCaption("Schema：dbx_demo_20260814", "18 个表/视图 + 1 个 Volume；研究对象与用户既有数据隔离");
    await sleep(3_000);

    const leftOrdersVisible = await page.evaluate(() => [...document.querySelectorAll("a")].some((element) => (
      (element.textContent || "").trim() === "orders" && element.getBoundingClientRect().width > 0
    )));
    if (!leftOrdersVisible) await clickText("a", "dbx_demo_20260814");
    await clickText("a", "orders");
    await page.waitForFunction(() => [...document.querySelectorAll("h1,h2,h3")].some((element) => (
      (element.textContent || "").trim() === "orders"
    )) && (document.body?.innerText || "").includes("Synthetic customer orders"), null, { timeout: 60_000 });
    await sleep(2_000);
    await dismiss("Dismiss learning nudge");
    await setCaption("Managed Delta 表：orders", "列、描述、权限、策略、历史、血缘、质量都挂在同一个受治理对象上");
    await sleep(3_000);

    await clickText("button", "Details");
    await sleep(2_500);
    await setCaption("Details", "真实工作区确认：Type = MANAGED，并展示 Delta Table Properties");
    await sleep(3_000);

    await clickText("button", "Lineage");
    await page.waitForFunction(() => {
      const text = document.body?.innerText || "";
      return text.includes("after_sales_cases") && text.includes("daily_sales");
    }, null, { timeout: 60_000 });
    const gotIt = page.getByRole("button", { name: "Got it!" });
    if (await gotIt.count()) await gotIt.first().click().catch(() => {});
    await dismiss("Close notification");
    await setCaption("自动血缘", "上游 Volume → orders → after_sales_cases / daily_sales；不需要另建一套元数据平台");
    await sleep(4_000);
  }

  capture = false;
  await captureLoop;
  if (captureFailure) throw captureFailure;
  if (frameCount < fps * 3) throw new Error(`Too few frames captured: ${frameCount}`);
  await page.evaluate(() => {
    for (const id of ["dbx-demo-caption", "dbx-demo-pointer", "dbx-demo-recording-style"]) {
      document.getElementById(id)?.remove();
    }
  });
} finally {
  await browser.close();
}

await new Promise((resolvePromise, rejectPromise) => {
  const child = spawn(ffmpeg, [
    "-y",
    "-framerate", String(fps),
    "-i", `${temporary}/frame-%06d.jpg`,
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "21",
    "-pix_fmt", "yuv420p",
    "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2",
    "-movflags", "+faststart",
    output,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
  child.on("error", rejectPromise);
  child.on("close", (code) => {
    if (code === 0) resolvePromise();
    else rejectPromise(new Error(`ffmpeg exited ${code}: ${stderr.slice(-3000)}`));
  });
});

await rm(temporary, { recursive: true, force: true });
console.log(JSON.stringify({
  scenario,
  output,
  fps,
  frameCount,
  approximateDurationSeconds: Number((frameCount / fps).toFixed(2)),
}));
