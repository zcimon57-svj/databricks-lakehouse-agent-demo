# 数据智能与数据库 Agent 内容索引

[立即打开在线决策首页](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/)

本索引面向演示人和评审者。HTML 展示层只保留决策重点；全量厂商矩阵、证据账本、未知项、实测记录和复现步骤保留在研究层。

## 推荐汇报顺序

1. [领导决策首页](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/index.html)：先讲“从会回答到可信完成数据任务”、三类证据、五平面基线和当前决策请求；
2. [Agent 入口与治理可视报告](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/independent_exploration_2026-08-19/agent-entry-governance-visual-report.html)：用 11 家厂商官方资料说明为什么市场基线已经变化；
3. [67 项能力全集](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/independent_exploration_2026-08-19/vendor-entry-atlas.html#capabilities)：需要追问某项能力、数据源、首次准备或平台/客户责任时，进入 67×11 完整矩阵；
4. [华为产品归属与验证专题](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/huawei-rds-agent.html)：逐项对标 Databricks，讲六个产品模块、PG-first 业务故事、共享控制面、四种产品归属与 G1–G6；
5. [Genie 深度演示](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/genie.html)：用真实工作区讲业务问答、Sources/Instructions、Monitor/Benchmark、内嵌与外部入口；
6. [云数据库到治理型数据 Agent](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/database-agent.html)：补齐通用数据库能力栈、Unity Catalog-like 前置、接入路线和动作边界；
7. [录屏与中文讲稿](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/details/recordings.html)：按听众选择 14 段有声视频；
8. [外部视频索引](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/details/external-videos.html)：按模块补充官方与独立讲解，不把外部视频当账号实测。

## 三类核心材料

| 层级 | 最佳入口 | 使用方式 |
|---|---|---|
| Databricks 工作区实测 | [Genie 专题](site/genie.html)、[真实工作区验证](docs/research/03-live-workspace-validation.md) | 证明本项目实际走过的页面、数据、SQL 和多轮分析路径 |
| 跨厂商公开资料研究 | [可视报告](independent_exploration_2026-08-19/agent-entry-governance-visual-report.html)、[67 项能力全集](independent_exploration_2026-08-19/vendor-entry-atlas.html#capabilities)、[厂商入口图谱](independent_exploration_2026-08-19/vendor-entry-atlas.html) | 识别市场基线、入口演进、细粒度支持范围、数据接入、责任边界和待验证方向 |
| 华为产品决策假设 | [华为专题](site/huawei-rds-agent.html)、[Unknown 与验证](independent_exploration_2026-08-19/unknowns-and-validation.md) | 讨论产品归属、模块边界与验证 Gate，不声明当前已经打通 |

## 重点业务故事

| 故事 | 客户价值 | 数据库不可替代责任 |
|---|---|---|
| 经营分析与追问 | 减少取数等待和口径争议，沉淀可发布分析工件 | 可复算执行、新鲜度、负载保护和结果证据 |
| 智能售后 | 缩短首答时间、降低误承诺、优先恢复关键客户 | 实时状态、历史联查、安全查询；写动作独立审批 |
| 业务影响与数据库诊断 | 缩短收入或服务损失窗口，而不只是提升 DBA 效率 | 引擎事实、慢 SQL/等待/拓扑、预演、执行与验证 |
| SaaS 内嵌数据智能 | 伙伴更快向自身客户提供问数和任务能力 | 租户隔离、配额、SLA、OBO 和稳定 Tool/API 合同 |

## 新增决策架构图

- [数据智能五平面可信任务闭环](site/assets/diagrams/data-intelligence-task-loop.svg)
- [华为双平面、三个领域权威与共享控制面](site/assets/diagrams/huawei-shared-control-plane.svg)
- [华为六个产品模块内部架构图集](site/assets/diagrams/huawei-module-architectures.svg)

## Databricks 与数据库架构图

- [平台数据主路径](site/assets/diagrams/platform-data-paths.svg)
- [内嵌与外部使用差异](site/assets/diagrams/embedded-vs-external.svg)
- [Genie 实现架构](site/assets/diagrams/genie-implementation-architecture.svg)
- [Genie 多种使用方式](site/assets/diagrams/genie-usage-modes.svg)
- [云数据库 Agent 能力栈](site/assets/diagrams/cloud-database-agent-capability-stack.svg)
- [云数据库三条接入路线](site/assets/diagrams/cloud-database-integration-routes.svg)

以下两张图保留为 **Phase 1 历史方案**，不再代表当前承诺：

- [历史：华为 RDS 受治理智能层目标架构](site/assets/diagrams/huawei-rds-agent-target-architecture.svg)
- [历史：华为 RDS 90 天路线](site/assets/diagrams/huawei-rds-agent-90-day-roadmap.svg)

## 决策与独立研究

- [V2 数据智能与数据库 Agent 产品决策 Brief](docs/02-data-intelligence-decision-brief.md)
- [独立探索说明](independent_exploration_2026-08-19/README.md)
- [独立综合结论](independent_exploration_2026-08-19/independent-findings.md)
- [Agent 入口与治理深挖](independent_exploration_2026-08-19/agent-entry-governance-deep-dive.md)
- [厂商能力证据账本](independent_exploration_2026-08-19/agent-entry-evidence-ledger.md)
- [25 个 Unknown 与验证合同](independent_exploration_2026-08-19/unknowns-and-validation.md)
- [华为追赶产品计划草案](independent_exploration_2026-08-19/huawei-catch-up-product-plan.md)（方案假设）
- [华为追赶计划 HTML](independent_exploration_2026-08-19/huawei-catch-up-plan.html)（方案假设）
- [华为产品 UI 原型](independent_exploration_2026-08-19/huawei-product-ui-prototypes.html)（方案假设）

## Databricks 完整研究

- [Phase 1 项目范围与验收标准](docs/00-project-brief.md)
- [Lakehouse、数据库与数据路径](docs/research/01-lakehouse-database-and-data-paths.md)
- [自然语言分析与外部 Agent](docs/research/02-natural-language-and-agent-access.md)
- [真实工作区验证](docs/research/03-live-workspace-validation.md)
- [Genie 实现与多种用法](docs/research/04-genie-implementation-and-usage.md)
- [云数据库如何具备 Genie 类能力](docs/research/05-cloud-database-to-governed-data-agent.md)
- [Phase 1 历史：华为 RDS MySQL / PostgreSQL 90 天落地手册](docs/research/06-huawei-cloud-rds-mysql-postgresql-governed-agent.md)
- [Phase 1 补充：华为 RDS PostgreSQL 范围、故事与模块](docs/research/07-huawei-rds-postgresql-phase1-scope-stories-product-modules.md)

## 验证记录

- [当前交付状态](STATE.md)
- [站点与云数据库专题校验](evidence/workspace/site-v4-cloud-database-validation.md)
- [Phase 1 华为专题与 H1 有声录屏校验](evidence/workspace/huawei-rds-agent-validation.md)
- [中文配音校验](evidence/workspace/zh-voiceover-validation.md)
- [GitHub 公开发布与 Pages 校验](evidence/workspace/github-publication-validation.md)
- [录屏文件与 SHA-256](videos/recordings/README.md)

## 必须保留的边界

- Databricks Free Edition 演示不是生产 SLA、网络、合规、容量、成本或商业版权益证明；
- 华为部分没有目标账号跨产品实测，公开文档不能证明 DataArts、AgentArts、RDS/DAS 已共享对象、身份、任务和 Trace；
- 厂商评分是公开证据驱动的分析模型，不是性能 Benchmark、权威排行或采购结论；
- 所有业务数据均为确定性合成数据；架构演示、方案原型和历史录屏不等于现网能力；
- Agent 的分析面与退款、改订单、发消息、Kill、改参数、扩容和 Failover 等写动作必须分离。
