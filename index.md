# Databricks 演示内容索引

[立即打开在线演示](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/)

本索引面向演示人和评审者。精简 HTML 只突出结论；完整研究、验证边界和复现步骤保留在仓库中。

## 推荐演示顺序

1. [领导演示首页](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/index.html)：先建立“接入、Delta、治理、计算、消费”的全景；
2. [Genie 深度演示](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/genie.html)：讲业务问答、实现、Monitor/Benchmark 和多种入口；
3. [云数据库到数据 Agent](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/database-agent.html)：回答 RDS、PolarDB、TaurusDB 类产品还缺什么；
4. [录屏与中文讲稿](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/details/recordings.html)：按模块选择 13 段有声视频；
5. [外部视频索引](https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/site/details/external-videos.html)：按听众选取官方或独立讲解片段。

## 三个核心案例

| 案例 | 最佳入口 | 核心结论 |
|---|---|---|
| 对已有数据自然语言分析 | Genie G1、M09、C2 | 先建立可信 SQL 和语义口径，Genie 不绕过权限与 SQL 执行 |
| 智能售后 | Genie G1、C3 | 分析和建议可以自动化，退款、改订单和发消息必须进入审批工具 |
| 数据库智能运维 | Genie G1、C4、D1 | 指标和事故证据可以统一诊断，真实修复需要独立动作网关 |

## 关键架构图

- [平台数据主路径](site/assets/diagrams/platform-data-paths.svg)
- [内嵌与外部使用差异](site/assets/diagrams/embedded-vs-external.svg)
- [Genie 实现架构](site/assets/diagrams/genie-implementation-architecture.svg)
- [Genie 多种使用方式](site/assets/diagrams/genie-usage-modes.svg)
- [云数据库 Agent 能力栈](site/assets/diagrams/cloud-database-agent-capability-stack.svg)
- [云数据库三条接入路线](site/assets/diagrams/cloud-database-integration-routes.svg)

## 完整研究

- [项目范围与验收标准](docs/00-project-brief.md)
- [Lakehouse、数据库与数据路径](docs/research/01-lakehouse-database-and-data-paths.md)
- [自然语言分析与外部 Agent](docs/research/02-natural-language-and-agent-access.md)
- [真实工作区验证](docs/research/03-live-workspace-validation.md)
- [Genie 实现与多种用法](docs/research/04-genie-implementation-and-usage.md)
- [云数据库如何具备 Genie 类能力](docs/research/05-cloud-database-to-governed-data-agent.md)

## 验证记录

- [当前交付状态](STATE.md)
- [站点与云数据库专题校验](evidence/workspace/site-v4-cloud-database-validation.md)
- [中文配音校验](evidence/workspace/zh-voiceover-validation.md)
- [录屏文件与 SHA-256](videos/recordings/README.md)

## 必须保留的边界

- Free Edition 演示不是生产 SLA、网络、合规、容量或成本证明；
- 架构演示不等于外部 API、RDS、PolarDB 或 TaurusDB 的生产实调；
- 所有业务数据均为确定性合成数据；
- Agent 的分析面与退款、改订单、发消息、修库等写动作必须分离。
