# Databricks 数据湖、数据库与 Agent 演示：诉求发散图

信息截止：2026-08-16  
用途：研究和选题池；不是领导演示页

## 1. 把原始诉求拆成六个问题

1. **平台是什么**：Databricks 不是单一数据湖、数据库或 AI 工具，而是一组围绕受治理数据协作的能力。
2. **从哪里进入**：Home/New、Catalog、Data Ingestion、Jobs/Pipelines、SQL、Dashboard、Genie、Compute/Lakebase、Apps，以及外部 CLI/API/Driver/Agent。
3. **数据怎么流**：文件/数据库/SaaS/流 → Volume/Delta → 清洗/质量/血缘 → SQL/BI/Genie → Sharing/App/Lakebase。
4. **Agent 新增了什么**：自然语言业务问答、工作区代码协作、外部 Conversation/API 工具化、应用状态/事务数据库，以及评测/反馈闭环。
5. **内嵌和外部有何不同**：内嵌把身份、权限、上下文、计算和 UI 串好；外部把能力嵌进企业系统，但承担认证、重试、审计和动作安全。
6. **怎样证明不是 PPT**：真实账号、合成数据、可审计 SQL、正确答案、Genie 配置、录屏、哈希、失败/未验证边界和清理状态。

## 2. 三类受众需要不同答案

| 受众 | 最关心 | 应展示 | 不应堆积 |
|---|---|---|---|
| 领导 | 为什么值得关注、能否形成统一数据入口、风险在哪里 | 一张架构图、五个结论、四个案例、2–3 段短录屏、边界 | API 参数、长 SQL、所有菜单 |
| 业务/数据同事 | 自己从哪里用、能否问现有数据、口径是否可信 | Catalog、SQL、Dashboard/Genie、Sources/Instructions/Examples、结果核对 | 训练/推理 infra |
| 技术/平台同事 | 数据对象、认证、计算、权限、调度、失败恢复 | Volume/Delta/Lineage、Warehouse、Jobs、API、审批 Gate、复现脚本 | 只讲宣传定位 |

## 3. 建议的 15 分钟主演示故事

### 0–2 分钟：平台和账号

- M01：Free Edition 与 New 菜单；
- 说明本次只用 samples 和合成数据；
- 明确 Free Edition 不是生产环境。

### 2–6 分钟：最常见的数据主线

- M05：Add data / Connectors；
- 架构图：managed Volume → Delta tables → views；
- M02：Catalog、MANAGED、Details、Lineage；
- M06/M07：Pipeline/Job 与 SQL Warehouse 分工。

### 6–9 分钟：AI Agent 新能力

- C2：可信 SQL 先给出答案；
- M09：同一个中文问题由 Genie 回答；
- 展示 Show code、7 Sources、Instructions、Curated Example；
- 解释 Genie Agents、Genie Code、Apps/Lakebase 与外部 API 的不同角色。

### 9–13 分钟：两个企业故事

- C3：智能售后行动队列；
- C4：数据库事故上下文与 Runbook；
- 两者都停在“建议/草稿”，写动作进入审批 Gate。

### 13–15 分钟：内嵌 vs 外部与决策边界

- 展示第二张 SVG；
- 内嵌适合探索、协作和人工反馈；
- 外部适合门户、ChatOps、CI/CD 和多 Agent；
- 未创建的 Dashboard/App/Lakebase/Federation/Share 原样标注。

## 4. 产品入口发散矩阵

| 能力 | 工作区入口 | 外部入口 | 内嵌独特点 | 外部独特点 | 可演示问题 |
|---|---|---|---|---|---|
| 数据发现 | Catalog Explorer/Search | Information schema、REST/SDK | 对象、描述、权限、血缘同屏 | 可批量盘点并接入数据门户 | “这张表从哪里来、谁能看？” |
| 文件/Volume | Add data/Catalog | Files API、CLI/SDK | UI 上传与对象选择 | 自动化批量、CI/CD | “CSV 如何变成 Delta 表？” |
| 连接器/CDC | Data Ingestion | API/SDK/Bundles | 引导式配置、运行状态 | 大规模配置即代码 | “SQL Server/SaaS 怎么持续入湖？” |
| Delta/Lakehouse | SQL/Notebook/Catalog | Spark、SQL Connector、Sharing | 表历史、属性、血缘 | 开放格式与多工具消费 | “为什么不是一堆 Parquet？” |
| Pipeline/Job | Jobs & Pipelines/Runs | Bundles、CLI、SDK、REST | 图形依赖、重试与日志 | 版本化、批量部署、测试 | “开发查询如何变成每天运行？” |
| SQL Warehouse | SQL Editor/Query History | JDBC/ODBC/Python/Statement API | 自动绑定计算与结果 UI | BI、服务和自动化查询 | “分析 SQL 在哪里跑？” |
| Dashboard/Metric | AI/BI Dashboard | Embedding/BI/API | 指标、图表、权限协同 | 嵌入企业门户 | “收入/退款率如何复用口径？” |
| Genie Agent | Genie Agents | Conversation API/SDK/Agent Tool | SQL/图表/反馈和领域配置原生 | 嵌入售后、运维、多 Agent | “中文能否正确问现有数据？” |
| Lakebase | Apps switcher/Lakebase SQL | Postgres Driver/Data API | 与 Databricks 身份/数据协同 | 标准 Postgres 生态 | “分析湖与在线事务如何分工？” |
| Apps | Apps UI | 浏览器/企业入口/API | 资源绑定和平台托管 | 用户界面完全业务化 | “如何把分析交付给非 Databricks 用户？” |
| Federation | Catalog Connection/Foreign Catalog | SQL/API | 不搬数据也纳入发现/权限 | 远端系统保持事实源 | “临时访问外部库是否一定复制？” |
| Sharing | Share/Recipient/Marketplace | Open Sharing Client | UI 管理数据产品 | 接收者不必是 Databricks | “跨组织怎么交付持续更新的数据？” |

