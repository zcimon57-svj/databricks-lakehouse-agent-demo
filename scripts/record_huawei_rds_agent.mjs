#!/usr/bin/env node

import { chromium } from "playwright";
import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

const [url, outputArg] = process.argv.slice(2);
if (!url || !outputArg) {
  console.error("Usage: node scripts/record_huawei_rds_agent.mjs <url> <output.mp4>");
  process.exit(2);
}

const output = resolve(outputArg);
const startedAt = Date.now();
const ffmpeg = process.env.PLAYWRIGHT_FFMPEG || resolve("node_modules/ffmpeg-static/ffmpeg");
const temporary = await mkdtemp(`${tmpdir()}/dbx-huawei-rds-agent-recording-`);
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

const caption = async (title, detail, badge = "H1 · 华为云 RDS 专项") => {
  await page.evaluate(({ titleText, detailText, badgeText }) => {
    let overlay = document.getElementById("huawei-rds-recording-caption");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "huawei-rds-recording-caption";
      overlay.innerHTML = "<b></b><strong></strong><span></span>";
      const style = document.createElement("style");
      style.textContent = `
        #huawei-rds-recording-caption { position: fixed; left: 34px; bottom: 28px; z-index: 999999;
          max-width: 980px; padding: 14px 18px; color: #fff; background: rgba(7,25,30,.96);
          border: 1px solid rgba(157,224,205,.42); border-radius: 13px; box-shadow: 0 14px 40px rgba(0,0,0,.3);
          font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif; }
        #huawei-rds-recording-caption b { display: inline-flex; padding: 3px 7px; margin-bottom: 7px; border-radius: 5px;
          color: #10252b; background: #9de0cd; font-size: 11px; letter-spacing: .05em; }
        #huawei-rds-recording-caption strong { display: block; font-size: 19px; line-height: 1.35; }
        #huawei-rds-recording-caption span { display: block; margin-top: 4px; color: rgba(255,255,255,.78); font-size: 14px; }
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
  await caption("不是给 RDS 加聊天框，而是交付受治理的智能服务", "本方向聚焦 RDS MySQL / PostgreSQL 的客户价值、产品缺口和九十天落地，不讨论模型训练基础设施");
  await page.waitForTimeout(8_000);

  await page.locator("#story").scrollIntoViewIfNeeded();
  await caption("先讲 10:05 的客户事故", "客服查工单与退款，DBA 查慢 SQL、告警与变更；目标从五个页面、三个团队、九十分钟，缩短到五分钟证据包");
  await page.waitForTimeout(12_000);

  await page.locator("#direction").scrollIntoViewIfNeeded();
  await caption("保留底座，打通断点，新增闭环", "复用 RDS、DAS、DRS、DataArts、智能体平台、IAM 和 APIG；新增策略、语义、安全查询、双方言与评测服务");
  await page.waitForTimeout(10_000);

  await page.locator("#architecture figure").scrollIntoViewIfNeeded();
  await caption("三个查询路径，共享一个权威合同", "实时窄查走 RDS 专用只读实例，跨域历史走 DRS 分析副本，运维走 DAS 和日志；统一身份、语义、证据与评测");
  await page.waitForTimeout(15_000);

  await page.locator("#scenarios").scrollIntoViewIfNeeded();
  await caption("先做三个 P0 客户场景", "DBA Copilot、智能售后和受治理业务问答先用只读能力证明价值；SaaS 内嵌和多实例运维放到身份与隔离成熟之后");
  await page.waitForTimeout(10_000);

  await page.locator("#engines").scrollIntoViewIfNeeded();
  await caption("MySQL 与 PostgreSQL 不是一个通用 Prompt", "MySQL 先做订单退款切片，PostgreSQL 做工单和运维证据；双方言包、权限适配、Golden Questions 和性能基线分别验收");
  await page.waitForTimeout(10_000);

  await page.locator("#roadmap figure").scrollIntoViewIfNeeded();
  await caption("九十天按六个 Gate 交付", "价值合同、安全数据路径、治理闭环、语义真值、证据 Agent、伙伴试点依次通过；任何 Gate 未通过都不进入下一阶段");
  await page.waitForTimeout(15_000);

  await page.locator("#scorecard").scrollIntoViewIfNeeded();
  await caption("验收先看正确、安全和业务结果", "建议目标包括分析面零写入、治理覆盖百分之百、至少五十个真值问题、严格正确率达到百分之八十五，以及客服和运维效率改善");
  await page.waitForTimeout(9_000);

  await page.locator("#delivery").scrollIntoViewIfNeeded();
  await caption("内嵌与外部能力同源，责任不同", "RDS 控制台上下文最完整，企业 Widget 最贴近业务，外部 Agent 最可组合；写动作统一进入独立 Action Gateway");
  await page.waitForTimeout(8_000);

  await page.locator("#decision").scrollIntoViewIfNeeded();
  await caption("立项先确认伙伴、只读路径和业务 Owner", "如果只能使用共享高权限账号、没有指标口径 Owner，或要求 MVP 自动退款和修库，就应停止或缩小范围");
  await page.waitForTimeout(8_000);

  await page.locator("#top").scrollIntoViewIfNeeded();
  await caption("当前边界：方向建议，不是现网产品证明", "材料依据公开资料形成；没有连接华为云 RDS 租户，也没有做区域、版本、性能、成本或生产 SLA 实测", "H1 · 架构演示 · 非生产实调");
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
