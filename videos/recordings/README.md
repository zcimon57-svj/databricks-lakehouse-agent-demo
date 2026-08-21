# 真实 Databricks 工作区录屏索引

信息截止：2026-08-18  
工作区：AWS Databricks Free Edition  
格式：H.264 MP4；真实 UI 约 1440×758 / 4 fps，架构演示 1440×900 / 25 fps；画面内置中文字幕

## 使用说明

这些不是产品宣传片，而是本项目的工作区操作证据和明确标注的本地架构演示。`zh-voice/` 保存 14 段普通话有声版，站点默认播放这一版本；当前目录根部保留逐帧画面一致的无声原版。中文配音使用合成神经语音，不冒充真人录音；逐段讲稿、时间轴、构建方式与哈希见 [配音说明](../../site/details/voiceover.html)，补充材料见 [外部视频索引](../../site/details/external-videos.html)。

隐私处理：录制脚本会替换邮箱和 UUID，模糊账号/头像控件；所有抽检画面均未发现邮箱。数据全部为 `samples` 或 `.invalid` 保留域的确定性合成数据。

## 录屏清单

| 文件 | 时长 | 覆盖模块/案例 | 讲解重点 | 无声原版 SHA-256 |
|---|---:|---|---|---|
| [有声](zh-voice/G1-genie-business-user-multi-use.mp4) · [无声](G1-genie-business-user-multi-use.mp4) | 61.25s | Genie 业务使用、C2-C4 | 明确口径的退款问答、Show code、三个数据库事故、多轮追问与写动作审批边界 | `eade2ba0b51bdc7dba77818e2d9ecc0bb97d4e63930642f019ab08c557f33471` |
| [有声](zh-voice/G2-genie-authoring-monitor-benchmark.mp4) · [无声](G2-genie-authoring-monitor-benchmark.mp4) | 82.75s | Genie 实现与质量闭环 | 7 Sources、Instructions、Curated Example、Monitor、3 个 Benchmark、三次 33% 运行及失败分类 | `b4f7bf896f8c0a87b695a2355bfb3adf5655002c773cb8e7729a514acb140fa7` |
| [有声](zh-voice/G3-genie-embedded-vs-api-architecture.mp4) · [无声](G3-genie-embedded-vs-api-architecture.mp4) | 71.00s | Genie 外部集成 | 工作区、iframe、Conversation API、Agent API/SSE、多 Agent 与审批 Gate；架构演示，非本账号 API 实调 | `170b368e23e3fa5e955559991c9d53056389cf87ff1ce10b16c1411bf39732c2` |
| [有声](zh-voice/D1-cloud-database-governed-agent-architecture.mp4) · [无声](D1-cloud-database-governed-agent-architecture.mp4) | 78.80s | 云数据库接入专题 | 数据库已有能力、Unity Catalog-like、语义/评测、三条接入路线、内外部责任与 G0–G8；架构演示，非生产实调 | `a6961aab6416b626a3e55d3ecf9ce09bc675d4a1ec37cf86eb5343001c9834ba` |
| [有声](zh-voice/H1-huawei-rds-governed-agent.mp4) · [无声](H1-huawei-rds-governed-agent.mp4) | 127.16s | Phase 1 华为历史方案 | 合成客户事故、五个新增服务、MySQL/PG 双切片、固定 90 天与 KPI；保留为研究演进材料，非当前结论、非华为云生产实调 | `d81b30dc262132e7fa75b16cf5913dda1cd81c4a0a3b12fdb73b91923166a6f1` |
| [有声](zh-voice/M01-workspace-free-edition-entrypoints.mp4) · [无声](M01-workspace-free-edition-entrypoints.mp4) | 9.50s | M01、M14 | Free Edition 版本证据；New 菜单里的数据、SQL、Dashboard、Genie、Job、Pipeline、App 入口 | `b0c26bf46c4cc28cc25a27c49be0bebe427a923ff3a10853c80acf46aca6ea0b` |
| [有声](zh-voice/M02-catalog-delta-lineage.mp4) · [无声](M02-catalog-delta-lineage.mp4) | 25.00s | M02、M03、M04、C1 | Catalog→Schema→MANAGED Delta 表→Details→自动 Lineage | `e6c61c9aef49c680332ff95e1034b860be424d30699ec193d05262feaadf09f8` |
| [有声](zh-voice/M05-data-ingestion-paths.mp4) · [无声](M05-data-ingestion-paths.mp4) | 13.50s | M05、C1 | 文件/Volume 与托管数据库/SaaS Connector；本次实测 Files API 路径 | `3be9e0e5e330476048188cc7b04cc888ca6f466a042f35f02f02306fa1e4586a` |
| [有声](zh-voice/M06-jobs-and-pipelines.mp4) · [无声](M06-jobs-and-pipelines.mp4) | 13.75s | M06、M15、C1 | Ingestion Pipeline、ETL Pipeline、Job 的职责；当前为空，不创建资源 | `bb8d87bef05cf5ba8d89d614dc2f4f59beeb1a51d38af8bc1aa015077df58af5` |
| [有声](zh-voice/M07-sql-warehouse-and-lakebase.mp4) · [无声](M07-sql-warehouse-and-lakebase.mp4) | 14.25s | M07、M10、M13、M15 | 分析 SQL Warehouse 与 OLTP Lakebase 分工；内嵌/外部连接责任；只验证 Lakebase 入口 | `c1580b27ebe120b36d30fd827bacb55779348f7897e4b24688d7079ddda3457c` |
| [有声](zh-voice/M09-genie-embedded-natural-language.mp4) · [无声](M09-genie-embedded-natural-language.mp4) | 34.25s | M08、M09、M13、C2-C4 | 中文回答与图表、Show code、7 Sources、Instructions、Curated Example | `ee181f177bb5348cace17050126bad55ec539a20a83e569b09a46da95927f6cd` |
| [有声](zh-voice/C2-natural-language-trusted-sql.mp4) · [无声](C2-natural-language-trusted-sql.mp4) | 16.25s | C2 | 先固定可信 SQL 答案：西南 3、华南 2、东北 1、华北 1，再核对 Genie | `89650509e2459deee639918c5fd4c20ef2ea310985e26d8d6f5ad8f53705165b` |
| [有声](zh-voice/C3-intelligent-after-sales.mp4) · [无声](C3-intelligent-after-sales.mp4) | 15.50s | C3 | 700 条售后数据→18 条行动队列→政策/建议→写动作人工审批 | `8d7c1d3a2e93c152cad09861abe8923127e48c01507221454d0c0aee4048f5eb` |
| [有声](zh-voice/C4-database-intelligent-operations.mp4) · [无声](C4-database-intelligent-operations.mp4) | 16.00s | C4 | 指标/慢 SQL/告警/变更/事故/Runbook→诊断；不连接或修改生产库 | `57809da28269d29aab1a946ef1a55edfea8c60ff6a2f54e781b0833708cb5692` |

