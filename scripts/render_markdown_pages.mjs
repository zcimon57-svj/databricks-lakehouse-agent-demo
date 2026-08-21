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
    pageTitle: "从客户任务开始：11 家厂商独立探索索引",
    eyebrow: "独立研究入口",
    intro: "先选你要回答的问题，再进入证据、结论或产品方案；不用先理解整套术语。",
    stripSourceTitle: true,
    backHref: "../../independent_exploration_2026-08-19/agent-entry-governance-visual-report.html",
    backLabel: "返回友商可视报告",
  },
  {
    source: "independent_exploration_2026-08-19/start-here.md",
    output: "site/details/independent-reader-guide.html",
    pageTitle: "先看这页：数据智能研究读者指南",
    eyebrow: "阅读起点",
    intro: "用一个真实业务问题说明这套研究在解决什么，并把容易混淆的名词一次讲清楚。",
    stripSourceTitle: true,
    backHref: "independent-research-index.html",
    backLabel: "返回独立研究索引",
  },
  {
    source: "independent_exploration_2026-08-19/reader-first-editorial-contract.md",
    output: "site/details/reader-first-editorial-contract.html",
    pageTitle: "面向读者的技术产品文档合同",
    eyebrow: "后续编辑规则",
    intro: "用同一套规则保护客户任务、术语身份、证据边界、正文与附录分层，以及桌面和手机阅读质量。",
    stripSourceTitle: true,
    backHref: "independent-research-index.html",
    backLabel: "返回独立研究索引",
  },
  {
    source: "independent_exploration_2026-08-19/independent-findings.md",
    output: "site/details/independent-findings.html",
    pageTitle: "11 家厂商独立探索：结论与产品启示",
    eyebrow: "研究结论",
    intro: "先看用户任务、关键结论和证据边界；评分方法与逐项证据留在后文。",
    stripSourceTitle: true,
    backHref: "../index.html#market",
    backLabel: "返回决策首页",
  },
  {
    source: "independent_exploration_2026-08-19/agent-entry-governance-deep-dive.md",
    output: "site/details/agent-entry-governance-deep-dive.html",
    pageTitle: "当用户用一句话启动数据任务：入口、治理、授权与厂商差距",
    eyebrow: "入口与治理专题",
    intro: "从一次退款率分析任务出发，说明产品入口、身份权限、治理和执行边界怎样连成完整链路。",
    stripSourceTitle: true,
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
    pageTitle: "还不知道什么，以及怎样验证",
    eyebrow: "待验证问题",
    intro: "这里记录尚不能确认的能力、需要什么证据，以及未通过检查时应当怎样停止。",
    stripSourceTitle: true,
    backHref: "../huawei-rds-agent.html#gates",
    backLabel: "返回华为验证 Gate",
  },
  {
    source: "independent_exploration_2026-08-19/huawei-catch-up-product-plan.md",
    output: "site/details/huawei-catch-up-product-plan.html",
    pageTitle: "华为云数据智能产品方案：先跑通客户任务，再选择架构",
    eyebrow: "产品方案建议",
    intro: "先说明客户要完成的任务和产品应交付的结果，再展开能力分层、架构取舍与验证计划。",
    stripSourceTitle: true,
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
      <p>${escapeHtml(page.intro ?? "这是完整研究层；演示页保持精简，证据、边界、步骤和来源在这里展开。")}</p>
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
  const pageBody = page.stripSourceTitle
    ? rendered.replace(/^\s*<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>\s*/, "")
    : rendered;
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, template(page, pageBody), "utf8");
  console.log(`${page.source} -> ${page.output}`);
}
