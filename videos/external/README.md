# 外部视频索引

信息截止：2026-08-17  
状态：主选链接、发布者、发布日期、时长和适用模块已核验；Delta Lake 视频章节已逐段定位。其余视频在正式公开汇报前仍应由讲解人完整观看一次，避免 2024–2025 画面与 2026 UI 名称差异。

## 选择原则

每个主要模块优先保留两类视频：

1. 官方短视频：用于确认产品定位、界面名称和官方叙事；
2. 独立实操或深度讨论：用于补充真实使用经验、限制或端到端操作。

每条最终入选视频必须记录：标题、链接、发布者、发布日期、时长、语言、字幕、适用模块、建议播放时间段、关键信息、已过时部分和观看核验日期。

不下载、截取或重新分发无授权的视频内容；演示 HTML 只嵌入链接、缩略信息和自己的摘要。

## 已发现的官方候选

| 模块 | 视频 | 发布者 | 日期 / 时长 | 当前用途 | 状态 |
|---|---|---|---|---|---|
| Genie | [What is AI/BI Genie?](https://www.youtube.com/watch?v=3_TpRj3z_Gs) | Databricks | 2025-05-28 / 5:19 | 解释自然语言到 SQL、领域专家配置与业务用户使用 | 元数据已核验；待完整观看 |
| Genie Code/端到端 | [Genie Code in action - An end-to-end demo](https://www.youtube.com/watch?v=heouBA5U1bE) | Databricks | 2026-03-11 / 10:26 | 展示从发现数据到 Pipeline 和 Dashboard 的工作区内嵌体验 | 元数据已核验；待完整观看 |
| Dashboard | [Demo: Genie Code for AI/BI Dashboards](https://www.youtube.com/watch?v=x7_6Dp5lgsg) | Databricks | 2026-03-11 / 0:41 | 展示自然语言创建和修改 Dashboard 的短片 | 元数据已核验；待完整观看 |
| Lakeflow | [Lakeflow Connect](https://www.youtube.com/watch?v=pMU8bna1kxo) | Databricks | 2025-06-25 / 0:31 | 峰会短片，快速说明托管数据接入 | 元数据已核验；视频为 unlisted |
| Lakeflow | [Getting Started With Lakeflow Connect](https://www.youtube.com/watch?v=TT-O-s28mGI) | Databricks | 2025-07-07 / 36:43 | UI 与代码接入、治理、可观测和 CI/CD 的完整讲解 | 元数据已核验；待完整观看 |
| Unity Catalog | [Technical Deep Dive for Practitioners: Unity Catalog from A-Z](https://www.youtube.com/watch?v=iMGG1Ng7sy4) | Databricks | 2024-07-23 / 1:18:53 | Catalog、治理与实操深度讲解 | 元数据已核验；需标注 2024 UI/功能差异 |
| Lakebase | [Introduction to Lakebase: OLTP for Data Apps and AI Agents](https://www.youtube.com/watch?v=UQynsu6qklw) | Databricks | 2025-12-22 / 9:49 | Lakebase 定位、Serverless Postgres 与实际应用 | 元数据已核验；待完整观看 |
| Delta Lake | [Delta Lake on Databricks Demo](https://www.youtube.com/watch?v=BMO90DI82Dc) | Databricks | 约 8 分钟 | Delta 转换、流、ACID、Schema、Time Travel、DML 和优化 | 链接与章节已核验 |
| Federation | [Lakehouse Federation](https://www.youtube.com/watch?v=vGyXpHTYgrQ) | Databricks | 公开演示 | 不搬数据访问外部数据库/仓库 | 链接已核验；正式使用前复看 UI/产品状态 |

## 已发现的独立候选

| 模块 | 视频 | 来源 | 日期 / 时长 | 当前用途 | 风险/待核验 |
|---|---|---|---|---|---|
| Free Edition 总览 | [Databricks Tutorial for Beginners 2026](https://youtu.be/SelEvwHQQ2Y) | Analytics Vector | 2026-02-10 / 20:35 | 覆盖 Free Edition、Lakehouse、Unity Catalog、SQL 和 Spark | 待逐项校验准确性与当前 UI |
| Unity Catalog | [ABAC, Lineage, Lakehouse Federation, Discover demo](https://www.youtube.com/watch?v=lWzh7HmiynA) | Josue Bogran Channel，Databricks 产品人员参与 | 2026-02-02 / 16:55 | 领导友好的价值解释与当前功能演示 | 非官方频道；待完整观看并核验主张 |

## 当前推荐组合

- 领导总览：Free Edition 101 中经核验的短片段 + 我们自己的 3 分钟中文总览；
- 数据接入：31 秒官方 Lakeflow 短片开场，随后播放我们的真实工作区操作；
- Unity Catalog：独立 16:55 演示用于业务价值，官方 A-Z 仅作为技术团队深挖材料；
- 自然语言：官方 5:19 Genie 介绍 + 我们的中文数据正确性对照；
- Lakebase：官方 9:49 介绍 + 我们的 Synced Table 与外部 Postgres 连接录屏；
- Genie Code 10:26 用于说明“工作区内嵌为什么上下文更完整”，但不作为本项目的数据湖主流程主体。

### Genie 专题的播放组合

外部官方视频目前最适合做产品定位，2026 Agent mode、Monitor/Benchmark 和 API 差异由本项目真实画面与官方文档补齐：

1. 先播放 Databricks 官方 [What is AI/BI Genie?](https://www.youtube.com/watch?v=3_TpRj3z_Gs) 的 5:19 全片，理解自然语言、领域专家配置和可视化；
2. 播放本地 G1（约 61 秒），展示当前 Agent UI 中退款、数据库事故、Show code 与连续追问；
3. 播放本地 G2（约 83 秒），展示 7 Sources、Instructions、Example、Monitor、Benchmark 和严格失败分析；
4. 播放本地 G3（约 71 秒），讲清工作区、iframe、Conversation API、Agent API/SSE 和多 Agent 责任；
5. [Genie Code end-to-end](https://www.youtube.com/watch?v=heouBA5U1bE) 只用于对比开发者 Agent，不把 Genie Code 与业务数据问答 Genie Agent 混为同一产品。

当前没有找到一条 Databricks 官方公开视频同时完整覆盖 2026 年 Genie Agent mode + Benchmark + 外部 API；正式汇报时应明确这是“官方定位视频 + 本账号实测 + 官方文档架构”的组合，不伪称单一视频覆盖全部能力。

### 云数据库接入 Genie 类能力的播放组合

这个专题没有用单个视频冒充完整方案，而是按能力层组合：

1. 先播本地 D1（约 79 秒），讲清数据库底座、Unity Catalog-like、语义、Agent、评测和动作网关的全景；
2. 用 [Unity Catalog from A-Z](https://www.youtube.com/watch?v=iMGG1Ng7sy4) 深挖统一对象、权限、血缘和审计；其画面是 2024 版本，不能证明 2026 Preview/GA 状态；
3. 用 [Lakehouse Federation](https://www.youtube.com/watch?v=vGyXpHTYgrQ) 说明数据留在 RDS/MySQL/PostgreSQL 等源端的只读查询路径；
4. 用 [Getting Started With Lakeflow Connect](https://www.youtube.com/watch?v=TT-O-s28mGI) 说明 CDC/增量接入、治理和可观测；
5. 最后用 [What is AI/BI Genie?](https://www.youtube.com/watch?v=3_TpRj3z_Gs) 展示业务用户最终看到的自然语言分析体验。

这四段外部视频分别说明治理、联邦、CDC 和问答，不代表已经连接本项目账号之外的 RDS、PolarDB 或 TaurusDB。厂商数据库本身的 HA、只读节点和监控边界以对应官方产品文档为准。

## 按模块的外部视频播放建议

同一视频可以覆盖多个模块；“每个模块有外部讲解”不等于必须准备 15 个不同视频。领导会只播放短片段，技术同事可打开完整视频。

| 模块 | 主选视频 | 汇报时建议 | 与本项目真实录屏的配合 |
|---|---|---|---|
| M01/M14 Workspace 与 Free Edition | [Databricks Tutorial for Beginners 2026](https://youtu.be/SelEvwHQQ2Y) | 只取 Free Edition/Workspace 概览；独立来源的产品主张须和官方限制页交叉核对 | 先播 M01 证明当前 UI，再用外部视频补完整学习路径 |
| M02/M03 Delta/Lakehouse | [Delta Lake on Databricks Demo](https://www.youtube.com/watch?v=BMO90DI82Dc) | `02:37` 架构、`04:06` Time Travel、`05:38` UPDATE/MERGE/DELETE；总览还可看 `00:00–01:55` | M02 展示本工作区 managed table 与 Lineage；外部片补 Delta 行为 |
| M04 Unity Catalog | [Unity Catalog from A-Z](https://www.youtube.com/watch?v=iMGG1Ng7sy4) | 技术深挖材料；领导版优先用下方 16:55 独立演示 | M02 已有 Catalog/Details/Lineage 真实证据 |
| M05 数据接入 | [Lakeflow Connect 31 秒短片](https://www.youtube.com/watch?v=pMU8bna1kxo) | 用作开场；需要实操再看 [36:43 完整讲解](https://www.youtube.com/watch?v=TT-O-s28mGI) | M05 展示当前 Add data 与 Connector 页面 |
| M06 Pipeline/Job | [Getting Started With Lakeflow Connect](https://www.youtube.com/watch?v=TT-O-s28mGI) | 选 UI、治理、可观测与 CI/CD 相关段落 | M06 清楚显示三类创建入口与空状态 |
| M07 SQL Warehouse | [Databricks Tutorial for Beginners 2026](https://youtu.be/SelEvwHQQ2Y) | 只取 SQL Warehouse/SQL Editor 段；以官方 SQL 文档校准 | M07 + C2/C3/C4 是当前账号的直接证据 |
| M08 Dashboard/Metric | [Genie Code for AI/BI Dashboards](https://www.youtube.com/watch?v=x7_6Dp5lgsg) | 41 秒完整播放 | 本轮没建 Dashboard；M09 仅证明 Genie 图表，不混称 Dashboard |
| M09 Genie Agent | [What is AI/BI Genie?](https://www.youtube.com/watch?v=3_TpRj3z_Gs) | 5:19 可完整播放，随后问答 | M09 展示中文问题、SQL、7 Sources、Instructions、Example |
| M10 Lakebase | [Introduction to Lakebase](https://www.youtube.com/watch?v=UQynsu6qklw) | 讲 Postgres、低延迟应用、Lakehouse 同步和 Agent state | M07 只证明入口；明确未创建数据库 |
| M11 Apps | [Genie Code end-to-end](https://www.youtube.com/watch?v=heouBA5U1bE) | 只用于说明平台内嵌工作流；另以 Apps 官方文档为准 | M01 有 App 入口；本轮未建 App |
| M12 Federation/Sharing | [Lakehouse Federation](https://www.youtube.com/watch?v=vGyXpHTYgrQ) | 强调“不搬数据≠没有远端成本/权限” | 本轮无 Connection/Share，必须标 `DOC_ONLY` |
| M13 外部自动化 | [Getting Started With Lakeflow Connect](https://www.youtube.com/watch?v=TT-O-s28mGI) | 选择 API/CI/CD 段；配合本项目外部 API 架构图 | 本项目真实用过 Files/Statement API，但 Token 不留盘 |
| M15 运维/成本 | [Unity Catalog from A-Z](https://www.youtube.com/watch?v=iMGG1Ng7sy4) | 选治理、血缘、审计段；容量/成本另看官方文档 | C4 展示诊断信息链，M07 证明 Warehouse 停止 |
| C3 智能售后 | [What is AI/BI Genie?](https://www.youtube.com/watch?v=3_TpRj3z_Gs) | 用其业务自助分析概念，不当作售后成品演示 | C3 + M09 才是本项目数据和审批边界证据 |
| C4 数据库智能运维 | [Lakehouse Federation](https://www.youtube.com/watch?v=vGyXpHTYgrQ) | 说明外部库可联邦读取；不把它误说成自动修库 | C4 用完全合成的事故真值，不连生产库 |

## Delta Lake 官方视频章节

- `00:00` Overview；
- `00:38` 转换现有数据；
- `01:10` Streaming；
- `01:55` ACID；
- `02:37` Architecture；
- `03:15` Schema；
- `04:06` Time Travel；
- `05:38` UPDATE / MERGE / DELETE；
- `07:49` Optimization。

## 正式汇报前的最后检查

- 完整观看非 Delta 主选视频，记录实际可播放的 30–90 秒时间段；
- 对 2024 Unity Catalog 视频标注旧 UI，不用它证明 2026 Preview/GA 状态；
- 确认会议网络可访问 YouTube；若不可访问，准备官方文档截图和本地录屏，不擅自下载/重分发视频；
- 不把外部视频当作本账号功能已开通的证据；以 `videos/recordings/` 的真实工作区画面为准；
- 智能售后与数据库运维没有合适的 Databricks 官方成品视频，本项目 C3/C4 真实录屏就是主讲材料，外部 Genie/Federation 视频只补平台概念。
