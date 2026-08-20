# 独立探索结论：DataArts、Databricks 与云上数据智能产品

> 研究基准日与公开资料核验日：2026-08-19
>
> 证据范围：只使用本轮重新访问的公开官方资料；未使用本仓库既有研究、历史 Session 或记忆。
>
> 验证边界：没有任何厂商账号级控制台验证，因此本文没有“实际观察”结论。

## 1. 决策摘要

### 1.1 目前可以确认什么

1. **`官方声明` DataArts 不是一个已经由公开证据证明为单一对象模型的完整产品。** DataArts Studio 是数据开发与治理平台，DataArts Insight 是独立 BI 服务，DataArts Fabric 是数据与 AI 开发平台，LakeFormation 是湖元数据与权限服务；数据库侧另有 DAS、RDS DBA、DWS MCP 等入口。它们分别具备重要骨架，但公开材料只证明“可搭配”或“可连接”，没有证明共享资源 ID、业务语义、最终用户身份、行列策略、会话、评测或发布生命周期。[Studio 产品边界](https://support.huaweicloud.com/productdesc-dataartsstudio/dataartsstudio_07_001.html)、[Insight 产品边界](https://support.huaweicloud.com/productdesc-dataartsinsight/dataartsinsight_01_0002.html)、[Fabric 产品介绍](https://support.huaweicloud.com/productdesc-fabric/dataartsfabric_01_0003.html)、[LakeFormation 产品介绍](https://support.huaweicloud.com/intl/zh-cn/productdesc-lakeformation/lakeformation_01_0001.html)

2. **`官方声明` DataArts Insight 已有可用的 BI/问数骨架，但智能分析助手的公开边界仍明显偏受控场景。** 它有数据源、数据集、问数配置、SQL/解析过程、反馈、评测、自然语言查询 API、iframe/Ticket 嵌入和行列权限；同一官方文档也把智能分析助手标为公测，建议短而明确的问题、以一问一答为主、通常响应不少于 10 秒，并要求用户复核准确性。[助手概述与限制](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_1001.html)、[问题解析过程](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5074.html)、[NL Query API](https://support.huaweicloud.com/api-dataartsinsight/InvokeNlQuery.html)

3. **`官方声明` Databricks 的主要领先来源不是“有聊天框”，而是贯通对象。** Unity Catalog 管理表、视图、卷、函数、模型、服务和 Agent/MCP 等对象；metric views 把指标与 Agent 元数据作为目录对象；AI/BI Dashboard、Genie Agents、SQL、外部工具复用这些受治理对象；Genie 另有多轮 API、评测、反馈、可信 SQL 与嵌入路径。[Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog)、[Unity Catalog 语义层](https://docs.databricks.com/aws/en/uc-semantics/)、[Genie Agents](https://docs.databricks.com/aws/en/genie/set-up)、[Genie Agents API](https://docs.databricks.com/aws/en/genie-agents/conversation-api)

4. **`官方声明` Databricks 也不是无缝、全 GA 或无限制。** 一个 Genie Agent 最多接入 30 个表/视图；计算凭据来自作者而数据权限按最终用户执行；上下文过长会降质或阻塞；联邦查询被官方定位为临时/概念验证路径并有只读、无缓存和大结果风险；Agent Mode API、托管 MCP、局部语义能力仍有 Beta/Preview；Unity Catalog metastore 仍是每 Region 一个。[Genie 限制](https://docs.databricks.com/aws/en/genie/set-up)、[故障排查](https://docs.databricks.com/aws/en/genie-agents/troubleshooting)、[Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/database-federation)、[metastore](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore)

5. **`官方声明` 市场基线已经从 NL2SQL 提升为“受治理语义 + 可信查询 + 评测/Trace + 外部 Agent/API”。** Microsoft Fabric Data Agent、Google Conversational Analytics、Snowflake Cortex Analyst/Agents、Amazon Quick/SageMaker Data Agent、阿里 Quick BI/DMS、火山 Data Agent 和腾讯 DataBuddy 均至少覆盖其中一部分；Google、Microsoft、Snowflake 已公开 Ground Truth/verified query 或程序化评测能力。[Microsoft 评测 SDK](https://learn.microsoft.com/en-us/fabric/data-science/evaluate-data-agent)、[Google verified queries](https://docs.cloud.google.com/bigquery/docs/create-data-agents)、[Snowflake Analyst evaluations](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst-evaluations)

6. **`官方声明` 数据库原生智能已经形成另一条市场基线。** Databricks Lakebase、Oracle Select AI Agent、阿里 DMS MCP、腾讯 DatabaseClaw 和华为 DAS/RDS 都把实时会话、查询、执行计划、日志、权限或变更控制保留在数据库上下文；其中 Databricks Lakebase 的 AI 辅助诊断仍为 Beta，腾讯 DatabaseClaw 文档则明确 L1-L4 分级确认与高危 Deny。[Lakebase AI 诊断](https://docs.databricks.com/aws/en/oltp/projects/ai-assisted-troubleshooting)、[Oracle Select AI Agent](https://docs.oracle.com/en/cloud/paas/autonomous-database/serverless/adbsb/about-select-ai-agents.html)、[阿里 DMS MCP](https://help.aliyun.com/zh/dms/use-cases/deploy-dms-mcp)、[腾讯 DatabaseClaw](https://cloud.tencent.com/document/product/1813/130681)

### 1.2 条件性结论

- **`推断` 当前证据不支持“数据库部门重做一套通用 DataArts/BI/Agent 平台”。** 这样会重复数据开发、目录、语义、Dashboard、问数、评测和模型/Agent 平台能力。
- **`推断` 当前证据也不支持“只给 DataArts 增加一个数据库连接器即可”。** 连接器不能自动承担主从拓扑、数据库 Role/RLS、负载预算、事务状态、执行计划、锁/会话、变更风险和动作验证。
- **`建议` 在账号验证前，最稳健的候选产品形态是“双平面、一个客户旅程”：** DataArts/BI 平面负责跨域数据、语义、分析、评测和业务入口；数据库平面负责实例上下文、安全执行与运维；二者通过共享身份映射、证据对象和受控工具契约连接，由统一入口或客户现有 Agent 路由。组织归属应在 Gate 通过后决定，而不是由外部产品类比直接决定。

### 1.3 现在不能确认什么

- **`Unknown`** DataArts Studio、Insight、Fabric、LakeFormation 与数据库产品在内部是否已有未公开的共享对象、权限映射、语义 API、Agent Runtime 或路线图。
- **`Unknown`** 指定华为云账号、Region、Edition 中上述公测/邀测能力的当前可见性与端到端成功率。
- **`Unknown`** DataArts Insight 的列脱敏文档所述“部分路径可看到明文”是否仍是当前预期行为；在账号复核前它是安全 Gate，不可外推为普遍漏洞。[列权限文档](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0209.html)
- **`Unknown`** 客户愿意为哪种产品面单独付费；公开功能与竞品存在只证明市场供给，不证明华为云目标客户需求强度。

## 2. 比较单位与成熟度标尺

本文同时使用三种比较单位，避免把多个产品机械相加：

| 比较单位 | 用途 | 例子 |
|---|---|---|
| 单功能对单功能 | 判断同名能力深度 | Insight 问数 vs Genie Agent vs Cortex Analyst |
| 产品组合对产品组合 | 判断底座与集成 | Studio + Insight + LakeFormation + DB vs Databricks 平台 |
| 同一客户任务端到端 | 判断是否值得购买 | 从接数、定义指标、提问、复核、共享到持续运营 |

成熟度不使用总分，而区分以下阶段：

1. 官网声明；
2. 可配置；
3. 公开文档可还原端到端流程；
4. 有权限、失败处理、评测和运营证据；
5. 有稳定 API/SDK/嵌入供外部复用；
6. GA、区域/Edition/价格/SLA 清晰，可规模销售。

一个能力在某阶段有证据，不自动继承后续阶段。

## 3. 华为云公开产品边界

### 3.1 不是一个简单的“DataArts”盒子

| 产品面 | `官方声明` 的核心对象/职责 | 已证明的接口 | 本轮未证明的连接 |
|---|---|---|---|
| DataArts Studio | 管理中心、数据集成、架构、开发、质量、目录、数据服务、安全；底层使用其他湖/数据库引擎 | 多模块 REST API；Java/Python/Go SDK | 与 Insight 共享数据集、指标、权限、会话、评测和资源 ID：`Unknown` |
| DataArts Insight | 数据源、数据集、Dashboard/大屏、智能分析助手、嵌入 | REST API；NL Query；Ticket/iframe | 直接复用 Studio 架构/目录/质量/安全对象：`Unknown` |
| DataArts Fabric | Serverless SQL 与 Ray Data/Train/Serve，结构化和非结构化数据开发 | SQL、REST、Python 等 | 与 Studio/Insight 的统一发布和治理闭环：`Unknown` |
| LakeFormation | Catalog/Database/Table/Function 与 OBS 路径权限 | API/SDK | 覆盖 Insight 资产、业务指标、RDS 权限：未由公开材料证明 |
| DAS / RDS DBA | 数据库开发、会话、性能、全量/慢 SQL、诊断、SQL 限流和容量 | 控制台与相关服务接口 | 把实时数据库证据以稳定对象提供给 Insight/Studio：`Unknown` |
| DWS MCP / DAS MCP 示例 | 为 Agent 暴露查询或运维工具 | MCP / 官方示例 | 托管生产网关、短期身份、审批、幂等与回滚的一致契约：未证明 |

支持以上边界的直接材料见[Studio API](https://support.huaweicloud.com/api-dataartsstudio/dataartsstudio_02_0007.html)、[Insight API](https://support.huaweicloud.com/api-dataartsinsight/dataartsinsight_api_0008.html)、[LakeFormation 权限](https://support.huaweicloud.com/productdesc-lakeformation/lakeformation_01_0030.html)、[DAS 产品介绍](https://support.huaweicloud.com/productdesc-das/das_01_0002.html)、[DWS MCP](https://support.huaweicloud.com/intl/en-us/devg-911-dws/dws_04_1464.html)。

### 3.2 DataArts Studio：平台骨架存在，组合成本也存在

- **`官方声明`** Studio 以底层湖/仓/数据库作为引擎，自身提供集成、开发和治理；因此不能把 Studio 版本购买等同于已购买完整存储与计算。
- **`官方声明`** 2026-02-11 的版本文档区分免费、初级、专家、企业版，能力随 Edition 不同；升级基础实例会创建新的集成集群，需要手工迁移旧集群的数据连接与作业。[版本](https://support.huaweicloud.com/productdesc-dataartsstudio/dataartsstudio_07_009.html)、[计费与升级](https://support.huaweicloud.com/productdesc-dataartsstudio/dataartsstudio_07_015.html)
- **`官方声明`** 连接 RDS 需要 CDM Agent 代理以及 Region/AZ/VPC/子网/安全组等前置条件，Agent 并发超过 200 个活动线程会排队；这说明“支持 RDS”不等于零配置直连。[RDS 连接](https://support.huaweicloud.com/intl/en-us/usermanual-dataartsstudio/dataartsstudio_01_1303.html)
- **`推断`** Studio 是继续演进的重要骨架，但还不能仅凭模块名称证明它能承载统一的业务问数与外部 Agent 产品面。

### 3.3 DataArts Insight：已有闭环的部分与明确边界

**已由官方材料证明：**

- 支持 DWS、ClickHouse、GaussDB、MySQL、PostgreSQL、Doris 等助手数据源；需先创建项目、数据源、数据集和助手，并同步表语义配置。[助手配置](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0302.html)
- 可配置模型、Prompt 模板、场景、多数据集、同义词、关键词改写和实体；问题过程可查看关键词改写、检索、Prompt、语义 SQL、DQE 和物理 SQL。[配置](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5071.html)、[问题详情](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5074.html)
- NL Query API 接受主题、会话、数据集、消息及是否返回 insight 等参数；嵌入支持 Dashboard、大屏和助手，助手只支持 Ticket 认证。[NL Query API](https://support.huaweicloud.com/api-dataartsinsight/InvokeNlQuery.html)、[嵌入](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0455.html)
- 有评测集、标注、助手对比和 BadCase 入口；公开材料还不足以确认所有指标、权限负例、CI/CD Gate 和长期结果保留行为。[评测](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5080.html)

**官方文档同时给出的限制：**

- 公测，偏数据查询而非复杂计算/分析；建议明确、无歧义、短问题，仍以一问一答为主；用户需要检查结果，响应通常不少于 10 秒。
- 历史仅记录成功问答、保存近 30 天且仅保留最初结果；失败样本若未进入其他日志，就难以仅凭会话历史运营质量。
- Ticket 可绑定用户/用户组权限，但持有有效 Ticket 的人可访问对应资产与数据，因此 Ticket 生命周期、传递和泄漏防护是嵌入安全的一部分。
- 企业版、助手公测、订阅/共享模型等说明在不同日期文档中存在状态差异，账号与合同必须复核，不能由文档自行消除冲突。[产品规格](https://support.huaweicloud.com/productdesc-dataartsinsight/dataartsinsight_01_0006.html)、[计费模式](https://support.huaweicloud.com/price-dataartsinsight/dataartsinsight_04_0003.html)

### 3.4 数据库产品已有不可忽略的证据与控制面

- **`官方声明`** RDS DBA 提供会话、KILL、SQL 限流、性能和容量等实例级能力；全量 SQL 默认关闭，高流量可能丢失，超长 SQL 可能被丢弃或截断，采集也有性能边界。[RDS DBA](https://support.huaweicloud.com/usermanual-rds-mysql/rds_08_0037.html)、[SQL 洞察限制](https://support.huaweicloud.com/usermanual-rds-mysql/rds_08_0032.html)
- **`官方声明`** DAS MCP 最佳实践仍是公测示例，要求部署公开样例并配置 AK/SK；示例工具可创建收费资源。它证明可接入 MCP，不证明已形成最小权限、短期凭据、审批与回滚的托管生产面。[DAS MCP 最佳实践](https://support.huaweicloud.com/bestpractice-das/das_best_practice_01_0017.html)
- **`推断`** 数据库团队已经掌握问数产品难以替代的运行时证据，但“拥有证据”与“已经有安全、可复用的 Agent 产品契约”仍是两件事。

## 4. Databricks 的真实闭环与边界

### 4.1 可还原的端到端旅程

1. 数据通过 Lakeflow/批流/CDC 进入 Lakehouse，或通过 Federation 只读查询外部数据库。
2. Unity Catalog 管理数据、函数、模型、服务、权限、血缘与审计。
3. Unity Catalog metric views 定义可复用指标、维度、Join、同义词和显示格式。
4. 数据团队用可信 SQL、指令、示例和最多 30 个表/视图配置 Genie Agent。
5. 业务用户在 Dashboard、Genie One、Agent、移动端或 Teams 中提问；数据访问按用户权限执行。
6. 作者查看 SQL、反馈、完整会话或基准测试，人工调整语义、可信资产和指令；反馈不会自动训练 Agent。
7. 开发者用多轮 Conversation API、Apps、iframe 或 MCP 接入其他应用；不同入口的阶段和身份模式并不完全一致。

直接材料：[Lakeflow CDC](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/cdc-overview)、[metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views/)、[Genie 监控与评测](https://docs.databricks.com/aws/en/genie-agents/monitor)、[Dashboard 嵌入](https://docs.databricks.com/aws/en/dashboards/share/embedding/)。

### 4.2 领先来源拆解

| 来源 | 为什么比单点 NL2SQL 更深 | 边界 |
|---|---|---|
| 目录对象贯通 | 语义、函数、模型、服务、Agent/MCP 与数据对象可受同一 Catalog 治理 | 每 Region 一个 metastore；跨 Region 仍需设计 |
| 语义成为可查询对象 | metric view 能被 SQL、Notebook、Dashboard、Genie 和外部 BI 使用 | local metric views、参数、物化等部分能力仍 Preview |
| 可信答案机制 | trusted assets 可绑定参数化 SQL/函数；回答能标识是否命中 | 未命中时仍生成 SQL；需要覆盖率与回退运营 |
| 质量运营 | 测试集最高 500 条、SQL/结果等价、人工反馈和会话复核 | 结果详情有保留期；5000 行、排序/截断会影响判定；反馈不自动学习 |
| 多入口 | UI、API、Apps、Dashboard、Teams、MCP | Agent Mode API 与 MCP 等仍 Beta/Preview；身份模式随入口不同 |
| DB 与 Lakehouse 联动 | Lakebase 遥测写入 UC，再由 Insights/Genie 诊断 | 2026-08-19 为 Beta，限 Lakebase Autoscaling 和支持云/Region |

### 4.3 不能忽略的失败与运营行为

- **权限失败：** 用户需对 Agent 中所有对象有 `SELECT`；无权限数据可能返回空结果。作者计算凭据失效也会让查询失败。
- **上下文失败：** 长对话可能因 token/context 降质，最终阻塞新消息；复杂问题应重启会话或缩小 Agent。
- **API 差异：** Conversation API 是异步轮询路径，文档建议退避并按 10 分钟超时处理；UI 的两阶段响应不完全由 API 复现。
- **外部数据库风险：** Federation 为只读，但官方建议用于临时/POC；大结果单流可能导致内存问题，且无查询缓存。
- **策略限制：** row filter/mask 对外部 Delta/Iceberg API、克隆、时间旅行、共享等存在限制，不能把“有行列策略”外推为所有访问路径等价。[行过滤与掩码限制](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks)
- **成本状态：** 2026-08-03 发布说明称 Genie One/Agents 的用户使用免费延长至 2027-01-31，服务主体调用仍计费；促销不是长期 TCO。[2026 发布说明](https://docs.databricks.com/gcp/en/ai-bi/release-notes/2026)

### 4.4 Lakebase 提供的关键反例

**`官方声明`** Lakebase 的高级遥测采集会话/等待、执行计划与统计、DDL、数据库/计算指标和 Postgres 日志到客户自己的 Unity Catalog Delta 表；Insights 周期发现问题，Genie 可查询实时状态、解释证据，并在每个调查查询和修复动作前要求用户确认。[AI 辅助排障](https://docs.databricks.com/aws/en/oltp/projects/ai-assisted-troubleshooting)、[Genie 诊断与修复](https://docs.databricks.com/aws/en/oltp/projects/observability-genie)

这说明即便目录和 Agent 统一，数据库智能仍需要数据库原生采集与控制；正确的统一方式是让数据库证据进入共享治理面，而不是让通用 BI 猜测数据库状态。

## 5. 市场基线：主要国际与国内产品组合

### 5.1 可改变决策的横向事实

| 厂商组合 | 已公开的强证据 | 公开限制/成熟度信号 | 对本决策的含义 |
|---|---|---|---|
| AWS Quick + SageMaker Unified Studio + Lake Formation + AgentCore | Quick Topic 具备语义字段、verified answers、反馈、RLS、嵌入；SageMaker Data Agent 可多轮生成/修复 SQL；AgentCore 有 Trace 与在线/批量评测 | 语义 BI、数据开发、Catalog、Agent 运营分属多服务；项目执行 Role 可能令项目成员共享数据权限 | 单一首页不等于单一治理对象；组合可行但集成成本必须显式化 |
| Microsoft Fabric + Power BI + Purview | OneLake、semantic model、Data Agent、SQL/DAX/KQL、程序化 Ground Truth 评测、Git/部署管线、Copilot Studio/365 接入 | Data Agent 输出最多 25x25，非英语和非结构化数据受限，跨 Region 数据源不能查询；部分消费路径 Preview | 一体化 SaaS 是强参照，但仍有区域、容量和渠道边界 |
| Google BigQuery + Looker + Conversational Analytics API | LookML 作为语义真源；BigQuery Agent 支持 verified queries、Glossary、API、按用户身份查询；API 对 BigQuery/Looker 已 GA | 一些数据库源/安全特性仍 Preview；大数据量降低推理准确率，结果/Token/可视化与配额有限 | “语义模型 + 数据 Agent API”可独立产品化并服务多入口 |
| Snowflake Semantic Views + Cortex Analyst/Agents | Semantic View 是数据库对象；Analyst API-first、多轮、feedback、verified query、评测；Agent 统一结构化/非结构化/自定义工具并有观测 | Analyst 多轮看不到上一查询结果；仅回答 SQL 可解问题；评测不覆盖多轮且需人工数据集 | 数据云可以把语义和 Agent 做成原生对象，但正确性运营仍需人工 |
| Oracle Analytics + Autonomous AI DB Select AI Agent + OCI GenAI | Analytics 有成熟语义模型；Select AI 在数据库内提供 NL2SQL/RAG/PLSQL/REST、记忆和 Agent team；DB MCP 遵守数据库安全机制 | Analytics 与 DB/OCI Agent 仍是不同产品面；MCP 并非自动只读，工具与最小数据库权限由客户负责 | 数据库内 Agent 很强，但不应据此复制通用 BI；动作权限必须在 DB 层硬约束 |
| 阿里 DataWorks + Quick BI + DMS + 百炼 | DataWorks DI Agent 可用自然语言创建/管理单表或整库、离线或实时同步，并探测 Schema、生成映射/资源/调度草稿、确认后发布；Governance Agent 可扫描、生成治理方案/SQL Diff、确认后修复并复检；Quick BI 小Q有数据集语义/知识/权限/API/Skill；DMS MCP 有 NL2SQL、SQL 执行、变更工单、审批和日志 | Data Agent 购买、Serverless 资源组、Region/Edition/Token 与计算费用有前置边界；Quick BI、DataWorks、DMS 仍是分散产品面，同一 Session、最终用户委托、策略和 Trace 未被公开证明 | 国内基线已经从“BI 问数 + 数据开发”上升为“对话接数/治理 + BI 消费 + DB 安全动作” |
| 腾讯 DataBuddy + DatabaseClaw + WeData/BI | DataBuddy 声明统一元数据/语义、OBO、危险 SQL 拦截与人工确认；DatabaseClaw 有数据库遥测、VPC 内部署、L1-L4 与 Deny | DataBuddy 公开文档很新，账号可用性、成熟度和指标需验证；DatabaseClaw 状态文档存在内测与商业化公告差异 | 这是最接近“数据平台平面 + DB 控制平面”的国内参照，但不能只凭新产品营销采纳结论 |
| 火山 DataLeap + Data Agent | 语义模型、企业知识、召回/Prompt 干预、多轮深度分析、OpenAPI/H5/飞书；ByteHouse 加速 | 官方说明首轮 SQL 不准通常导致链路整体质量不高，且幻觉客观存在；私有化与 SaaS 边界需区分 | 透明描述失败链路比模糊准确率更有决策价值 |
| 百度 Sugar BI | 当前私有化智能问数有模型选择、知识、澄清、SQL、反馈、嵌入 | 旧 AI 问答已下线；新智能问数仍邀测且仅私有部署，文档代际容易混淆 | 产品废弃与版本重建是长期维护和客户迁移风险 |

主要直接来源：[Quick Topic 运营](https://docs.aws.amazon.com/quick/latest/userguide/topics-performance.html)、[SageMaker Data Agent](https://docs.aws.amazon.com/sagemaker-unified-studio/latest/userguide/sql-query-data-agent.html)、[Fabric Data Agent](https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent)、[Google API 发布说明](https://docs.cloud.google.com/gemini/data-agents/conversational-analytics-api/release-notes)、[Snowflake Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)、[阿里 DataWorks DI Agent](https://help.aliyun.com/zh/dataworks/user-guide/introduction-to-data-integration-and-ai-native-capabilities)、[阿里 DataWorks 数据治理 Agent](https://help.aliyun.com/zh/dataworks/user-guide/data-governance-agent)、[阿里 DMS MCP](https://help.aliyun.com/zh/dms/use-cases/deploy-dms-mcp)、[腾讯 DataBuddy FAQ](https://cloud.tencent.com/document/product/1835/135597)、[火山 Data Agent](https://www.volcengine.com/docs/86760/2552692?lang=zh)、[Sugar 智能问数](https://cloud.baidu.com/doc/SUGAR/s/Llpqgy2kv)。

### 5.2 从市场事实提炼出的新基线

以下是 **`推断`**，不是任何单一厂商的官方标准：

1. **作用域化 Agent，而非全库聊天。** 通过 Topic/Agent/Explore/Semantic View/数据集限定领域，并显式描述 Join、指标和默认过滤。
2. **确定性资产优先。** verified/trusted/golden query、参数化 SQL 或受治理函数要优先于自由生成；没有命中时需要清晰回退。
3. **最终用户权限优先。** Agent 权限与数据权限分离，查询尽量以最终用户或可追踪的 OBO 身份执行；共享服务身份必须标明数据暴露范围。
4. **透明失败。** 返回 SQL、解释、数据时间、来源、权限不足、截断、超时、限流与无法回答，而不是把所有失败变成自然语言答案。
5. **质量是一项运营职能。** Ground Truth、权限负例、结果等价、BadCase、Trace、反馈、版本和回归不可缺少。
6. **外部入口是一等能力。** API、SDK、iframe、Agent/MCP 需要与 UI 共享语义和权限，而不是另建一套薄接口。
7. **只读调查和有副作用动作分层。** 动作需要硬权限、风险等级、草案、人工确认、工单/审批、幂等、执行证据和结果验证。

## 6. 五条客户任务链，而不是功能清单

| 任务 | 谁付费/为什么 | 完整链路 | 必要失败行为 | 产品责任判断 |
|---|---|---|---|---|
| 经营/利润/库存追问 | 业务负责人；缩短决策等待 | 接数/CDC → 质量 → 指标/Join → 问数 → SQL与口径复核 → 图表/报告 → 订阅 | 口径歧义先澄清；数据过期、截断、权限不足可见；不把推断写成事实 | DataArts/BI 主责；DB 提供安全新鲜数据路径 |
| 售后、订单、退款、工单联查 | 客服/运营；降低处理时长 | 多系统数据 → 客户/订单实体匹配 → 多步分析 → 建议 → 人工确认 → 工单动作 | 身份不一致或证据不足停止；建议和执行分离；保留来源 | 数据/Agent 平面编排；业务系统执行；DB 只提供受控查询/事务动作 |
| 财务对账、风险、合规 | 财务/审计；减少损失与审计成本 | 快照/水位 → 规则/指标 → 差异分析 → 证据包 → 审批 → 导出/留存 | 明确账期、币种、快照、重复与缺失；不可仅用 LLM judge | 数据治理/语义主责；DB 提供一致性、快照和审计证据 |
| DB 性能与业务影响联合分析 | DBA/SRE/应用 Owner；降低故障时长 | 实例遥测 → 慢 SQL/锁/计划 → 业务实体/指标关联 → 根因 → 动作草案 → 审批/执行 → 验证 | 无实时证据不下根因；高危动作硬拦截；可取消、超时、回滚 | DB 产品主责实时诊断与动作；DataArts 负责历史/业务关联与跨域分析 |
| 嵌入客户 SaaS 或外部 Agent | ISV/开发者；给产品增加数据智能 | OBO/OAuth → 领域 Agent → API/MCP → 流式状态 → 结果/引用 → 限流/账单 → Trace | 身份缺失拒绝；服务身份需显式；超时、重试、结果过期可机器识别 | 公共 Agent/API 面主责；语义来自 DataArts；DB 工具只暴露最小能力 |

**`推断`** 最有独立购买价值的不是“生成 SQL”，而是把可信指标、权限、跨源证据、可复核分析和安全动作嵌入客户决策。纯代码补全或 DBA 提效仍重要，但更可能是平台留存/增购能力，而非单独支撑通用数据智能新品。

## 7. 数据库部门不可替代的责任

### 7.1 应保留在数据库控制面的内容

| 责任 | 为什么不能只交给通用数据平台 |
|---|---|
| 实例与拓扑 | 主库、只读副本、分析副本、Region、故障切换和复制延迟是实时运行状态 |
| 方言与执行语义 | 类型、扩展、优化器、事务、锁、RLS、Role 和 EXPLAIN 不是通用 SQL 字符串问题 |
| 负载保护 | 只读事务、路由、扫描/时间/内存预算、并发、结果上限、取消与熔断必须靠数据库执行面保证 |
| 可观测证据 | 会话、等待、执行计划、慢 SQL、日志、指标、DDL、参数和备份状态来自实例 |
| 动作安全 | KILL、限流、参数、索引、DDL/DML、扩缩容、备份恢复需要硬权限、风险分级、审批与验证 |
| 新鲜度与一致性 | 快照、事务时间、CDC 水位、Schema 演进、复制滞后决定答案是否可用 |
| 数据库身份 | IAM/Agent 身份最终需要映射到数据库用户、Role、RLS/VPD 与审计主体 |

### 7.2 不应默认由数据库部门重做的内容

- 通用数据集成与全域 Catalog；
- 跨业务域指标/语义管理；
- 通用 Dashboard、大屏和 BI 作者体验；
- 通用模型网关、Prompt 平台与 Agent Runtime；
- 跨产品 Ground Truth/Trace/反馈平台；
- 文档知识库、办公连接器和行业应用编排。

这些能力若现有产品无法满足，应先证明“无法复用/增强”，再决定新建；不能因为数据库拥有数据就把完整数据平台放入数据库产品。

### 7.3 建议的最小共享契约（产品级，不是实施设计）

数据库平面对上层至少暴露四类受控能力：

1. **能力发现：** 引擎/版本、对象、方言、只读能力、预算和动作风险级别；
2. **只读调查：** 带身份、快照/时间、水位、路由、预算、取消和 Query ID 的查询；
3. **证据包：** 规范化的 SQL、计划、会话/锁、指标、日志片段、Schema 版本与来源；
4. **动作生命周期：** 草案 → 静态校验/EXPLAIN → 风险等级 → 审批 → 幂等执行 → 后置验证 → 回滚/补救证据。

**`建议`** 上层 DataArts/Agent 只引用这些能力，不直接保存长期高权数据库凭据，也不靠 Prompt 约束危险动作。

## 8. 四种产品归属方案

### 8.1 方案 A：数据库部门新建完整数据智能产品

| 维度 | 判断 |
|---|---|
| 收益 | 数据库入口短，实例上下文和动作控制最自然；可针对 RDS/GaussDB 快速形成诊断与查询体验 |
| 成本 | 重复建设 Catalog、语义、BI、评测、外部 Agent 与 MaaS 集成；跨引擎和跨数据源扩张昂贵 |
| 关键依赖 | 新团队获得完整平台能力；还要与 DataArts 资产和身份双向同步 |
| 主要风险 | 两套语义、两套权限、两套问数与两套 Agent；客户不知道入口，数据迁移/复制增加 |
| 适用条件 | 账号验证证明 DataArts 核心对象/API 无法扩展，且数据库客户有独立强需求和付费路径 |

### 8.2 方案 B：完全由 DataArts 迭代

| 维度 | 判断 |
|---|---|
| 收益 | 最大复用开发治理、BI、数据源、嵌入和销售体系；跨数据源业务场景自然 |
| 成本 | 需要补齐统一语义、最终用户权限、评测和 Agent 生产运营；并深入接入数据库实时控制面 |
| 关键依赖 | DataArts 接受数据库提供的强契约，而不是把 DB 当普通 JDBC 数据源 |
| 主要风险 | 低估实例/事务/负载/动作安全；跨产品跳转仍在，只是更换菜单 |
| 适用条件 | 证明 Insight/Studio 有稳定可扩展对象和 API，且能让 DB 工具以 OBO/审计方式接入 |

### 8.3 方案 C：联合建设——双平面、统一旅程

| 维度 | 判断 |
|---|---|
| 收益 | DataArts 复用跨域数据、语义、BI、评测；DB 保留运行证据和安全动作；客户可从业务入口或 DB 入口进入同一任务 |
| 成本 | 需要明确共享对象、版本、SLO、错误、Owner 和发布 Gate；组织协作成本真实存在 |
| 关键依赖 | 共享身份映射、语义引用、证据 ID、Agent/工具注册和端到端测试；不能仅做页面跳转 |
| 主要风险 | “联合”若没有唯一契约 Owner，会退化为多个松散产品加营销包装 |
| 适用条件 | 两侧骨架均可扩展，且能建立可版本化、可审计、可独立测试的接口与共同产品 Owner |

### 8.4 方案 D：联邦产品包——不新建通用平台，只提供入口、契约与行业方案

| 维度 | 判断 |
|---|---|
| 收益 | 最快利用 Studio、Insight、Fabric、DAS/RDS、MaaS 现有能力；适合已有 BI/Agent 的客户 |
| 成本 | 需要产品化安装、权限映射、模板、计量、支持与失败路由；能力深度仍取决于各产品 |
| 关键依赖 | 明确兼容矩阵和可观察的跨产品旅程；单一账单/支持入口最好存在 |
| 主要风险 | 若底层对象无法共享，只会把集成复杂度转嫁给客户；难形成一致质量 |
| 适用条件 | 客户更看重集成现有系统，且内部产品短期无法统一，但开放 API 足够稳定 |

### 8.5 条件性建议与反证条件

**`建议`** 先以方案 C 作为验证假设，方案 D 作为低耦合落地形态；暂不批准 A 或把 B 当作默认答案。

原因链：

1. DataArts/Insight 已有不可忽视的通用骨架，直接重建重复风险高；
2. 数据库运行上下文和安全动作不可被普通连接器替代；
3. Databricks、Oracle、阿里和腾讯的最新路径均显示“数据/语义平面 + DB 原生控制面”可以组合；
4. 公开证据尚未证明华为内部共享基础，因此只能作为需验证的产品假设。

以下任一事实成立，应改变建议：

- DataArts 已有内部统一语义、OBO、评测和 DB 安全工具面，则方案 B 权重上升；
- DataArts 对象/API 无法版本化复用，且数据库客户独立需求与收入足够强，则方案 A 权重上升；
- 客户已有 BI/Agent 且拒绝迁移，开放集成价值明显高于统一 UI，则方案 D 权重上升；
- 双方无法设立唯一端到端 Owner/SLO，方案 C 的组织风险可能高于技术收益。

## 9. 产品入口建议

| 用户 | 默认入口 | 不应要求其做什么 |
|---|---|---|
| 业务用户 | DataArts Insight/统一业务 Agent/客户自己的应用 | 理解实例拓扑、复制凭据、配置 CDM 或选择数据库 Role |
| 分析师/语义 Owner | DataArts 的数据集、指标、可信查询、评测与发布面 | 去数据库控制台重复定义业务指标 |
| 数据工程/治理 | Studio/Fabric/LakeFormation 对应专业面 | 在 BI 助手中承担管道、质量和全域权限治理 |
| DBA/SRE | 数据库控制台内诊断与动作面 | 用通用 BI 聊天完成高危变更 |
| 应用开发者/外部 Agent | 稳定 API/SDK/MCP，通过 OAuth/OBO 或受限服务身份 | 持有长期高权 DB 凭据或解析 UI 文本 |

**`建议`** “统一入口”应表示共享身份、语义引用、证据、错误与审计，不一定意味着把所有专业功能塞进同一个页面。

## 10. 投资优先级：先验证再排期

### P0：没有它就不能安全生产

- 共享最终用户身份与数据库 Role/RLS 映射；
- 只读查询预算、超时、取消、结果限制、只读路由与 Query ID；
- 指标/Join/同义词/可信 SQL 的版本化与复用；
- 权限负例、Ground Truth、BadCase、Trace 和回归 Gate；
- 动作分级、硬权限、人工审批、幂等、验证与审计；
- 端到端错误模型和支持 Owner。

### P1：形成可购买产品体验

- 业务域 Agent 模板与真实任务包；
- Dashboard/问数/报告/API/Agent 的一致语义与结果链接；
- 嵌入、OAuth/OBO、限流、计量与租户隔离；
- 数据时间、CDC 水位、语义版本和来源展示；
- 统一开通、Edition、区域、价格和 SLA 说明。

### P2：扩大差异化

- 跨业务指标与 DB 事件的根因分析；
- 主动洞察、假设验证、预测和行业工作流；
- 多 Agent 协作与可回滚动作；
- 多云/混合云、伙伴与 Marketplace 生态。

**`建议`** 不应优先投资菜单仿制、通用聊天外观或无法复现的“准确率”营销指标。

## 11. 研究边界与下一决策 Gate

本轮达成的是公开事实基线，不是产品立项或架构设计。下一步只有在 `unknowns-and-validation.md` 中的 G1-G5 通过后，才适合决定组织归属、路线图和预算。尤其需要：

1. 真实账号核验 DataArts 产品之间是否共享对象/身份/权限；
2. 用合成数据完成一条业务问数和一条 DB 故障链路；
3. 对 UI、API、嵌入和 Agent 做相同权限正负例；
4. 证明评测、版本、计量、审计和支持能够持续运营；
5. 通过真实客户访谈/试点验证付费任务，而不是功能偏好。