总时长约 9 分 39 秒。全部 14 段都有逐画面对齐的普通话解说；旧 9 段适合按模块短插播，G1/G2/G3 是 Genie 专题长讲，D1 是通用云数据库接入专题，H1 保留为 Phase 1 华为方案历史录屏。

## 建议演示顺序

1. 播 M01，30 秒说明账号版本、入口和 Free Edition 边界。
2. 展示 `site/assets/diagrams/platform-data-paths.svg`，再播 M05→M02→M06→M07，讲清“接入→Delta→治理→任务→查询/应用”。
3. 播 C2 作为正确答案基线；快速汇报播 M09，Genie 专题改播 G1，强调答案必须落到受治理执行和可复算工件，SQL 是证据之一。
4. 播 G2，展示实现面和真实 Benchmark：不能把真值错误、输出契约失败和评测器异常都算给模型。
5. 播 G3 并展示两张 Genie SVG，总结工作区、iframe、API 与多 Agent 的责任差异。
6. 播 D1 并展示两张云数据库 SVG，解释 RDS / PolarDB / TaurusDB 类产品要补的前置治理、语义、评测和三条接入路线。
7. 对华为方向评审时先展示当前华为产品决策专题；只有需要回溯研究演进时再播 H1，并明确双引擎、五个服务和固定 90 天已被降级为历史假设。
8. C3/C4 作为售后和运维的短版 SQL 证据；G1 已把二者放入同一个连续 Agent 会话。

## 领导版口述提纲

- Databricks 的主线不是“又一个数据库”，而是一份受治理的数据同时服务接入、处理、SQL、BI、自然语言、应用和共享。
- Delta/Unity Catalog/SQL Warehouse 分别解决可靠表、统一治理和分析计算；Lakebase 是另一个面向事务应用的 Postgres 路径。
- Genie 的价值不是绕过 SQL，而是把领域专家维护的口径、示例、数据源和权限包装成业务用户能直接提问的接口。
- Benchmark 是回归评测，不是训练集；本轮最终有效运行严格准确率仍为 33%，其余两题分别是输出契约失败和评测器异常待复核。
- 内嵌体验由平台接好身份、权限、计算、图表和反馈；外部 API/Agent 可以嵌入业务流程，但身份代理、失败恢复、审计和审批不能甩给模型。
- Free Edition 足以验证功能路径，不代表生产 SLA、私网、合规、容量或成本结论。

## 未做成“真实资源操作”的模块

- AI/BI Dashboard/Metric View：本轮用 Genie 生成图表和官方 Dashboard 视频说明，没有创建 Dashboard；
- Databricks Apps：入口可见，未创建 App；
- Lakehouse Federation/Open Sharing：完整研究与外部视频覆盖，未创建 Connection/Share；
- Lakebase：真实入口已录，官方配额确认，但没有创建项目、分支或数据库。

这些边界在汇报中必须原样说明，不能用官方视频替代本工作区实测证据。
