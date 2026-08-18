# Databricks 数据湖与数据库演示项目约定

信息截止日：2026-08-16  
状态：`LIVE_CORE_VALIDATED / DELIVERY_FINALIZATION`

## 1. 目标

最终成果必须让观看者回答五个问题：

1. Databricks 在数据湖、Lakehouse 和数据库体系中解决什么问题？
2. 业务人员、分析师、数据工程师、数据库工程师、应用和外部 Agent 分别从哪里使用？
3. 一个高频数据场景从接入、治理、处理、查询到消费的真实流程是什么？
4. 自然语言分析、智能售后和数据库智能运维如何建立在同一份受治理数据之上？
5. Databricks 内嵌能力相对外部 CLI、API、驱动、应用和 Agent 有什么优势、限制和独特点？

## 2. 范围

### 2.1 重点范围

- Databricks Account、Workspace 与 Free Edition/Trial 边界；
- 对象模型：Catalog、Schema、Table、View、Volume、外部位置；
- Delta Lake 与 Lakehouse；
- Unity Catalog 的发现、权限、血缘和审计价值；
- SQL Warehouse、SQL Editor、Notebook 与 Photon 的使用边界；
- Lakeflow Connect、Pipelines 和 Jobs 的接入、转换与调度；
- AI/BI Dashboard、Metric View、Genie Agent 和自然语言分析；
- Lakebase Postgres 的定位、适用与不适用场景；
- 外部 JDBC/ODBC、SQL Connector、Statement Execution API、CLI、SDK、REST API、Databricks Connect、Delta Sharing；
- Apps、Genie API、工具调用和外部 Agent 使用数据能力的方式；
- 成本、权限、网络、并发、配额和 Free Edition 限制。

### 2.2 只保留必要背景

- 基础模型选择；
- 模型训练、微调和 GPU 基础设施；
- 通用模型推理性能比较；
- 与数据湖、数据库和 Agent 数据访问无直接关系的 AI Infra。

## 3. 必须覆盖的案例

### C1：Databricks 主打能力与高频场景

展示从原始数据进入 Lakehouse，到 Delta 表、治理、SQL、Dashboard 和共享消费的完整流程。优先使用平台自带样例数据，必要时补充合成数据。

### C2：对已有数据进行自然语言分析

使用同一份业务数据对比：

- SQL Editor/Notebook 中人工查询；
- 工作区内 Genie Agent 或相应自然语言入口；
- 外部应用或 Agent 通过 Genie API、SQL API 或工具封装查询。

重点验证语义描述、Metric View、权限继承、生成 SQL 可解释性、正确率和调用限制。

### C3：智能售后

数据至少包括客户、订单、产品、退款、客服工单和售后政策。展示结构化查询、非结构化知识、自然语言问题和可选业务动作，并说明读操作与写操作的审批边界。

### C4：数据库智能运维

数据至少包括实例、指标、慢查询、告警、事件、变更记录和 Runbook。展示指标分析、异常定位、Runbook 检索、诊断建议和可选工单生成。禁止在演示中把“生成建议”描述成未经批准的生产修复。

## 4. 内嵌与外部使用对比框架

每个模块都必须回答同一组问题：

| 维度 | 工作区内嵌 | 外部用户、应用或 Agent |
|---|---|---|
| 入口 | 菜单、编辑器、Notebook、Genie、Dashboard | CLI、SDK、REST、SQL Driver、BI、App、Agent Tool |
| 身份 | 浏览器登录和工作区上下文 | OAuth、服务主体或其他受支持认证 |
| 计算 | 自动选择或绑定 Serverless/Cluster/Warehouse | 必须显式选择 endpoint、warehouse 或 API |
| 元数据 | 自动发现 Catalog、表、描述和血缘 | 需要 API 查询、配置或工具封装 |
| 权限 | UI 中直接体现 Unity Catalog 权限 | 仍受相同治理约束，但错误和授权需由调用方处理 |
| 交互 | 快速探索、可视化、人工反馈 | 自动化、批量、嵌入现有系统、跨平台编排 |
| 独特点 | 上下文完整、零到低配置、原生治理体验 | 可组合、可复用、可测试、可纳入 CI/CD 和 Agent 工作流 |
| 限制 | 依赖工作区 UI、人工操作，不适合大规模自动化 | 认证、网络、限流、错误恢复和可观测性责任更重 |

