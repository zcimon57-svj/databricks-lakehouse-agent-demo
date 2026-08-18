#!/usr/bin/env node

import { chromium } from "playwright";
import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

const [url, outputArg] = process.argv.slice(2);
if (!url || !outputArg) {
  console.error("Usage: node scripts/record_genie_architecture.mjs <url> <output.mp4>");
  process.exit(2);
}

const output = resolve(outputArg);
const startedAt = Date.now();
const ffmpeg = process.env.PLAYWRIGHT_FFMPEG || resolve("node_modules/ffmpeg-static/ffmpeg");
const temporary = await mkdtemp(`${tmpdir()}/dbx-genie-architecture-`);
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

const caption = async (title, detail, badge = "G3 · 架构演示") => {
  await page.evaluate(({ titleText, detailText, badgeText }) => {
    let overlay = document.getElementById("genie-recording-caption");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "genie-recording-caption";
      overlay.innerHTML = "<b></b><strong></strong><span></span>";
      const style = document.createElement("style");
      style.textContent = `
        #genie-recording-caption { position: fixed; left: 34px; bottom: 28px; z-index: 999999;
          max-width: 840px; padding: 14px 18px; color: #fff; background: rgba(9,27,31,.94);
          border: 1px solid rgba(157,224,205,.35); border-radius: 13px; box-shadow: 0 14px 40px rgba(0,0,0,.28);
          font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif; }
        #genie-recording-caption b { display: inline-flex; padding: 3px 7px; margin-bottom: 7px; border-radius: 5px;
          color: #10252b; background: #9de0cd; font-size: 11px; letter-spacing: .05em; }
        #genie-recording-caption strong { display: block; font-size: 19px; line-height: 1.35; }
        #genie-recording-caption span { display: block; margin-top: 4px; color: rgba(255,255,255,.78); font-size: 14px; }
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
  await caption("Genie 的重点不是聊天框", "同一受治理 Agent 可以被工作区、iframe、API 和多 Agent 四类入口复用");
  await page.waitForTimeout(6_000);

  await page.locator("#implementation").scrollIntoViewIfNeeded();
  await caption("实现分成三层", "领域专家配置 Sources / Instructions / Examples；运行时生成并执行 SQL；Monitor + Benchmark 形成回归闭环");
  await page.waitForTimeout(9_000);

  await page.locator("#implementation figure").scrollIntoViewIfNeeded();
  await caption("自然语言没有绕过数据治理", "查询仍在 SQL Warehouse 执行，Unity Catalog 的身份、表列权限、Row Filter 和 Mask 继续生效");
  await page.waitForTimeout(9_000);

  await page.locator("#modes").scrollIntoViewIfNeeded();
  await caption("四种交付方式", "工作区最快；iframe 复用原生 UI；API 适合自定义交互；多 Agent 适合跨系统流程");
  await page.waitForTimeout(9_000);

  await page.locator("#modes .mode-table").scrollIntoViewIfNeeded();
  await caption("外部调用的独特点是可组合", "代价是调用方要负责 OAuth、异步轮询、重试、限流、渲染、审计和故障恢复");
  await page.waitForTimeout(8_000);

  await page.locator("#quality").scrollIntoViewIfNeeded();
  await caption("分析工具与动作工具必须分离", "Genie 可以分析并生成建议；退款、改订单、发消息和修库必须进入人工审批、幂等与回滚 Gate");
  await page.waitForTimeout(8_000);

  await page.locator("#top").scrollIntoViewIfNeeded();
  await caption("证据边界", "本视频解释官方集成方式；iframe/API 未在该 Free Edition 账号做真实生产调用", "G3 · 架构演示 · 非 API 实调");
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
