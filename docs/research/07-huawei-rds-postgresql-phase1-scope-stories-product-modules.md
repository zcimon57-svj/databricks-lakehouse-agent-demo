# 华为云 RDS for PostgreSQL 数据智能：第一阶段产品决策稿

> 主题：对标范围、客户故事、产品模块与优先级  
> 信息截止：2026-08-19  
> 文档状态：**待方向确认的研究稿，不是立项承诺，不代表华为云现网能力**  
> 本阶段边界：只完成用户要求的第 1–3 项；第 4–8 项已作为约束读入，但竞争对手入口拆解、目标架构、微服务设计、OKR 和 HTML 更新留到确认之后

## 0. 如何阅读这份稿子

本文使用四类证据标记：

- **[F｜官方事实]**：可由 Databricks、华为云或其他云厂商官方文档直接支持；
- **[I｜产品判断]**：根据公开能力和数据库产品边界得到的推断，需要内部事实校准；
- **[P｜产品提案]**：建议建设的产品、能力、优先级或验收标准；
- **[U｜待验证]**：公开资料无法证明，必须通过内部接口、区域、版本、商业和客户调研确认。

本文中的零售、SaaS、售后、制造和财务故事均为**合成产品场景**，用于判断客户价值和设计产品闭环，不是客户案例或销售背书。涉及改善幅度时只定义指标，不虚构收益数字。

### 0.1 已读入但暂不展开的第 4–8 项约束

| 后续要求 | 本阶段如何约束前三项 | 本阶段不提前交付什么 |
|---|---|---|
| 4. 能力尽量留在数据库，入口在 DAS / RDS 或数据库新页面 | 所有模块必须说明数据库内入口；DataArts、AgentArts、MaaS 作为底座或后台，不把客户踢到多个产品中完成主流程 | 不在本稿画最终页面信息架构，也不完成阿里云等入口逐屏分析 |
| 5. 可新增内置组件/微服务 | 每个模块明确“复用、集成、新建”；只给出服务职责，不先画部署架构 | 不决定服务拆分数量、部署拓扑和团队边界 |
| 6. 总体架构与模块架构 | 模块边界和依赖必须能支持后续画总架构及逐模块架构 | 本阶段不输出架构图和 SVG |
| 7. PostgreSQL 优先 | P0 只以 RDS for PostgreSQL 为交付引擎；只有连接器、策略模型和 API 契约保留多引擎扩展点 | 不同时做 MySQL 方言和双引擎 GA |
| 8. 按优先级、难度、依赖做 OKR | 本稿给出模块优先级、成熟度和退出标准，避免后续 OKR 失去产品主线 | 不承诺季度、人力和日期，不写未经评审的路线图 |

## 1. 先给结论：不做“RDS 版低配 Genie”，做数据库原生的数据智能产品

### 1.1 要推翻的旧叙事

**[F]** 华为云公开资料显示，DataArts Insight 已经提供自然语言问数、多轮问答、图表、异常检测、根因分析、自动洞察和仪表板搭建，并支持 PostgreSQL 等数据源；配置侧已经有数据集、知识库、Prompt、场景和自定义 NL2SQL / 洞察模型；评测侧已经有评测集、分阶段标注、两个助手对比和 BadCase 管理。其执行链路还明确描述了“检索相关表/字段/枚举值 → 语义 SQL → DQE 校验修正 → 数据源方言 SQL → 注入默认过滤和权限条件”。这已经不是一个空白的 NL2SQL 原型。[智能分析助手概述](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_1001.html)、[配置智能分析助手](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5071.html)、[评测智能分析助手](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5080.html)

因此，以下旧表述不再成立：

- “华为云缺 NL2SQL，所以 RDS 团队从头造一个问数模型”；
- “先造 Semantic Contract Service，再考虑和 DataArts 的关系”；
- “先造 Benchmark / Monitor，现有平台只有日志”；
- “接一个大模型和聊天框，就能形成数据库 Agent 产品”。

### 1.2 新的产品定义

**[P] 产品名称（工作名）：RDS Data Intelligence，中文可称“RDS 数据智能”。**

它不是一套通用 AI 开发平台，也不是新的 BI 产品。它是位于 **RDS / DAS 客户入口**中的数据库原生数据智能工作台：复用 DataArts Insight 的语义问数和 BI 能力、复用 AgentArts 的 Agent 编排、复用 MaaS 的模型接入，同时由数据库产品补齐其他产品很难替代的五件事：

1. **一键获得数据库上下文**：实例、数据库、Schema、表、列、约束、注释、角色、RLS、查询历史、数据新鲜度和业务 Owner 不再靠客户手工搬运；
2. **最终用户权限贯通**：把 IAM / 企业用户、DataArts 数据集权限与 PostgreSQL Role / RLS / Masking 映射成一次可审计查询，而不是让所有人共用一个高权数据库账号；
3. **生产负载安全**：默认路由到只读实例或分析副本，使用 PostgreSQL 只读事务、`statement_timeout`、`EXPLAIN (FORMAT JSON)`、扫描/行数/并发预算和取消机制；
4. **从答案到业务流程**：不仅“生成 SQL”，还把问数、洞察、决策看板和受审批的业务动作草案连起来；
5. **可销售、可运营**：在 RDS / DAS 中统一开通、计量、配额、审计、SLA、版本、评测、反馈和故障定位。

### 1.3 第一个可销售闭环应是什么

**[P]** P0 不是一次性交付十个“大而全”模块，而是用一个产品入口串起一条可销售闭环：

```text
RDS/DAS 一键开通
  → 自动发现 PostgreSQL 上下文和权限
  → 领域人员配置业务语义与可信查询
  → 业务用户自然语言问数/追问/生成图表
  → 每个答案附口径、SQL、来源、新鲜度和 Query ID
  → 只读负载治理与越权拒绝
  → Golden Questions、权限负例、成本和结果回归
  → 将高频结果固化到决策看板或业务 Agent 技能
```

第一批必须由**业务故事**牵引，建议从“智能售后”和“经营/库存决策”二选一或同时做两个灯塔；数据库智能运维作为证明数据库差异化和降低使用风险的配套故事，而不是唯一购买理由。

## 2. 事实基线：Databricks 的产品闭环和华为云的真实起点

### 2.1 Databricks 值得对标的是一条能力链，不是一个聊天框

