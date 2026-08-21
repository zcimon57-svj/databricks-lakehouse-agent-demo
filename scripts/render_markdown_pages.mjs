#!/usr/bin/env node

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { marked } from "marked";

const projectRoot = resolve(import.meta.dirname, "..");

const pages = [
  {
    source: "docs/02-data-intelligence-decision-brief.md",
    output: "site/details/data-intelligence-decision-brief.html",
    pageTitle: "数据智能与数据库 Agent 产品决策 Brief（V2）",
    eyebrow: "CURRENT DECISION CONTRACT",
    backHref: "../index.html#gates",
    backLabel: "返回决策首页",
  },
  {
    source: "docs/00-project-brief.md",
    output: "site/details/project-brief.html",
    pageTitle: "Databricks 实测与演示约定（Phase 1）",
    eyebrow: "PHASE 1 PROJECT BRIEF",
    backHref: "../index.html",
    backLabel: "返回演示首页",
  },
  {
    source: "videos/recordings/README.md",
    output: "site/details/recordings.html",
    pageTitle: "真实录屏与讲稿",
    eyebrow: "RECORDINGS",
    backHref: "../index.html#videos",
    backLabel: "返回视频模块",
  },
  {
    source: "videos/external/README.md",
    output: "site/details/external-videos.html",
    pageTitle: "外部视频与播放建议",
    eyebrow: "EXTERNAL VIDEOS",
    backHref: "../index.html#videos",
    backLabel: "返回视频模块",
  },
  {
    source: "videos/voiceover/README.md",
    output: "site/details/voiceover.html",
    pageTitle: "中文配音说明",
    eyebrow: "MANDARIN VOICEOVER",
    backHref: "recordings.html",
    backLabel: "返回录屏索引",
  },
  {
    source: "evidence/workspace/zh-voiceover-validation.md",
    output: "site/details/voiceover-validation.html",
    pageTitle: "中文配音校验记录",
    eyebrow: "VOICEOVER VALIDATION",
    backHref: "voiceover.html",
    backLabel: "返回配音说明",
  },
  {
    source: "docs/research/04-genie-implementation-and-usage.md",
    output: "site/details/genie-guide.html",
    pageTitle: "Genie Agent 完整实现手册",
    eyebrow: "GENIE IMPLEMENTATION GUIDE",
    backHref: "../genie.html",
    backLabel: "返回 Genie 专题",
  },
  {
    source: "docs/research/03-live-workspace-validation.md",
    output: "site/details/live-workspace-validation.html",
    pageTitle: "Databricks 真实工作区验证",
    eyebrow: "LIVE WORKSPACE VALIDATION",
    backHref: "../index.html#databricks",
    backLabel: "返回 Databricks 实测",
  },
  {
    source: "docs/research/05-cloud-database-to-governed-data-agent.md",
    output: "site/details/cloud-database-agent-guide.html",
    pageTitle: "云数据库到治理型数据 Agent 完整指南",
    eyebrow: "DATABASE AGENT GUIDE",
    backHref: "../database-agent.html",
    backLabel: "返回云数据库专题",
  },
  {
    source: "docs/research/06-huawei-cloud-rds-mysql-postgresql-governed-agent.md",
    output: "site/details/huawei-rds-agent-guide.html",
    pageTitle: "历史方案：华为云 RDS 双引擎 90 天落地手册",
    eyebrow: "PHASE 1 HISTORICAL PROPOSAL",
    backHref: "../huawei-rds-agent.html",
    backLabel: "返回华为产品决策专题",
  },
  {
    source: "docs/research/07-huawei-rds-postgresql-phase1-scope-stories-product-modules.md",
    output: "site/details/huawei-rds-postgresql-phase1.html",
    pageTitle: "Phase 1 补充：华为 RDS PostgreSQL 范围、故事与模块",
    eyebrow: "PHASE 1 RESEARCH INPUT",
    backHref: "../huawei-rds-agent.html#benchmark",
    backLabel: "返回当前华为决策专题",
  },
  {
    source: "independent_exploration_2026-08-19/README.md",
    output: "site/details/independent-research-index.html",
    pageTitle: "11 家厂商独立探索索引",
    eyebrow: "INDEPENDENT RESEARCH",
    backHref: "../../independent_exploration_2026-08-19/agent-entry-governance-visual-report.html",
    backLabel: "返回友商可视报告",
  },
  {
    source: "independent_exploration_2026-08-19/independent-findings.md",
    output: "site/details/independent-findings.html",
    pageTitle: "独立探索综合结论",
    eyebrow: "INDEPENDENT FINDINGS",
    backHref: "../index.html#market",
    backLabel: "返回决策首页",
  },
  {
    source: "independent_exploration_2026-08-19/agent-entry-governance-deep-dive.md",
    output: "site/details/agent-entry-governance-deep-dive.html",
    pageTitle: "Agent 入口、治理与共享控制面深挖",
    eyebrow: "ENTRY & GOVERNANCE DEEP DIVE",
    backHref: "../../independent_exploration_2026-08-19/agent-entry-governance-visual-report.html",
    backLabel: "返回友商可视报告",
  },
  {
    source: "independent_exploration_2026-08-19/agent-entry-evidence-ledger.md",
    output: "site/details/agent-entry-evidence-ledger.html",
    pageTitle: "Agent 入口与治理证据账本",
    eyebrow: "EVIDENCE LEDGER",
    backHref: "../../independent_exploration_2026-08-19/agent-entry-governance-visual-report.html#evidence",
    backLabel: "返回可视证据层",
  },
  {
    source: "independent_exploration_2026-08-19/evidence-ledger.md",
    output: "site/details/independent-evidence-ledger.html",
    pageTitle: "11 家厂商独立探索基础证据账本",
    eyebrow: "BASE EVIDENCE LEDGER",
    backHref: "independent-research-index.html",
    backLabel: "返回独立研究索引",
  },
  {
    source: "independent_exploration_2026-08-19/unknowns-and-validation.md",
    output: "site/details/unknowns-and-validation.html",
    pageTitle: "华为产品决策 Unknown 与验证合同",
    eyebrow: "UNKNOWNS & VALIDATION",
    backHref: "../huawei-rds-agent.html#gates",
    backLabel: "返回华为验证 Gate",
  },
  {
    source: "independent_exploration_2026-08-19/huawei-catch-up-product-plan.md",
    output: "site/details/huawei-catch-up-product-plan.html",
    pageTitle: "华为数据智能追赶产品计划（方案假设）",
    eyebrow: "PROPOSED PRODUCT PLAN",
    backHref: "../huawei-rds-agent.html#materials",
    backLabel: "返回华为方案材料",
  },
];