上述内容当前只是统一分析模板，具体结论必须通过官方资料和实际工作区验证填充。

## 5. 信息与展示分层

### 5.1 研究材料

研究层可以完整记录：

- 官方文档与发布日期；
- 实际界面名称和账号可见状态；
- GA、Public Preview、Beta、区域和云差异；
- SQL、API、SDK 示例；
- 截图、录屏时间点和验证结果；
- 已知限制、失败结果和 Unknown；
- 内嵌与外部使用的逐项对照。

### 5.2 演示 HTML

主页面遵循“一屏一个结论”：

- 每屏最多一个核心观点；
- 每个模块保留 3 到 5 个重点；
- 优先图、流程、真实截图和短视频；
- 细节默认折叠；
- 每个结论可以跳转到完整研究证据；
- 对领导讲业务价值，对同事保留可展开技术细节。

## 6. 录屏与外部视频

每个主要模块至少包含：

1. 一段真实 Databricks 工作区录屏；
2. 一份中文演示讲稿；
3. 一张 SVG 流程图或架构图；
4. 一到两个经过核验的外部视频链接；
5. 明确标注录制日期、账号类型、云、功能状态和是否使用合成数据。

建议视频结构：

- V0：3 分钟平台与入口总览；
- V1：数据湖高频流程；
- V2：已有数据的自然语言分析；
- V3：智能售后；
- V4：数据库智能运维；
- V5：内嵌与外部使用对照；
- V6：限制、成本、治理与适用边界。

外部视频只提供来源、摘要、适用模块和时间定位，不下载或重新分发无授权内容。

## 7. 数据安全与可清理性

- 默认使用 `samples` Catalog 与合成数据；
- 合成数据不得包含真实姓名、邮箱、客户、主机、IP、SQL 文本或生产指标；
- 所有创建对象使用统一前缀，暂定 `dbx_demo_`；
- 每次写入前记录目标；
- 每个对象提供幂等创建或存在性检查；
- 每套数据提供独立清理脚本；
- 不自动删除用户原有对象。

## 8. 当前访问结论

### 已确认

- UI 显式显示 `Databricks Free Edition`，云为 AWS；
- Google 登录工作区可通过本机临时浏览器/CDP 控制并进行隐私清洗录屏；
- `samples` Catalog、Unity Catalog、SQL Warehouse、SQL Editor、Workspace Notebook、Data Ingestion、Jobs & Pipelines、Catalog Lineage 和 Genie Agent 的入口或核心操作已实测；
- managed Volume → `read_files` → 14 个 Delta managed tables → 3 个业务/运维视图 → SQL/Genie 的主链路已跑通；
- 所有写入均为固定种子的合成数据，且在独立 Schema 中；
- 9/9 个可信 SQL 查询通过，Genie 的中文答案与基线一致；
- 9 段真实 UI 录屏已生成，账号邮箱、头像和对象 ID 已遮罩；
- SQL Warehouse 已确认 `STOPPED`。

### 只验证入口、未创建资源

- Jobs/Pipelines：真实创建入口已录，但没有创建任务；
- Lakebase Postgres：真实入口和 Free Edition 配额已确认，但没有创建项目/实例；
- Dashboards、Apps、Federation、Delta Sharing：产品路径与官方资料已研究，本工作区未创建对应资源。

### 不能从本次演示推出

- 生产 SLA、容量、并发、成本、私网、合规和企业 SSO/SCIM；
- 外部生产数据库 CDC/Federation 的真实吞吐和故障恢复；
- 真实售后动作或数据库修复动作可以无人审批自动执行。

## 9. 验收标准

项目只有在以下条件全部满足后才能完成：

- 四个案例均有可重复步骤和实际结果；
- 每个重点模块均完成内嵌/外部调用对比；
- 研究层与演示层物理分离；
- SVG 在主流浏览器中正确渲染；
- HTML 不依赖联网即可展示本地核心内容；
- 所有录屏可以播放，声音、字幕或讲稿完整；
- 外部视频链接可访问并标注发布日期和适用范围；
- 所有工作区写入均为合成数据且有清理脚本；
- 不泄露 Google 账号、工作区 Cookie、Token、个人信息或内部数据；
- 所有时间敏感结论标注截止日与来源。