**[F]** Databricks 官方参考架构把数据接入、Lakehouse Federation、Delta / Iceberg、Unity Catalog、SQL Warehouse、Metric Views、AI/BI Dashboards、Genie、Apps、Agents、模型服务和 AI Gateway 放在同一平台中。[Databricks reference architecture](https://docs.databricks.com/aws/en/lakehouse-architecture/reference)

**[F]** 对自然语言分析而言，最关键的链路是：

```text
Unity Catalog 治理对象与权限
  → 表/视图/Metric View
  → Genie Agent Knowledge Store、Instructions、Example SQL、Trusted Assets
  → SQL Warehouse 执行
  → 表格/图表/多轮或多步报告
  → Monitor、Feedback、Benchmarks、Ground Truth
  → Conversation API / Embed / Supervisor Agent 复用
```

Genie Agent 使用 Unity Catalog 数据和元数据、Agent 局部知识库、示例 SQL、可信资产与业务指令来回答自然语言问题；Chat mode 生成 SQL 和结果，Agent mode 可拆成多个子任务并执行多次查询；Benchmark 可按 SQL 结果或 LLM judge 评测，Monitor 用于审查真实问题和反馈。[Genie Agents concepts](https://docs.databricks.com/aws/en/genie-agents/concepts)、[Tune Genie Agent quality](https://docs.databricks.com/aws/en/genie/tune-quality)、[Test and monitor a Genie Agent](https://docs.databricks.com/aws/en/genie-agents/monitor)

**[I]** 这解释了为什么“数据库 + 大模型”经常做成演示却无法产品化：模型只是其中一环，正确性、权限、语义、执行负载、持续评测和交付入口才决定客户能不能用。

### 2.2 华为云不是能力空白，而是产品闭环分散

| 华为云现有产品 | 公开资料已证明的能力 [F] | 可以直接复用的部分 [I] | RDS 产品仍要补齐或验证 [I/U] | 本稿决策 |
|---|---|---|---|---|
| RDS for PostgreSQL | 托管 PG、只读实例、备份恢复、监控、日志、审计、SQL 洞察/诊断等 | 数据事实、PG 系统目录、角色、只读执行面、性能与审计证据 | 最终用户到 DB 权限映射；Agent 查询的只读路由、预算、证据合同；区域/版本支持矩阵 [U] | **数据库事实与安全执行权必须留在 RDS** |
| DAS | 支持包括 RDS for PostgreSQL 在内的多引擎管理，提供数据库登录、对象/SQL 操作、诊断和运维入口 | 数据库用户日常入口、实例上下文、SQL/诊断能力、深链 | 是否已有可复用的最终用户会话、统一查询网关和外部 Agent 接口 [U] | **作为主要入口和数据库控制面，不另造孤立门户** |
| DataArts Insight | 数据源、数据集、仪表板、嵌入；智能分析助手支持问数、图表、洞察、模型/Prompt/知识配置、语义 SQL/DQE/物理 SQL、权限条件和评测/BadCase | NL2SQL 主链、语义中间表示、图表/BI、助手配置、人工评测与 BadCase | 官方页称智能分析助手处于公测；目标区域/租户可用性、内部 API、RDS 一键接入、服务身份、PG 深度、自动结果回归和商用 SLA [U] | **不重造低配版本；产品化集成并扩展** |
| DataArts Studio | 数据集成、数据架构、目录/资产、质量、安全和数据服务 | 资产 Owner、分类、质量、血缘、数据服务等治理资产 | 是否能低门槛覆盖单个 RDS 客户；策略能否在每次 Agent 查询时强制执行；与 Insight 的对象模型如何统一 [U] | **复用治理资产，不要求每个 RDS 客户先完成大型数仓治理项目** |
| AgentArts | 单 Agent、工作流/多 Agent、知识、插件、MCP、发布与调用能力 | 业务 Agent 编排、工具调用、渠道发布、会话和部分观测 | RDS 工具契约、代表最终用户调用、SQL/动作安全不能只靠 Prompt；区域和版本 [U] | **作为编排底座，不做第二套通用 Agent Builder** |
| MaaS | 模型 API 和 OpenAI 兼容调用等模型服务能力 | 模型选择、调用和模型生命周期的云侧底座 | 数据驻留、模型白名单、配额、成本、请求审计和降级策略 [U] | **只做适配和治理，不做训练/推理平台** |
| DRS / DataArts 数据集成 | 数据复制、同步和数据加工路径 | 当业务问题需要跨库、历史分析或分析副本时提供数据路径 | 水位、Schema 演进、失败状态能否成为答案证据；成本和开通复杂度 [U] | **按故事按需接入，不把“先搬全量数据”设为前提** |

**[F]** 也不能从“DataArts Insight 已有”跳到“RDS 直接集成就能商用”。同一份官方概述明确提示：当前 NL2SQL 更适合清晰、简短的数据查询，复杂计算/分析和语义推理仍有限；接入方需要准备干净、简单、适量的数据，对错误有一定容忍度，典型响应还包含检索、推理、SQL 执行和传输等秒级链路。[DataArts Insight 智能分析助手的约束限制](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_1001.html)

**[I]** 这意味着 RDS 的产品机会不是给现有功能换一个入口，而是用数据库上下文、可信语义、查询安全、严格真值回归和业务模板，把“公测分析助手”推进为可由数据库客户购买、可在生产约束下运营的能力。

**[F]** 目前 DataArts Insight 接入 PostgreSQL 需要在 DataArts 侧创建数据源，并选择公网、VPC 或终端节点等连接路径；官方步骤还要求处理安全组和连接参数。[接入 PostgreSQL 数据源](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0115.html)

**[I]** 这能证明“可连接”，但不能证明“RDS 原生产品闭环”。RDS 原生应做到从实例页选择数据库/只读实例、创建最小权限服务身份、发现 Schema、继承租户上下文并生成可撤销连接，客户不应在多个控制台手工复制网络和数据库凭据。

## 3. 第一项：Databricks 哪些模块对标，哪些不对标

### 3.1 决策准则

每个 Databricks 模块不按“名气大不大”决定，而按五个问题判断：

1. **谁愿意为它买单？** 能否缩短收入、利润、库存、客服或合规流程，而不只是让 DBA 少点两次鼠标；
2. **数据库产品有无结构性优势？** 是否依赖实时事务数据、PG 元数据/权限、查询负载、备份审计等 RDS 原生事实；
3. **华为云是否已经有可复用底座？** 有就产品化集成，不以“新名字”重复建设；
4. **能否留在 RDS / DAS 主流程？** 客户可以选择去专业 DataArts / AgentArts 深配，但日常使用不应在多个控制台漂移；
5. **能否做成可验证的商业能力？** 必须有权限负例、结果真值、性能预算、审计和升级回滚，而不只是 Demo。

**[F] 竞争门槛约束：**阿里云 DMS 已经把 MCP 放在数据库管理入口中，并以实例录入、安全托管、细粒度权限、安全规则和敏感数据保护承接 Agent 访问；这至少说明市场基线已经不是“提供一个 NL2SQL API”，而是数据库上下文、凭据托管、权限和 Agent 工具一起产品化。[阿里云 DMS MCP](https://help.aliyun.com/zh/dms/use-cases/deploy-dms-mcp) 第二阶段再逐产品拆入口、功能和差异，本阶段只把这个事实作为模块取舍约束。

分为四类：

- **A｜直接对标并产品化**：属于 RDS 数据智能的主线，必须形成产品模块；
- **B｜选择性对标并集成**：只建设数据库相关子集，复用既有云产品；
- **C｜作为云底座复用**：RDS 只消费接口，不拥有同类平台；
- **D｜明确不对标 / 延后**：不符合数据库产品定位或 P0 客户价值。

### 3.2 全量模块取舍表

| # | Databricks 模块 / 能力 | Databricks 在闭环中的作用 [F] | 华为云 RDS 应对标什么 | 决策 | 归属模块 | 主要理由 |
|---:|---|---|---|---|---|---|
| 1 | Unity Catalog：目录、对象、权限、标签、血缘、审计 | 统一治理数据和 AI 资产，是 Genie、SQL、Agent 的权限与元数据基础 | 只做 **RDS 上下文与运行时治理子集**：实例到列、Owner、分类、权限、RLS、查询证据；连接 DataArts 治理资产 | **A** | M1 | 没有这一层，NL2SQL 不知道“能看什么、口径归谁、答案从哪来” |
| 2 | Unity Catalog ABAC / 行列控制 | 策略在受治理对象和执行路径上生效 | IAM / 企业用户 → DataArts 权限 → PG Role/RLS/Masking 的运行时映射和负例测试 | **A** | M1、M7 | 数据库产品必须对最终执行负责；目录展示不能代替强制执行 |
| 3 | Metric Views | 标准化维度、度量、过滤和 Join，统一业务指标 | 在 DataArts Insight 数据集/DQE 基础上形成可版本、可测试、可复用的业务指标与实体 | **A** | M2 | 客户买的是统一口径，不是 SQL 生成率 |
| 4 | Genie Knowledge Store / Instructions | 同义词、表列描述、Join、SQL 表达式、业务规则和 Agent 局部知识 | 领域语义包：术语、实体匹配、状态/日期口径、Join 安全、示例和反例 | **A** | M2 | 直接决定业务问题能否可靠落到数据 |
| 5 | Genie Example SQL / Trusted Assets | 高频问题复用已审查 SQL 或函数，降低自由生成风险 | 可信查询注册表、参数化模板、PG 函数/视图、Owner/版本/测试/适用权限 | **A** | M2 | 高频和受监管问题不能每次自由生成 |
| 6 | Genie Agent Chat mode | 自然语言 → SQL → 表格/图表，多轮追问 | RDS/DAS 内的受治理问数助手，显示 SQL、口径、来源、新鲜度和 Query ID | **A** | M3 | 是高频业务入口，但必须建立在 M1/M2/M7 上 |
| 7 | Genie Agent Agent mode | 多步计划、多次查询、结构化报告和引用 | 只读“深度分析模式”：拆解经营问题，运行多次受控查询，形成证据报告 | **A，P1 完整化** | M3、M5 | 有高业务价值，但复杂度和成本高于单问，P0 先做受控问题类型 |
| 8 | Genie Monitor / Feedback | 审查真实会话、反馈、错误和使用趋势 | 会话、SQL、权限拒绝、成本、反馈、无答案率和业务采用监控 | **A** | M8 | 数据和问法持续变化，不能一次上线后不运营 |
| 9 | Genie Benchmarks | Ground-truth SQL 结果比较或 Agent-mode judge，形成回归集 | 扩展 DataArts 现有评测：结果等价、权限负例、PG 方言、成本、安全和版本发布门禁 | **A** | M8 | DataArts 已有人工分阶段评测，差异化在自动化和数据库安全回归 |
| 10 | Genie Conversation / Management API、Embed | 把同一助手嵌入应用或通过 API 管理、调用 | 统一内部 Widget + 外部 API/SDK/Agent Tool，保持同一身份、语义和策略 | **A，外部接口 P1** | M0、M3 | 客户既要数据库内入口，也要把能力交给自己的应用和 Agent |
| 11 | AI/BI Dashboards + Ask Genie | 固定看板和自然语言探索互相转换 | 复用 DataArts Insight 仪表板，在 RDS 工作台提供“看指标 → 问原因 → 固化图表” | **A，薄版 P0** | M4 | 管理者不会从空白聊天框开始；看板是稳定入口 |
| 12 | Supervisor Agent / Agent Bricks | 编排 Genie、函数、MCP、定制 Agent 和多步工具 | 在 AgentArts 上提供 RDS 业务 Agent 技能与受控数据库工具，不重造通用 Builder | **A，业务技能；C，通用平台** | M5、M6 | 产品价值在可直接采用的数据库业务技能，不在另一套画布 |
| 13 | Unity AI Gateway | 模型/Agent/MCP/工具的访问、预算、限流、护栏、用量和审计 | MaaS / AgentArts 适配、模型白名单、租户预算、降级、提示/响应审计引用 | **B** | M6 | 必需但不应由 RDS 重造模型网关 |
| 14 | Lakehouse Federation / UC Connections | 不搬数读取外部数据库，并统一连接治理 | PG 只读直连、联邦/跨源查询的最小子集；统一连接对象和新鲜度证据 | **B** | M9 | P0 单库可不依赖；跨库业务故事出现时才建设 |
| 15 | Lakeflow Connect CDC | 持续把数据库变更增量摄取到分析表 | 复用 DRS / DataArts 数据集成；把水位、延迟、Schema 演进和失败暴露给回答 | **B** | M9 | 数据移动是路径，不是语义和 Agent 本身 |
| 16 | Lakeflow Pipelines / Jobs | 数据转换、质量和作业编排 | 复用 DataArts 数据开发/质量；只暴露数据准备与新鲜度状态 | **C** | M9 | RDS 不应再做一套通用数据工程平台 |
| 17 | Databricks SQL Warehouse、Query Editor、Query History | 执行分析 SQL、编辑、历史与性能观测 | 使用 RDS PG 只读实例/分析副本和 DAS SQL 能力；新增 Agent 专用安全查询面 | **B** | M7 | 对标执行合同与治理，不对标分布式数仓引擎 |
| 18 | Databricks Apps | 在平台内构建和托管数据/Agent 应用 | RDS/DAS 内置页面、Widget 和应用模板；通用应用托管复用云应用平台 | **B** | M0、M5 | 需要入口和嵌入体验，不需要 RDS 复制一个 PaaS |
| 19 | AI Search / Vector Search | 为 Agent 提供非结构化知识检索 | 复用华为云知识库/向量能力，将政策、工单、SOP 作为 M5 可选知识源 | **C** | M5、M6 | 售后故事需要，但不是 RDS 核心引擎能力 |
| 20 | MLflow Tracing / Agent Evaluation | 追踪 Agent 调用并进行开发、生产评测 | 复用 AgentArts/云观测能力；M8 定义数据库专属 trace 和 scorer | **B/C** | M8 | 复用通用 tracing，新增 SQL/权限/业务结果评价器 |
| 21 | Delta Sharing / Marketplace / Clean Rooms | 跨组织分享数据产品和协作 | P0 不做；未来只在明确的数据产品交换故事下连接 DataArts 数据服务/云市场 | **D，P2 再议** | — | 与“RDS 内业务问数”购买链路距离较远，治理和商业复杂度高 |
| 22 | Delta Lake / Iceberg / Medallion | 湖仓存储、事务表格式和分层建模 | 不在 RDS 数据智能中复制；跨源分析时连接既有湖仓/数仓 | **D** | — | RDS 已是事务数据库，重造存储层没有产品意义 |
| 23 | Spark / Photon / Serverless SQL 计算 | 大规模批流计算和交互查询引擎 | 不对标；超出 PG 安全分析预算时路由至既有分析产品 | **D** | — | 用户明确不关注通用 AI/数据计算基础设施，RDS 也不应变成 Spark 平台 |
| 24 | Lakebase | Databricks 内的托管 PostgreSQL 应用数据库 | 不对标 | **D** | — | RDS for PostgreSQL 本身就是数据库产品，关系相反 |
| 25 | Feature Store / AutoML / 训练与模型服务 | ML 训练、特征和推理生命周期 | 不纳入本方向；只通过 MaaS 使用批准的模型 | **D** | — | 明确超出用户关注和 RDS 产品边界 |
| 26 | Notebook / Genie Code | 工程师写代码、SQL、Pipeline 和 Dashboard | 可复用 DAS SQL 辅助或 CodeArts；不作为业务数据智能主线 | **D，另案** | — | 开发提效和业务数据产品是不同购买者、不同故事 |

### 3.3 最终对标范围：领导可以直接拍板的版本

**[P] 必须直接形成产品的 8 组能力：**

1. RDS 上下文与运行时治理（Unity Catalog 的数据库相关子集）；
2. 业务语义、指标、Join、同义词和可信查询（Metric Views + Genie Knowledge Store / Trusted Assets）；
3. 受治理自然语言问数与深度分析（Genie Chat / Agent mode）；
4. 评测、监控和反馈闭环（Genie Benchmark / Monitor）；
5. RDS/DAS 内嵌、API 和 Agent Tool 的一致交付；
6. 指标看板与自然语言追问的双向闭环；
7. 可直接使用的数据库业务 Agent 技能；
8. 模型/Agent 适配、查询治理和必要的数据连接。

**[P] 选择性集成、不重复造平台的 6 组能力：**模型网关、联邦查询、CDC/数据集成、BI 仪表板、应用托管、向量知识与通用 tracing。

**[P] 明确不进入本方向的能力：**湖仓存储格式、Spark/Photon/通用 SQL Warehouse、Lakebase、模型训练/Feature Store、通用 Notebook/代码助手、P0 的 Marketplace/Clean Room。

## 4. 第二项：从真实业务诉求出发的客户故事

### 4.1 故事不是“Agent 能做什么”，而是“业务在什么时刻愿意买”

每个故事必须同时回答六个问题：

```text
业务事件是什么 → 谁承担损失/目标 → 今天为何拿不到答案
→ RDS 数据智能提供什么可信答案或动作草案
→ 为什么数据库厂商比通用 Agent 更适合做
→ 用什么业务指标证明值得续费
```

下面的故事优先使用 PostgreSQL 中常见的订单、客户、库存、订阅、工单、付款和事件表。P0 不要求先建完整湖仓；单库/单只读实例可解决的故事先闭环，跨库和历史数据再按需接 M9。

### 4.2 S1：大促销售上涨，但利润和库存是否正在恶化

| 项目 | 内容 |
|---|---|
| 业务时刻 | 零售/电商活动进行到第 2 小时，GMV 上涨，但运营不知道增长来自真实增量、过度折扣还是高退货商品；部分仓库可能同时缺货 |
| 谁会买 | 电商负责人、区域运营、商品负责人；预算理由是减少毛利泄漏和缺货损失，而不是“少写 SQL” |
| 今天的断点 | 运营看固定看板，临时问题发给数据团队；数据团队重新确认活动、退款、成本和库存口径，答案出来时活动窗口已经过去 |
| 第一个问题 | “本次活动 GMV 增长中，有多少来自折扣超过 30% 且库存覆盖不足 6 小时的 SKU？按毛利风险排序，并解释较昨日同时段的变化。” |
| 产品流程 | M4 显示活动看板 → 用户点异常指标进入 M3 追问 → M2 解析 GMV/净销售/毛利/库存覆盖口径 → M7 在 PG 只读实例执行 → M8 标注问题是否可回归 → M5 生成“调价/补货/停止投放”草案，不自动执行 |
| 必须给出的证据 | 指标版本、时间和时区、订单/退款状态、成本来源、库存水位、SQL/可信查询、Query ID；无法得到实时库存时明确“未知/延迟” |
| 业务 KPI | 决策时延、毛利泄漏金额、缺货时长、活动期间人工取数单量、建议采纳后增量毛利 |
| 为什么 RDS 有优势 | 订单和库存的最新事实、事务状态、只读副本延迟和权限都在数据库侧；通用聊天机器人无法自行保证这些事实 |

### 4.3 S2：SaaS 续费风险不是一张“低活跃客户”名单

| 项目 | 内容 |
|---|---|
| 业务时刻 | 季度续费前 30 天，客户成功团队要确定有限人力先跟进哪些企业客户 |
| 谁会买 | SaaS 业务负责人、客户成功负责人；预算理由是保住 ARR 和提升续费效率 |
| 今天的断点 | CRM、产品使用、工单、账单和合同口径分散；“低活跃”不等于“高流失风险”，客户经理还要逐个查证 |
| 第一个问题 | “未来 30 天到期、ARR 前 20%、过去两周核心功能使用下降且仍有高优工单的客户有哪些？把证据和推荐动作分开。” |
| 产品流程 | M1 发现并授权订阅/使用/工单对象 → M2 定义 ARR、到期、核心功能和未解决工单 → M3 生成名单并允许按行业追问 → M5 联合知识库生成客户沟通要点和任务草案 → 人工确认后写入 CRM |
| 必须给出的证据 | 每个客户的到期日、ARR 版本、使用变化、工单 ID、数据新鲜度；推荐动作必须标为推断，不冒充数据库事实 |
| 业务 KPI | 续费率、挽回 ARR、客户经理准备时间、无效触达率、推荐动作采纳率 |
| 为什么 RDS 有优势 | 多数 SaaS 的订阅、租户和使用事件首先落在业务数据库；RDS 能原生执行租户隔离、字段脱敏和只读负载控制 |

### 4.4 S3：智能售后从“查一个订单”变成“形成可审批处理队列”

| 项目 | 内容 |
|---|---|
| 业务时刻 | 退款或履约异常突然升高，客服主管需要统一口径、识别高影响客户并分配处理优先级 |
| 谁会买 | 客服/售后负责人、电商或平台业务负责人；预算理由是减少处理时长、错赔和升级投诉 |
| 今天的断点 | 一线客服在订单、支付、物流、退款、会员和工单页面逐项复制；复杂问题转研发写 SQL；不同人对“可退、已批准、超 SLA”理解不一致 |
| 第一个问题 | “列出仍未解决、超过 SLA、符合退款政策且影响高价值客户的工单；解释依据并生成处理队列，但不要退款。” |
| 产品流程 | 客服工作台嵌入 M3 → M2 把“未解决/超 SLA/高价值/符合政策”映射成版本化定义 → M7 执行受控查询 → M5 联查政策知识，生成退款/补偿/升级草案 → 进入既有审批系统 |
| 必须给出的证据 | 订单、支付、退款、物流、工单和政策版本；事实与建议分栏；敏感字段按客服角色脱敏；任何写动作都有预览、审批、幂等和审计 |
| 业务 KPI | 平均处理时长、一次解决率、转研发取数率、错赔率、升级投诉率、审批后动作成功率 |
| 为什么 RDS 有优势 | 数据库能给出最新事务状态和唯一约束，也能保证 Agent 不绕过租户/行权限；这比把订单数据导出给外部 Bot 更可控 |

### 4.5 S4：制造交付延期需要回答“哪批订单会受影响、先救哪个”

| 项目 | 内容 |
|---|---|
| 业务时刻 | 供应商延期或产线异常后，计划员需要在当日承诺客户前判断订单影响和替代方案 |
| 谁会买 | 供应链负责人、工厂运营负责人、销售运营；预算理由是降低逾期订单和违约损失 |
| 今天的断点 | 采购、BOM、库存、工单和客户承诺散落；人工计划表很快过期，跨表 Join 依赖少数专家 |
| 第一个问题 | “供应商 A 的物料延迟 5 天会影响哪些本周交付订单？按客户等级、违约成本和可替代库存排序。” |
| 产品流程 | M3 将假设参数化 → M2 使用有效期 BOM、可用库存和承诺日期语义 → M9 仅在跨库时提供带水位的数据路径 → M5 输出改排产/替代料/客户沟通草案 → 人工审批 |
| 必须给出的证据 | BOM 版本和有效期、库存锁定状态、订单承诺、同步水位、替代料规则；假设模拟与当前事实必须分开 |
| 业务 KPI | 准时交付率、缺料停线时长、人工排查时长、违约成本、替代方案采用率 |
| 为什么 RDS 有优势 | 订单、库存锁定和生产状态经常处在事务数据库中；数据库侧可以识别快照时点和并发变化，避免用过期导出表给承诺 |

### 4.6 S5：财务月结不是“算一个总额”，而是找到可解释差异

| 项目 | 内容 |
|---|---|
| 业务时刻 | 月结前，订单、收款、退款、发票和总账汇总不一致，财务需要在有限窗口内定位差异 |
| 谁会买 | 财务运营、收入会计、业务财务；预算理由是缩短关账周期、减少错误调整和审计取证成本 |
| 今天的断点 | 固定报表只显示差额；数据人员反复改 SQL；财务无法判断差异来自时区、状态、冲正、重复、漏同步还是口径版本 |
| 第一个问题 | “8 月订单净收入与已开票收入差异来自哪些类型？按金额列出 Top 原因，并给出每类可复核记录和口径。” |
| 产品流程 | M4 暴露对账差异 → M3 追问原因 → M2 使用版本化净收入/开票/冲正语义和可信查询 → M7 只读执行 → M8 将关键问题加入严格结果回归 |
| 必须给出的证据 | 会计期间、时区、币种、汇率版本、状态范围、排除项、SQL、样本记录和权限；不得自动过账或冲销 |
| 业务 KPI | 关账周期、未解释差异金额、临时 SQL 次数、审计取证时间、人工调整错误率 |
| 为什么 RDS 有优势 | 数据库约束、交易时间、冲正链和审计记录是解释差异的关键；RDS 可提供一致快照和可追踪 Query ID |

### 4.7 S6：产品增长团队需要从漏斗异常走到可验证假设

| 项目 | 内容 |
|---|---|
| 业务时刻 | 注册到付费转化突然下降，增长团队需要在发布窗口内判断是渠道、版本、地区、支付还是数据延迟 |
| 谁会买 | 产品负责人、增长负责人；预算理由是缩短异常定位和实验决策周期 |
| 今天的断点 | 看板只告诉“下降”；临时切分维度产生大量 SQL；不同分析师选择不同漏斗和时间窗口 |
| 第一个问题 | “昨日注册到首购转化下降主要集中在哪些渠道、客户端版本和地区？排除事件延迟后给出前三个可验证假设。” |
| 产品流程 | M4 告警/看板 → M3 多轮切分 → M2 统一漏斗、归因窗口和去重口径 → M9 提供事件水位 → M5 生成实验或排查任务草案 |
| 必须给出的证据 | 漏斗版本、事件延迟、样本量、切分维度、SQL；相关性与因果假设明确分开 |
| 业务 KPI | 异常发现到假设时长、实验启动时长、口径争议次数、数据延迟误报率 |
| 为什么 RDS 有优势 | 账号、订单和支付等最终转化事实通常在数据库中，可用来校准埋点和流式事件，不被单一事件平台误导 |

### 4.8 S7：数据库智能运维是业务闭环的保护层，不是唯一故事

| 项目 | 内容 |
|---|---|
| 业务时刻 | 核心接口变慢，DBA 既要找根因，也要回答“影响了哪些租户、订单和收入” |
| 谁会买 | 技术负责人、DBA/SRE；它常由可靠性预算驱动，但与 S1–S6 联动后才能直接表达业务影响 |
| 今天的断点 | 指标、慢 SQL、执行计划、锁、发布、告警和业务订单分开；诊断报告只说数据库异常，业务负责人不知道优先级 |
| 第一个问题 | “10:00–10:20 延迟上升与哪些 SQL、锁和发布同时发生？影响了哪些高价值租户和支付，给出证据与下一步检查。” |
| 产品流程 | DAS 进入 M3 运维视图 → M1 提供实例/Schema/业务对象关联 → M7 查询系统事实和受控业务聚合 → M5 生成检查/回滚/限流草案，但不直接 Kill、改参数或切主 |
| 必须给出的证据 | 监控时间线、Top SQL、执行计划、锁、复制延迟、发布 ID、业务影响、缺失证据；事实、推断、建议严格分层 |
| 业务 KPI | MTTR、误诊率、业务影响识别时长、诊断页面切换次数、未经审批的生产动作数（必须为 0） |
| 为什么 RDS 有优势 | RDS/DAS 掌握数据库拓扑、指标、日志、诊断和安全动作边界，外部 Agent 很难完整复制 |

### 4.9 S8：合规负责人要证明“谁通过 Agent 看到了什么”

| 项目 | 内容 |
|---|---|
| 业务时刻 | 内审、客户审计或数据泄露排查时，需要证明一个用户/Agent 在某时段访问过哪些字段和结果范围 |
| 谁会买 | 安全合规负责人、平台负责人；预算理由是减少审计风险并允许业务 Agent 合规上线 |
| 今天的断点 | 云 IAM、BI 分享、Agent 会话和数据库审计各自记录一段，无法重建最终用户到 SQL 的链路 |
| 第一个问题 | “用户 U 过去 7 天通过哪些内嵌或外部 Agent 查询了客户敏感字段？使用了什么策略版本，返回多少行？” |
| 产品流程 | M0 统一入口身份 → M1 编译最终用户策略 → M6 记录模型/工具路由 → M7 记录 SQL 和策略 → M8 聚合审计证据 |
| 必须给出的证据 | 最终用户、应用/Agent、用途、策略版本、SQL 哈希、Query ID、字段分类、返回行数和拒绝原因；默认不保留不必要的明文结果 |
| 业务 KPI | 审计取证时长、越权回归通过率、未知调用者比例、敏感查询策略覆盖率 |
| 为什么 RDS 有优势 | 只有把云身份、Agent 调用和最终数据库查询贯通，才能证明访问事实；单看聊天日志或 DB 共享账号都不够 |

### 4.10 每个产品模块至少由两个业务故事牵引

| 产品模块 | 主牵引故事 | 第二/第三故事 | 不能退化成什么 |
|---|---|---|---|
| M0 数据智能工作台 | S1 经营看板、S3 客服内嵌 | S7 DAS 运维入口、S8 审计入口 | 另一个孤立 AI 控制台 |
| M1 数据库上下文与治理图 | S2 租户/客户权限、S8 访问证明 | S7 实例到业务影响、S5 财务字段分类 | 只可搜索、运行时不生效的目录 |
| M2 业务语义与可信查询工作室 | S1 毛利/库存、S5 月结口径 | S3 退款政策、S6 漏斗 | 字段注释编辑器或 Prompt 仓库 |
| M3 受治理数据助手 | S1 大促分析、S3 售后队列 | S2 续费、S4 供应链、S5 财务 | 能聊但不能证明答案的 NL2SQL Demo |
| M4 智能决策看板 | S1 活动指挥、S5 对账 | S6 漏斗、S7 业务影响 | 一套与问数割裂的新 BI |
| M5 业务 Agent 技能 | S3 售后草案、S2 续费跟进 | S4 改排产、S6 实验任务、S7 运维建议 | 无审批地直接改生产数据的自主 Agent |
| M6 模型与 Agent 接入治理 | S2 客户沟通、S3 政策知识 | S8 全链审计、S7 模型降级 | RDS 自建 MaaS 或模型训练平台 |
| M7 安全查询与动作平面 | S3 敏感售后、S5 财务只读 | S1 活动高并发、S7 运维动作、S8 越权拒绝 | 只靠 Prompt 说“请勿执行危险 SQL” |
| M8 质量评测与生产监控 | S5 财务严格真值、S3 权限负例 | S1 业务采用、S7 诊断证据、S8 审计 | 只看点赞率的聊天日志 |
| M9 数据连接与新鲜度 | S4 供应链跨库、S6 事件水位 | S2 CRM/账单、S5 总账同步 | 不问业务必要性就先搬全量数据 |

## 5. 第三项：要做哪些产品模块，各自补齐什么能力

### 5.1 目标成熟度不是“功能开发完成”

| 等级 | 定义 | 可以对领导承诺什么 | 不能声称什么 |
|---|---|---|---|
| L0 概念 | 只有故事、原型或架构假设 | 已找到待验证方向 | 产品可用 |
| L1 技术验证 | 合成/脱敏数据，少量精选问题可跑通 | 关键技术路径可行 | 普遍准确、安全或可商用 |
| L2 受控试点 | 设计伙伴真实场景；租户、权限、负载、评测和回滚有门禁 | 在限定范围产生可量化业务结果 | 通用 GA 或自动动作安全 |
| L3 可销售产品 | 控制台开通、配额/计费、SLA、审计、升级、支持、回归和 API 契约完整 | 可规模销售和运营 | 覆盖所有引擎、行业和长尾问题 |
| L4 生态平台 | 多引擎、伙伴语义包/技能、外部 API 生态和行业模板 | 可由伙伴持续扩展 | 无治理的开放工具市场 |

**[P]** P0 的目标不是全部模块 L4，而是让一条 PostgreSQL 业务闭环达到 L2，并把其中通用的入口、安全查询、评测和语义资产设计到 L3 标准。没有租户隔离、只读负载和严格回归的 L1 Demo，不得包装为“智能数据库产品已落地”。

### 5.2 模块总表

| 模块 | 面向谁 / 卖什么价值 | 复用什么 | 必须新增或产品化的核心能力 | P0 目标 | 优先级 / 难度 |
|---|---|---|---|---|---|
| **M0 RDS 数据智能工作台** | 业务负责人、数据负责人、DBA；一个入口开通、使用、治理和复盘 | RDS/DAS 控制台、DataArts Insight 嵌入/API、IAM | 实例级一键开通、角色化首页、业务域/助手/看板/评测导航、上下文深链、统一计量/配额/状态/故障解释 | L2 闭环，接口按 L3 设计 | **P0；中** |
| **M1 数据库上下文与治理图** | 数据 Owner、安全负责人；知道数据是什么、谁能看、答案从哪来 | RDS PG 元数据、DataArts 目录/安全、IAM | 自动发现 PG 语义和权限、最终用户策略映射、业务对象关联、运行时策略快照、证据 ID | L2 | **P0 阻塞；高** |
| **M2 业务语义与可信查询工作室** | 领域专家、分析师；统一口径并把纠错变资产 | DataArts Insight 数据集、语义 SQL/DQE、知识配置、DataArts 架构资产 | 指标/实体/Join/状态/时区版本化、可信查询、PG 方言包、测试和发布流程 | L2，核心资产按 L3 | **P0 阻塞；高** |
| **M3 受治理数据助手** | 运营、客服、财务、管理者；秒/分钟级获得可证明答案 | DataArts Insight 智能分析助手、图表、API | RDS/DAS 内体验、证据回答、多轮消歧、受控深度分析、内外部入口一致、无答案/拒绝协议 | L2 | **P0 收入能力；中高** |
| **M4 智能决策看板** | 管理者和业务负责人；从稳定 KPI 进入异常解释和行动 | DataArts Insight 仪表板/洞察/嵌入 | RDS 模板、指标到问数上下文、异常到解释、回答固化为卡片、业务效果追踪 | P0 薄版 L2；P1 L3 | **P0 薄版 / P1；中** |
| **M5 数据库业务 Agent 技能** | 客服、客户成功、供应链、运维团队；完成多步调查并生成动作草案 | AgentArts 工作流/Agent/MCP/知识、M3 数据工具 | 行业技能包、结构化计划、事实/推断分离、动作草案、审批/幂等/验证、技能版本和效果指标 | 1 个只读+草案技能 L2 | **P0 灯塔 / P1 扩展；高** |
| **M6 模型与 Agent 接入治理** | 平台和安全团队；允许多模型/外部 Agent 可控使用数据库能力 | MaaS、AgentArts、IAM、APIG/审计能力 | RDS 模型适配层、白名单/预算/降级、代表用户 Token、统一 Tool 契约、调用证据关联 | L2，网关契约按 L3 | **P0 阻塞；中高** |
| **M7 安全查询与动作平面** | 所有角色；不伤生产、不越权、可取消和追踪 | RDS 只读实例、PG Role/RLS、DAS、审计/限流 | SQL AST/策略校验、只读路由、EXPLAIN 预算、超时/并发/结果限制、取消、证据合同；动作预览与审批隔离 | 查询平面 L3 标准；动作只到草案 | **P0 最高；高** |
| **M8 质量评测与生产监控** | 产品、领域 Owner、安全、SRE；证明准确性和持续改进 | DataArts Insight 评测/BadCase、AgentArts/云观测 | 自动结果等价、权限负例、PG 方言/性能/安全回归、生产 trace、发布门禁、漂移和业务效果看板 | L2，发布门禁不可缺 | **P0 阻塞；中高** |
| **M9 数据连接与新鲜度** | 跨系统业务团队；在不牺牲时效/口径的情况下联查 | DataArts Insight 数据源、DRS、DataArts 数据集成 | RDS 一键服务身份、直连/副本/同步选择器、水位和 Schema 演进证据、跨源路由 | 单 PG 内置；跨源 P1 L2 | **P1；高** |

### 5.3 M0：RDS 数据智能工作台

**产品目标 [P]**：客户在 RDS 实例或 DAS 中完成 80% 的开通、体验和运营；需要高级语义、Agent 编排或数据工程时再深链到 DataArts / AgentArts，并带着实例、项目和业务域上下文跳转。

**必须具体补齐：**

- 在 RDS for PostgreSQL 实例页提供“数据智能”入口，选择数据库、只读实例/分析路径和业务域；
- 自动检测依赖、区域/版本、网络、只读实例、DataArts Insight / AgentArts 权益，并给出可解释的开通清单；
- 角色化首页：业务用户看到问数和看板，领域 Owner 看到语义与评测，DBA 看到负载和审计，管理员看到策略和配额；
- 助手、语义包、看板、技能、连接和评测拥有统一资源 ID、状态、版本与 Owner；
- 内嵌 Widget 和外部调用共享同一租户、最终用户、业务域和策略上下文；
- 统一展示模型用量、数据库查询成本、失败原因、数据新鲜度和产品配额。

**P0 退出标准：**一个 RDS PG 实例可在工作台内完成开通、数据域选择、语义准备、问数、评测、审计和停用；主流程不要求用户手工复制数据库密码到另一个控制台。后者能否由现有服务身份实现是 **[U]**。

**非目标：**不重建 DataArts Insight 的完整 BI 编辑器，不重建 AgentArts 画布。

### 5.4 M1：数据库上下文与治理图

**产品目标 [P]**：把“数据库知道的技术事实”和“业务/治理知道的含义”编译成每次查询可执行、可审计的上下文，而不是做一个只读元数据搜索页。

**PostgreSQL 首批对象：**

- 实例、数据库、Schema、表/视图/物化视图、列、类型、PK/FK/Unique/Check、索引、函数；
- `COMMENT`、枚举/低基数值、统计信息摘要、对象热度和安全采样；
- Role、Grant、默认权限、RLS Policy、Schema `search_path`、字段分类/脱敏；
- 查询历史/模板、慢 SQL、执行计划、只读实例和复制水位；
- DataArts Owner、分类、血缘、质量和业务域映射。

**必须新增或打通：**

- `principal + tenant + purpose + app/agent → allowed assets + row predicates + masks + execution role + expiry` 的策略编译结果；
- 每次查询冻结一个 `context_version` / `policy_version`，供回答、审计和复现引用；
- 识别跨租户 Join、无 Owner 敏感字段、RLS 缺口和权限漂移；
- 技术表与业务实体的映射，例如 `orders`、`subscriptions`、`refund_case`，支持同一实体跨 Schema/系统；
- 元数据更新和 Schema 变更对语义包、可信查询和回归集的影响分析。

**P0 退出标准：**选定业务域内所有暴露对象都有 Owner、分类、用途、允许角色和策略版本；至少覆盖允许、拒绝、行过滤、字段遮蔽、策略撤销五类端到端负例。

**非目标：**不复制整个 Unity Catalog，也不强制小型 RDS 客户先采购并实施完整企业数据治理平台。

### 5.5 M2：业务语义与可信查询工作室

**产品目标 [P]**：让领域专家把“这次答对”变成“以后可复用、可测试、可发布的业务资产”。优先扩展 DataArts Insight 已有数据集、知识和语义 SQL / DQE，而不是先创建一套不兼容的中间表示。

**每个业务指标必须有：**名称、定义、公式、聚合、维度、默认过滤、状态集合、时间字段/时区、币种、Owner、版本、生效期、数据源、权限、示例问题、反例和测试。

**每个 Join 必须有：**实体关系、键、基数、有效期、允许方向、重复/漏数风险和安全域；默认禁止模型自行猜测未声明的多对多 Join。

**可信查询注册表必须有：**问题意图、参数、SQL/函数/数据 API、适用语义版本、PG 版本、权限、Owner、Review、结果 Schema、成本基线、Golden Result、过期和回滚。

**PG 方言包必须具体覆盖：**

- `date_trunc`、interval、时区、窗口函数、`FILTER`、CTE、NULL 和大小写语义；
- `jsonb`、数组、枚举、UUID、数值精度和常用扩展的允许矩阵；
- `pg_catalog` / `information_schema` 元数据检索、`search_path` 和引用解析；
- RLS、Security Barrier View、函数安全属性和禁止函数；
- `EXPLAIN (FORMAT JSON)` 成本特征、错误修复和版本差异回归。

**P0 退出标准：**为一个灯塔业务域建立可发布语义包；高频问题优先命中可信查询，长尾才进入动态 NL2SQL；Schema 或语义版本变化会自动触发影响分析和回归。

**关键未知 [U]**：DataArts Insight 的数据集、DQE 和评测是否有内部稳定 API / 版本模型可由 RDS 产品复用；如果没有，优先补齐平台接口，而不是复制实现。

### 5.6 M3：受治理数据助手

**产品目标 [P]**：把 DataArts Insight 已有智能分析能力交付成一个 RDS 原生、证据化、内外一致的业务产品。

**NL2SQL 主链应明确为：**

```text
问题与会话
 → 业务域/意图识别与必要消歧
 → 检索 M1 上下文、M2 指标/Join/实体/可信查询
 → 形成语义查询或命中可信资产
 → 编译 PostgreSQL SQL
 → M7 权限、只读、成本和风险校验
 → 执行、结果校验与可视化
 → 结论 + 口径 + SQL/资产 + 来源 + 新鲜度 + Query ID
```

**必须补齐：**

- 一问一答、多轮追问、按受控问题类型启用的深度分析；
- 歧义必须询问，不把“收入、活跃、高价值、已退款”等词静默猜成一个口径；
- 回答分成数据库事实、计算结果、模型推断和建议；
- 支持“未知、数据延迟、权限不足、成本超预算、语义未定义”的结构化拒绝；
- 展示实际执行 SQL 或可信资产 ID，而不是只展示模型生成草稿；
- RDS/DAS UI、业务 Widget、API 和 Agent Tool 使用同一后端策略，不出现内嵌安全、外部绕过的双轨；
- 把审查后的答案一键转为语义规则、可信查询或回归问题。

**P0 退出标准：**在选定灯塔故事上，真实用户可以从问题走到证据答案和图表；严格结果集、权限负例、成本和拒绝测试通过预设门槛；不能只用“SQL 可执行率”作为准确率。

**非目标：**不承诺任意数据库、任意 Schema、任意自然语言都能可靠回答；不自动执行写 SQL。

### 5.7 M4：智能决策看板

**产品目标 [P]**：为管理者提供“先看到稳定 KPI，再问为什么，再把可靠发现固化”的入口，避免所有人面对空白聊天框。

**必须补齐：**

- 为售后、经营/库存、续费、财务对账提供少量可配置模板；
- 每个指标卡绑定 M2 指标版本和 M8 回归状态；
- 从图表某个时间点/维度启动 M3 时自动携带筛选上下文；
- 从问数回答将已审查图表固化为卡片，并记录来源和刷新策略；
- 异常检测输出只触发“解释/调查”，不把相关性直接写成根因；
- 看板不仅统计使用量，还跟踪处理时长、差异金额、续费/售后等业务结果。

**P0 退出标准：**只做一个灯塔模板和“指标 → 追问 → 证据 → 固化”闭环；高级 BI 设计继续使用 DataArts Insight。

### 5.8 M5：数据库业务 Agent 技能

**产品目标 [P]**：不是让客户从零搭 Agent，而是交付可直接安装、可审计的业务技能包。每个技能围绕一个业务事件，使用 M3 取证，调用知识或外部 API，并只生成受控动作草案。

**首批候选技能：**

1. 售后异常调查与处理队列；
2. 续费风险证据包与跟进草案；
3. 库存/交付影响分析与处置草案；
4. 数据库事故证据与业务影响包。

**一个技能包必须包含：**触发条件、业务输入/输出 Schema、所需语义包、允许工具、权限、事实/推断模板、最大步骤/预算、审批点、幂等键、验证、回滚/补偿、Golden Tasks、Owner、版本和业务 KPI。

**P0 退出标准：**只选择一个故事做 L2；Agent 可以自动完成只读调查和草案生成，但退款、改订单、写 CRM、改参数、Kill 会话、扩缩容和切主均必须进入既有审批/动作系统。

**非目标：**不重建 AgentArts；不把“自主执行更多动作”当成熟度指标。成熟度首先看事实正确、权限正确、流程可控和业务结果。

### 5.9 M6：模型与 Agent 接入治理

**产品目标 [P]**：RDS 可以使用 MaaS / AgentArts 和批准的外部模型或 Agent，但数据库安全与客户身份不依赖某个模型供应商。

**必须补齐：**

- `model_profile`：允许模型、区域、用途、数据等级、预算、最大上下文、超时和降级；
- Prompt / 响应的敏感信息处理、必要留存和审计引用，不默认长期保存明文结果；
- 代表最终用户的短期、最小权限 Token；区分人、应用、Agent 和服务身份；
- 统一 RDS Data Tool 契约：发现业务域、获取语义、规划查询、执行受控查询、解释证据、提交动作草案；
- 内嵌和外部 Agent 调用都带 `principal / tenant / purpose / context_version / policy_version / trace_id`；
- 模型超时、不可用、成本超限时降级到可信查询、固定看板或明确拒绝。

**P0 退出标准：**至少接通一个 MaaS 模型和一个 AgentArts 流程；替换模型不会绕过 M7，也不会改变同一用户的数据权限。

**非目标：**不建设模型训练、部署或通用模型市场。

### 5.10 M7：安全查询与动作平面

**产品目标 [P]**：这是数据库产品不能外包给 Prompt 的权威执行层，也是区别于普通 ChatBI 的核心。

**查询平面必须补齐：**

- 默认连接专用只读实例/分析副本；连接主库时强制只读事务并采用更严格预算；
- 解析单语句 SQL，限定 `SELECT` / approved function，拒绝 DDL、DML、多语句、危险函数、未授权对象和注释绕过；
- 在 AST/语义层校验或注入租户与行过滤，应用字段遮蔽；
- 执行前使用 `EXPLAIN (FORMAT JSON)` 和统计信息控制预计成本、全表扫描、Join 膨胀；
- 强制 `statement_timeout`、lock timeout、并发、行数、结果字节、租户配额、取消和 kill switch；
- 缓存键包含最终用户、租户、用途、策略、语义版本和数据水位；
- 返回 `query_id / source / snapshot_or_watermark / context_version / policy_version / semantic_version / elapsed / rows / truncation`。

**动作平面 P0 只定义边界：**查询 Agent 没有生产写权限；M5 只能提交结构化动作草案。真正执行必须经过预览、业务审批、幂等、变更窗口、执行身份、验证和补偿/回滚。动作平面的完整模块架构留到第二阶段。

**P0 退出标准：**DDL/DML、跨租户、敏感字段、超预算、超时、取消、策略撤销和缓存隔离等负例 100% 命中预期拒绝/终止；正常业务查询不对生产主库造成不可接受影响。具体 SLO 由试点基线确定。

### 5.11 M8：质量评测与生产监控

**产品目标 [P]**：在 DataArts Insight 已有评测与 BadCase 基础上，补成数据库产品的自动发布门禁，而不是再做一个孤立标注页。

**评测集至少分六类：**

1. 业务结果真值：问题 + Golden SQL/可信查询 + 结果等价规则；
2. 语义真值：指标、状态、时区、币种、Join 和适用范围；
3. 权限负例：跨租户、字段遮蔽、撤权、外部 Agent 冒用；
4. 查询安全：DDL/DML、危险函数、多语句、成本、超时、取消；
5. PostgreSQL 方言：版本、类型、函数、RLS、`search_path` 和执行计划；
6. Agent 任务：是否引用正确证据、区分事实/推断、在动作前停住并请求审批。

**生产监控必须关联：**用户问题、检索上下文版本、语义/可信查询版本、生成与实际 SQL、策略判定、数据库 Query ID、模型/工具 trace、结果摘要、延迟/成本、用户反馈、人工修正和业务 KPI。敏感值采用最小化留存。

**发布门禁：**模型、Prompt、语义、Schema、可信查询、策略、PG 版本或网关规则变化，必须触发受影响回归；失败样本不能通过删除问题或放宽口径“做成 100%”。

**P0 退出标准：**一个灯塔域具备可复跑 Golden Questions、严格结果比较、权限/安全负例和生产反馈闭环；BadCase 有 Owner、原因分类、修复版本和关闭证据。

### 5.12 M9：数据连接与新鲜度

**产品目标 [P]**：只有业务故事需要跨库、历史或大规模分析时才引入连接/同步；任何答案都必须告诉用户查的是实时主库、只读副本、联邦源还是同步副本。

**必须补齐：**

- 从 RDS 实例一键创建可撤销、最小权限服务身份和连接对象，避免长期手工账号密码；
- 按问题选择“PG 直读 / 只读实例 / 联邦 / DRS 同步 / DataArts 数据集”，并说明选择原因；
- 将复制延迟、CDC 水位、Schema 版本、同步失败和回填状态附在答案证据中；
- 跨源 Join 必须有实体映射、时点一致性和成本预算；
- 用稳定的连接/语义/API 契约保留未来 MySQL、GaussDB、DWS 等引擎扩展点，但 P0 只实现 PG。

**P0 退出标准：**单个 RDS PG 的安全连接和只读新鲜度已内置；跨源能力不到业务故事 Gate 不提前建设。

## 6. 模块依赖、优先级和本阶段建议

### 6.1 优先级不是按照页面可见度排序

```text
商业入口与故事：M0 + M3 + 薄版 M4 + 1 个 M5 灯塔技能
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
   M1 上下文/治理   M2 语义/可信查询   M6 模型/Agent 接入
         └───────────────┼────────────────┘
                         ▼
                  M7 安全查询平面
                         ▼
                  M8 评测与发布门禁

M9 连接/新鲜度：只有故事跨源或负载要求触发时进入
```

上图是**产品依赖关系，不是目标技术架构**。总体架构和逐模块架构在第二阶段输出。

### 6.2 建议优先级

| 优先层 | 模块和动作 | 为什么先做 | 最大难点 | 阶段 Gate |
|---|---|---|---|---|
| **P0-A 商业问题选择** | 选定 S1–S6 中 1–2 个灯塔故事、客户角色、数据对象、业务 KPI；S7 做配套 | 没有业务购买理由，所有底座都会变成名词堆砌 | 真实数据和 Owner、价值基线 | 客户愿意共同定义问题、真值和成功指标 |
| **P0-B 权威底座** | M1、M2、M6、M7、M8 的最小闭环 | 这是正确性、权限和可运营性的必要条件 | 跨产品对象/身份/API、PG 权限与负载 | 五类安全/权限负例和严格结果回归通过 |
| **P0-C 可见产品** | M0 + M3 + 薄版 M4 | 让业务用户真正在 RDS/DAS 内完成问题到证据 | 嵌入/跳转一致性、体验与拒绝解释 | 真实角色端到端完成灯塔任务，无手工换账号/拷凭据 |
| **P0-D 灯塔 Agent** | M5 只做一个只读调查 + 动作草案技能 | 证明“数据库 + Agent”不等于聊天框 | 跨工具证据、审批边界、业务 KPI | 所有写动作停在审批前；业务指标有改善趋势 |
| **P1 产品化扩展** | M4 完整化、M5 更多技能、M9 跨源/CDC、外部 API/Tool | 在 P0 真正被使用后扩展复用面 | 多源一致性、成本、伙伴交付 | 第二/第三业务域无需改核心安全面即可接入 |
| **P2 生态和多引擎** | MySQL/GaussDB 等方言包、伙伴语义包/技能、数据产品交换 | 建立规模和生态，不阻塞 PG 首发 | 兼容矩阵、治理、商业模型 | 适配器契约稳定且有真实跨引擎需求 |

### 6.3 需要停止或降级的旧模块表述

| 旧提法 | 新处理 | 原因 |
|---|---|---|
| 独立 `Agent Policy Adapter` | 合入 M1 的策略编译与 M7 的权威执行，不先单独包装产品 | 策略如果只“适配”但不在查询执行中强制生效，就只是旁路服务 |
| 从零建设 `Semantic Contract Service` | M2 优先扩展 DataArts Insight 数据集/知识/语义 SQL/DQE 与 DataArts 治理资产 | 已有能力很强，关键是版本、测试、PG 深度和产品接口 |
| 新建 `Trusted Query Registry` | 作为 M2 的明确子模块 | 它是语义发布闭环的一部分，不应成为无入口的技术服务 |
| 新建通用 `Benchmark / Monitor` | M8 扩展 DataArts Insight 评测/BadCase，并接通数据库与 Agent trace | 避免重复已有标注能力；补真正缺少的自动结果、安全和发布门禁 |
| 通用 `Planner + Evidence Composer` | 规划复用 AgentArts；证据合同由 M3/M5 定义、M7 提供权威 Query 事实 | 通用编排不应由 RDS 复制；数据库证据必须由执行面签发 |
| 一开始同时做 MySQL + PostgreSQL | P0 只做 PG；核心契约保持引擎适配器边界 | 双引擎会让语义、权限、方言和负载回归同时翻倍，削弱灯塔闭环 |

## 7. 这份第一阶段稿需要确认的五个决定

在进入第 4–8 项前，请确认或修改以下决定：

1. **对标范围**：是否同意“A 类直接产品化、B/C 类集成复用、D 类明确不做”的边界，尤其是不做湖仓计算、训练平台、Lakebase 和通用 Agent Builder？
2. **产品定位**：是否同意产品主入口是 **RDS/DAS 的“RDS 数据智能工作台”**，DataArts Insight / AgentArts / MaaS 是后台复用和高级配置入口，而不是让 RDS 再造三套平台？
3. **灯塔故事**：P0 在 S1–S6 中选哪两个？本稿建议 **S3 智能售后 + S1 经营/库存决策**；S7 数据库运维作为共同保护层。
4. **引擎边界**：是否同意 P0 只交付 PostgreSQL，连接、策略、语义和 Tool 契约预留多引擎，而不是首发双引擎？
5. **动作边界**：是否同意第一版 Agent 自动完成只读调查和动作草案，任何退款、改订单、写 CRM、数据库变更都必须人工审批；再根据试点证据逐类放开？

确认后，第二阶段再完成：

- 第 4 项：阿里云 DMS/Data Copilot/Meta Agent、Oracle Select AI、Google Cloud SQL Gemini、Azure SQL Copilot 等入口和产品形态对比，并回到 RDS/DAS 页面设计；
- 第 5–6 项：总体目标架构、每个模块架构、新增内置组件/微服务、身份/数据/查询/动作时序和 SVG；
- 第 7 项：PostgreSQL 深化和多引擎适配契约；
- 第 8 项：按模块价值、依赖、难度和风险形成 OKR、里程碑、团队动作、验收 Gate；
- 全部研究确认后才合并成最终 Markdown，并更新领导展示 HTML。

## 8. 官方资料索引

### 8.1 Databricks

- [Databricks reference architecture](https://docs.databricks.com/aws/en/lakehouse-architecture/reference)
- [Unity Catalog overview](https://docs.databricks.com/aws/en/data-governance/unity-catalog/)
- [Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/)
- [Unity Catalog connections](https://docs.databricks.com/aws/en/connect/uc-connections)
- [Metric Views basic modeling](https://docs.databricks.com/aws/en/uc-semantics/metric-views/basic-modeling)
- [Genie Agents](https://docs.databricks.com/aws/en/genie-agents/)
- [Genie Agents concepts](https://docs.databricks.com/aws/en/genie-agents/concepts)
- [Tune Genie Agent quality](https://docs.databricks.com/aws/en/genie/tune-quality)
- [Test and monitor a Genie Agent](https://docs.databricks.com/aws/en/genie-agents/monitor)
- [Genie Conversation API](https://docs.databricks.com/aws/en/genie-agents/conversation-api)
- [AI/BI Dashboards](https://docs.databricks.com/aws/en/dashboards/)
- [Build agents on Databricks](https://docs.databricks.com/aws/en/agents)
- [Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/)

### 8.2 华为云

- [DataArts Insight 智能分析助手概述](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_1001.html)
- [DataArts Insight 配置智能分析助手](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5071.html)
- [DataArts Insight 评测智能分析助手](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5080.html)
- [DataArts Insight 产品功能](https://support.huaweicloud.com/productdesc-dataartsinsight/dataartsinsight_01_0005.html)
- [DataArts Insight 接入 PostgreSQL 数据源](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0115.html)
- [DataArts Studio 产品介绍](https://support.huaweicloud.com/productdesc-dataartsstudio/dataartsstudio_07_001.html)
- [DataArts Studio 数据服务概述](https://support.huaweicloud.com/usermanual-dataartsstudio/dataartsstudio_01_0301.html)
- [DRS 实时同步概述](https://support.huaweicloud.com/realtimesyn-drs/drs_05_0005.html)
- [RDS for PostgreSQL 用户指南](https://support.huaweicloud.com/usermanual-rds-pg/rds-pg-usermanual-pdf.pdf)
- [DAS 产品优势](https://support.huaweicloud.com/intl/zh-cn/productdesc-das/das_01_0008.html)
- [RDS for PostgreSQL 通过 DAS 登录](https://support.huaweicloud.com/intl/zh-cn/usermanual-rds-pg/rds_pg_08_0037.html)
- [MaaS 快速入门](https://support.huaweicloud.com/intl/zh-cn/qs-maas/qs-maas-0001.html)
- [MaaS API 概述](https://support.huaweicloud.com/api-maas/api-maas-0002.html)
- [AgentArts 创建和调试单 Agent](https://support.huaweicloud.com/usermanual-agentarts0/agentarts_05_0073.html)
- [AgentArts 创建和管理 MCP](https://support.huaweicloud.com/usermanual-agentarts0/agentarts_05_0139.html)

### 8.3 本阶段只用于校准竞争门槛，详细对比留到第二阶段

- [阿里云 DMS MCP 安全访问数据库](https://help.aliyun.com/zh/dms/use-cases/deploy-dms-mcp)
- [阿里云 DMS Data Copilot](https://help.aliyun.com/zh/dms/dms-data-copilot-intelligent-assistant)
- [阿里云 DMS Meta Agent](https://help.aliyun.com/zh/dms/meta-agent/)
- [Oracle Select AI](https://docs.oracle.com/en/database/oracle/oracle-database/26/nfcoa/select_ai.html)
- [Google Cloud SQL Studio with Gemini](https://docs.cloud.google.com/sql/docs/mysql/write-sql-gemini)
- [Microsoft Copilot in Azure SQL](https://learn.microsoft.com/en-gb/azure/azure-sql/copilot/query-editor-natural-language-to-sql-copilot?view=azuresql-db)
