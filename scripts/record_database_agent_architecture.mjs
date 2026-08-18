#!/usr/bin/env node

import { chromium } from "playwright";
import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

const [url, outputArg] = process.argv.slice(2);
if (!url || !outputArg) {
  console.error("Usage: node scripts/record_database_agent_architecture.mjs <url> <output.mp4>");
  process.exit(2);
}

const output = resolve(outputArg);
const startedAt = Date.now();
const ffmpeg = process.env.PLAYWRIGHT_FFMPEG || resolve("node_modules/ffmpeg-static/ffmpeg");
const temporary = await mkdtemp(`${tmpdir()}/dbx-database-agent-recording-`);
const webm = resolve(temporary, "source.webm");
await mkdir(dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
  recordVideo: { dir: temporary, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const video = page.video();

const caption = async (title, detail, badge = "D1 · 云数据库 Agent 架构") => {
  await page.evaluate(({ titleText, detailText, badgeText }) => {
    let overlay = document.getElementById("database-agent-recording-caption");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "database-agent-recording-caption";
      overlay.innerHTML = "<b></b><strong></strong><span></span>";
      const style = document.createElement("style");
      style.textContent = `
        #database-agent-recording-caption { position: fixed; left: 34px; bottom: 28px; z-index: 999999;
          max-width: 940px; padding: 14px 18px; color: #fff; background: rgba(9,27,31,.95);
          border: 1px solid rgba(157,224,205,.4); border-radius: 13px; box-shadow: 0 14px 40px rgba(0,0,0,.3);
          font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif; }
        #database-agent-recording-caption b { display: inline-flex; padding: 3px 7px; margin-bottom: 7px; border-radius: 5px;
          color: #10252b; background: #9de0cd; font-size: 11px; letter-spacing: .05em; }
        #database-agent-recording-caption strong { display: block; font-size: 19px; line-height: 1.35; }
        #database-agent-recording-caption span { display: block; margin-top: 4px; color: rgba(255,255,255,.78); font-size: 14px; }
      `;
      document.head.appendChild(style);
      document.body.appendChild(overlay);
    }
    overlay.querySelector("b").textContent = badgeText;
    overlay.querySelector("strong").textContent = titleText;
    overlay.querySelector("span").textContent = detailText;
  }, { titleText: title, detailText: detail, badgeText: badge });
};

try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  await caption("云数据库接上大模型，还不是 Genie", "RDS、PolarDB、TaurusDB 已有可靠数据库底座；缺口是治理、语义、Agent 运行时、评测与动作审批");
  await page.waitForTimeout(7_000);

  await page.locator("#answer").scrollIntoViewIfNeeded();
  await caption("先复用已有能力，再补产品层", "SQL、事务、只读节点、系统目录和监控不重造；Catalog、Semantic、Eval 与外部交付需要补齐");
  await page.waitForTimeout(7_000);

  await page.locator("#stack figure").scrollIntoViewIfNeeded();
  await caption("十层能力栈", "Unity Catalog-like 横跨对象、身份、权限、分类、血缘与审计；它是必要前置，但不能替代业务语义和质量评测");
  await page.waitForTimeout(11_000);

  await page.locator("#catalog").scrollIntoViewIfNeeded();
  await caption("系统目录不等于统一治理", "information_schema / pg_catalog 能提供库表列元数据；跨源 Owner、行列策略、运行时血缘和回答审计仍需统一治理层");
  await page.waitForTimeout(10_000);

  await page.locator("#routes figure").scrollIntoViewIfNeeded();
  await caption("三条接入路线", "实时小查询走只读副本或 Federation；历史跨域走 CDC 入湖仓；企业推荐混合路由并共享同一语义和证据");
  await page.waitForTimeout(11_000);

  await page.locator("#delivery").scrollIntoViewIfNeeded();
  await caption("内嵌与外部的差异是责任", "工作区自动带入身份和 Catalog；API 与多 Agent 更可组合，但调用方负责 OAuth、异步、重试、取消、审计和渲染");
  await page.waitForTimeout(9_000);

  await page.locator("#cases").scrollIntoViewIfNeeded();
  await caption("三个重点场景共享同一治理底座", "自然语言分析、智能售后和数据库运维的数据不同；退款、改订单、Kill、扩容与 Failover 都必须离开只读分析面");
  await page.waitForTimeout(8_000);

  await page.locator("#gates").scrollIntoViewIfNeeded();
  await caption("G0–G8：先可信 MVP，最后才接动作", "1 个域、3–8 个权威视图、5–10 个可信能力、30–50 个回归问题；写动作另走 preview、approval、verify、rollback");
  await page.waitForTimeout(9_000);

  await page.locator("#top").scrollIntoViewIfNeeded();
  await caption("证据边界", "这是官方资料校准后的本地架构演示；本项目没有连接或修改任何 RDS、PolarDB、TaurusDB 生产实例", "D1 · 架构演示 · 非生产实调");
  await page.waitForTimeout(6_000);
} finally {
  await context.close();
  await browser.close();
}

await copyFile(await video.path(), webm);
await new Promise((resolvePromise, rejectPromise) => {
  const child = spawn(ffmpeg, [
    "-y", "-i", webm,
    "-c:v", "libx264", "-preset", "medium", "-crf", "21",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", output,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
  child.on("error", rejectPromise);
  child.on("close", (code) => code === 0
    ? resolvePromise()
    : rejectPromise(new Error(`ffmpeg exited ${code}: ${stderr.slice(-3000)}`)));
});

await rm(temporary, { recursive: true, force: true });
console.log(JSON.stringify({
  output,
  elapsedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(2)),
}));
