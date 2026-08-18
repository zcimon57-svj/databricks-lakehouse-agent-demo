# Site v4 / 云数据库 Agent 专题验证

验证日期：2026-08-17  
范围：静态展示层、Markdown 详情页、SVG、D1 录屏与隐私；不连接 Databricks 或任何外部生产数据库

## 1. 原始问题修复

- 原来 4 个站内按钮直接跳转 `.md`，浏览器会显示原始 Markdown 或使用不一致的编码/渲染方式；
- 现在由 `scripts/render_markdown_pages.mjs` 使用 `marked` 生成 UTF-8 静态 HTML；
- 生成页：项目约定、真实录屏、外部视频、Genie 完整手册、云数据库完整指南；
- `site/` 下扫描不到任何 `href="...md"`；
- 8 个 HTML 页面均包含 `<meta charset="utf-8">`。

## 2. 新增云数据库专题

- 精简演示：`site/database-agent.html`；
- 完整研究：`docs/research/05-cloud-database-to-governed-data-agent.md`；
- 自动生成详情：`site/details/cloud-database-agent-guide.html`；
- SVG：`cloud-database-agent-capability-stack.svg`、`cloud-database-integration-routes.svg`；
- D1 录屏：`D1-cloud-database-governed-agent-architecture.mp4`。

专题覆盖：

- RDS / PolarDB / TaurusDB 类产品已有的 SQL、HA、Replica、认证和监控底座；
- Unity Catalog-like 的对象、身份、权限、行列策略、发现、分类、血缘和审计；
- Catalog 与业务语义、可信 SQL、Agent Runtime、Benchmark/Monitor 的边界；
- 只读联邦、CDC 入湖仓和混合路由三条接入路线；
- 内嵌、iframe、API 与外部多 Agent 的责任差异；
- 自然语言分析、智能售后、数据库智能运维；
- G0–G8 以及独立动作网关的 preview / approval / verify / rollback。

## 3. 浏览器验证

使用 Playwright + Chromium，从本地 HTTP Server 实际打开页面：

| 页面 | HTTP / 本地链接 | 图片 | 视频 metadata | 隐私扫描 |
|---|---|---|---|---|
| `/site/` | 通过 | 2/2 | 10/10 | 通过 |
| `/site/genie.html` | 通过 | 2/2 | 3/3 | 通过 |
| `/site/database-agent.html` | 通过 | 2/2，均 1600×900 SVG | D1 78.80s | 通过 |
| 5 个 `/site/details/*.html` | 通过 | 无缺图 | 13 个录屏下载链接均 200 | 通过 |

响应式检查：390px viewport 下 `index.html`、`genie.html`、`database-agent.html` 和云数据库详情页均满足 `scrollWidth == clientWidth`；宽表在自身容器内横向滚动。

## 4. D1 视频验证

- Duration：78.80s；
- Codec：H.264 High；
- Pixel format：yuv420p；
- Resolution：1440×900；
- Frame rate：25 fps；
- Audio：无；
- SHA-256：`a6961aab6416b626a3e55d3ecf9ce09bc675d4a1ec37cf86eb5343001c9834ba`；
- 首尾与 6 帧 contact sheet 已人工查看；字幕未遮挡关键流程；
- 视频内明确标注“架构演示、非生产实调”。

## 5. 静态与隐私检查

- `xmllint --noout site/assets/diagrams/*.svg`：通过；
- Markdown renderer 与录屏脚本 `node --check`：通过；
- 私有 Databricks host、邮箱、组织 ID 和已知工作区 ID 扫描：未命中；
- 页面正文 Playwright 隐私扫描：`hasEmail=false`、`hasPrivateWorkspaceHost=false`；
- 本轮未启动 Databricks 浏览器、OAuth、SQL Warehouse 或云数据库连接。

## 6. 证据边界

- D1 和两张新 SVG 是架构演示，不是 RDS、PolarDB、TaurusDB 实际连接证明；
- 厂商能力事实使用官方资料校准，架构推断和实施建议在完整研究稿中分别标注；
- 具体云、引擎、版本、区域、网络、费用、配额和合规仍需要目标环境 PoC。