## 5. AI Agent 功能的发散方式

### A. 业务分析 Agent

- 对结构化表/视图问答；
- 利用表/列注释、Join、指标、同义词、Instructions 和示例；
- 生成只读 SQL、结果和图表；
- 用 Benchmark、受信答案和反馈持续校准；
- 失败模式：选错表、口径歧义、时间边界、权限不足、幻觉指标。

### B. 数据工程协作 Agent

- 找表、解释 Schema、写 SQL/Python；
- 生成或修改 Pipeline/Dashboard；
- 解释错误、建议修复；
- 独特点是直接使用当前 Workspace/Notebook/Query 上下文；
- 边界：代码建议仍需要测试和发布 Gate。

### C. 外部业务 Agent 的数据工具

- 把 Genie 封成“业务数据问答工具”；
- 把 Statement API 封成“受控 SQL 工具”；
- 把 Catalog API 封成“数据发现工具”；
- 把售后/运维系统封成“审批后动作工具”；
- 多 Agent 可分为路由、数据分析、政策、动作和审计角色。

### D. 事务/状态 Agent

- Lakebase 存储任务状态、会话、审批记录或应用事务；
- Lakehouse 保存历史事实、指标和审计；
- 数据可以从 Lakehouse 同步供低延迟读取，也可把事务变化回流分析；
- 不能把 Agent state 与企业事实表混成一个无人治理的数据库。

## 6. 四个案例还能如何继续扩展

### C1 高频 Lakehouse

- 加入 Bronze/Silver/Gold 三层数据质量对比；
- 制造 Schema evolution、重复数据、迟到事件和回放；
- 展示 Time Travel/MERGE/DELETE；
- 对比 ingestion、federation、sharing 三条数据路径；
- 增加 Dashboard/Metric View 后复用同一收入口径。

### C2 自然语言分析

- 对 10 个 Benchmark 问题逐条评分；
- 做“无描述 → 加描述 → 加 Instructions → 加 Example/Metric”的消融实验；
- 测试中文同义词、模糊时间、没有权限、不存在指标和错误 Join；
- UI 与 Conversation API 同身份/不同身份对比；
- 把正确 SQL、错误 SQL、回答时间和澄清行为做成评测表。

### C3 智能售后

- 客户 360、退款异常、VIP SLA、负面情绪队列；
- 售后政策结构化表 vs Volume 文件检索；
- Agent 生成原因解释、处理建议、客户消息和工单草稿；
- 审批工具控制退款、改订单、发消息和变更工单；
- 评估误退款、隐私泄露、越权客户和提示注入。

### C4 数据库智能运维

- 关联指标、慢 SQL、告警、变更、事故、Runbook；
- 添加时间窗口、相似事故、责任团队和 SLO；
- Federation 只读查询真实 CMDB/监控库，或 CDC 入湖做长期分析；
- Agent 生成诊断、工单、变更计划、验证与回滚草稿；
- 实际修复必须有审批、最小权限、幂等、超时、回滚和事后验证。

## 7. 关键决策问题

在企业 PoC 前必须回答：

1. 数据应该摄取、联邦访问、共享，还是同步到 Lakebase？
2. 最终身份是浏览器用户、代表用户的 OAuth，还是服务主体？
3. 业务口径由表注释、Metric View、Instructions、函数还是受信 SQL 管理？
4. 哪些回答必须显示 SQL/来源，哪些需要人工复核？
5. 哪些动作永远不允许模型直接调用？
6. Benchmark 的正确答案、失败样例和回归门槛由谁负责？
7. Free Edition 演示后，如何在商业试用/生产环境重新验证网络、合规、性能与成本？

## 8. 优先级建议

### P0：当前已完成

- 账号/入口、数据湖主链路、Catalog/Lineage、SQL、Genie；
- 四案例数据与 C2-C4 录屏；
- 内嵌/外部架构图；
- 隐私、可信 SQL、审批边界和 Warehouse 清理。

### P1：企业 PoC 最值得追加

- 10 个 Genie Benchmark 全量执行；
- 一个 AI/BI Dashboard + Metric View；
- 一个只读外部 Conversation API 小应用；
- 一个 Lakebase 最小项目，验证 Lakehouse 同步与标准 Postgres 连接；
- 一个真实但脱敏的外部数据库 Federation 或 CDC 对比。

### P2：生产准备

- 服务身份/SSO、私网、审计、合规；
- 成本/并发/SLA/容量与故障恢复；
- CI/CD、Bundles、环境隔离；
- Agent 评测、追踪、提示注入防护和写动作审批平台。