const publishedSourceOutputs = new Map(
  pages.map((page) => [resolve(projectRoot, page.source), resolve(projectRoot, page.output)]),
);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rewriteRelativeUrl(rawUrl, sourceFile, outputFile) {
  if (/^(?:[a-z]+:|#|\/)/i.test(rawUrl)) return rawUrl;

  const match = rawUrl.match(/^([^?#]*)([?#].*)?$/);
  if (!match || !match[1]) return rawUrl;
  const absoluteTarget = resolve(dirname(sourceFile), match[1]);
  const publishedTarget = publishedSourceOutputs.get(absoluteTarget) ?? absoluteTarget;
  const fromOutput = relative(dirname(outputFile), publishedTarget).replaceAll("\\", "/");
  return `${fromOutput || "."}${match[2] ?? ""}`;
}

function rewriteGeneratedLinks(html, sourceFile, outputFile) {
  return html
    .replace(/\b(href|src)="([^"]+)"/g, (_match, attribute, url) => {
      const rewritten = rewriteRelativeUrl(url, sourceFile, outputFile);
      return `${attribute}="${escapeHtml(rewritten)}"`;
    })
    .replace(/<a href="(https?:\/\/[^\"]+)"/g, '<a href="$1" target="_blank" rel="noreferrer"');
}

function template(page, renderedMarkdown) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(page.pageTitle)}">
  <title>${escapeHtml(page.pageTitle)}</title>
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="../details.css">
</head>
<body class="detail-page">
  <header class="detail-header" id="top">
    <nav class="detail-nav shell" aria-label="详情页导航">
      <a class="brand" href="${escapeHtml(page.backHref)}">← ${escapeHtml(page.backLabel)}</a>
      <a href="../index.html">数据智能决策首页</a>
    </nav>
    <div class="shell detail-heading">
      <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
      <h1>${escapeHtml(page.pageTitle)}</h1>
      <p>这是完整研究层；演示页保持精简，证据、边界、步骤和来源在这里展开。</p>
    </div>
  </header>
  <main class="shell detail-layout">
    <article class="markdown-body">
${renderedMarkdown}
    </article>
  </main>
  <footer>
    <div class="shell footer-content">
      <div><strong>${escapeHtml(page.pageTitle)}</strong><p>由项目内 Markdown 源文件生成；UTF-8 静态页面，可离线阅读。</p></div>
      <a href="#top" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">返回顶部 ↑</a>
    </div>
  </footer>
</body>
</html>
`;
}

marked.setOptions({
  gfm: true,
  breaks: false,
});

for (const page of pages) {
  const sourceFile = resolve(projectRoot, page.source);
  const outputFile = resolve(projectRoot, page.output);
  const markdown = await readFile(sourceFile, "utf8");
  const rendered = rewriteGeneratedLinks(await marked.parse(markdown), sourceFile, outputFile);
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, template(page, rendered), "utf8");
  console.log(`${page.source} -> ${page.output}`);
}
