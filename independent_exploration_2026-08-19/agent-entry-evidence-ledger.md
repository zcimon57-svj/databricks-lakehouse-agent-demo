# Agent 统一入口、治理与授权专项证据账本

- 资料基准日：2026-08-19
- 本轮核验日：2026-08-19
- 范围：公开、无需账号写操作的官方产品文档、API 文档、发布说明、官方产品博客与公开 Roadmap
- 无账号级结论：本专项没有开通或登录任何云账号，因此下列内容均不是 `实际观察`
- 状态规则：页面明确写出 GA、Beta、Preview 时照录；未明确写出时记为 `状态 Unknown`，不由文档存在反推 GA
- 比较单位：以完成同一端到端任务所需的厂商产品组合为单位；没有公开集成证据的组件不能简单相加

## 证据如何进入评分

每条证据只支持一个有限命题。评分采用十个维度：统一入口 `E`、任务与结果工件 `A`、语义和数据治理 `S`、身份与委托 `I`、API/CLI/MCP 工具面 `T`、安全动作 `X`、正确性与评测 `Q`、运营 `O`、成熟度 `M`、跨系统联邦 `F`。官方路线图只影响“演进方向/速度”，不作为当前能力满分证据。

## Databricks

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| DBX-01 | 官方声明 | Genie 产品页把 Genie One、Agents 和 Code 放入同一 AI 体验体系。 | 产品组合描述；不等于每项同状态或同权限路径。 | E、A | [What is Genie?](https://docs.databricks.com/aws/en/genie/) |
| DBX-02 | 官方声明 | Genie One 为业务用户提供简化的单入口，可访问仪表板、自然语言问答和 Apps。 | 账号级可见性、区域和 entitlement 未验证。 | E、A | [Genie One](https://docs.databricks.com/aws/en/genie-one) |
| DBX-03 | 官方声明 | 全屏 Genie 对话能路由到 Agent、Dashboard、Query、Metric View、外部文档、定时任务和文档工件。 | 页面提示 Agent 数量增多可能降低路由准确性；部分能力需联系团队或处于预览。 | E、A、F | [Use Genie chat](https://docs.databricks.com/aws/en/workspace/genie-chat) |
| DBX-04 | 官方声明 | Genie One 可连接 Drive、Gmail、Microsoft 365、Jira、Confluence、Glean、Slack 等外部源，并使用每用户 OAuth token。 | Beta；文件类型和自动工具触发有限制。 | I、F | [External sources](https://docs.databricks.com/aws/en/genie-one/external-sources) |
| DBX-05 | 官方声明 | AI/BI Dashboard 面向固定分析，Genie 面向自适应问答；两者可共享数据集/语义资产。 | 具体一致性需按资产和发布凭据验证。 | E、S、A | [AI/BI concepts](https://docs.databricks.com/aws/en/ai-bi/concepts) |
| DBX-06 | 官方声明 | Consumer access 与 Unity Catalog 权限共同约束消费；外部数据源还需要各自授权。 | 未证明所有嵌入入口都采用相同身份链。 | I、S | [Manage AI/BI consumers](https://docs.databricks.com/aws/en/ai-bi/consumers) |
| DBX-07 | 官方声明 | Dashboard 的 companion Genie space 支持 viewer 或 publisher credentials。 | 凭据模式不同会改变最终用户权限语义；单个 space 有数据集数量约束。 | I、S、M | [Add a Genie space to a dashboard](https://docs.databricks.com/aws/en/dashboards/genie-spaces) |
| DBX-08 | 官方声明 | Dashboard Agent 能生成多步建设计划，并在关键阶段请求用户批准。 | 这是建设仪表板的 Agent，不等于任意业务写动作的统一审批引擎。 | A、X | [Build dashboards with the Dashboard Agent](https://docs.databricks.com/aws/en/dashboards/manage/dashboard-agent) |
| DBX-09 | 官方声明 | Genie Agent 的知识存储含指令、trusted assets 和 benchmark，可执行多步 Agent mode。 | Agent mode/API 状态为 Beta；生产规模与区域需另验。 | S、Q、A | [Genie Agents concepts](https://docs.databricks.com/aws/en/genie-agents/concepts) |
| DBX-10 | 官方声明 | Genie 监控支持 benchmark，Chat 模式比较 SQL/结果等价，Agent 模式使用 LLM judge。 | 最多 500 个 benchmark；部分详细记录只保留一周。 | Q、O | [Monitor and evaluate Genie Agents](https://docs.databricks.com/aws/en/genie-agents/monitor) |
| DBX-11 | 官方声明 | Agent mode 有程序化 API；会话 API 返回 reasoning/trusted asset 等字段。 | Beta，且 UI 与 API 返回/体验并非完全同构。 | T、Q | [Genie Agent API](https://docs.databricks.com/aws/en/genie-agents/api)；[Conversation API](https://docs.databricks.com/aws/en/genie-agents/conversation-api) |
| DBX-12 | 官方声明 | MCP Service 是 Unity Catalog 可保护对象，可使用授权、工具 allow/deny、审计和 AI Gateway。 | Beta；需逐云、逐区域核验。 | T、I、O | [MCP Service](https://docs.databricks.com/aws/en/agents/mcp/mcp-services) |
| DBX-13 | 官方声明 | Databricks 托管 MCP 服务可以采用 OAuth scope 和 on-behalf-of 用户身份。 | Public Preview，引用页面为 GCP 文档；不能无条件外推到所有云。 | T、I | [Managed MCP servers](https://docs.databricks.com/gcp/en/agents/mcp-tools/managed-mcp) |
| DBX-14 | 官方声明 | 官方分别提供 Genie MCP 与 Databricks SQL MCP；SQL 工具受 Unity Catalog 治理。 | SQL 写入工具扩大风险面，需另行验证审批、幂等与回滚。 | T、S、X | [Genie MCP](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-mcp)；[Databricks SQL MCP](https://docs.databricks.com/aws/en/agents/mcp-tools/databricks-sql) |
| DBX-15 | 官方声明 | Agent Framework 支持 supervisor、多 Agent、自定义 Agent、MLflow trace/evaluation 与 AI Gateway。 | 各子功能成熟度不同，不能以框架页替代逐项验证。 | T、Q、O | [Mosaic AI Agent Framework](https://docs.databricks.com/aws/en/agents) |
| DBX-16 | 官方声明 | Lakebase 提供 AI-assisted troubleshooting 的数据库原生遥测与审批路径。 | Beta；不能证明已成为 Genie One 的统一数据库动作面。 | X、F | [AI-assisted troubleshooting](https://docs.databricks.com/aws/en/oltp/projects/ai-assisted-troubleshooting) |
| DBX-17 | 官方声明 | 2026 发布说明连续增加 Excel/Sheets、AI Gateway、Genie One 扩展等能力。 | 发布频率支持“演进快”，不证明客户采用率。 | M、F | [Databricks product release notes](https://docs.databricks.com/aws/en/release-notes/product/) |
| DBX-18 | 官方声明 | Lakeflow Connect 提供托管数据库/SaaS/文件/流连接器；查询式接入允许选择 UC 目标、连接、Schema 和表。 | 需要 UC、Serverless 网络、权限与连接；连接器状态/Region 不一。 | A、S、F | [Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/)；[Query-based ingestion](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/query-based-pipeline) |
| DBX-19 | 官方声明 | Lakehouse Federation 提供 UC 治理的外部数据库只读路径；Auto Loader 支持文件 Schema 推断/演进和异常字段保留。 | 联邦与复制用途不同；文件自动推断不等于业务语义正确。 | S、F、A | [Federation](https://docs.databricks.com/gcp/en/query-federation)；[Auto Loader Schema](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/schema) |
| DBX-20 | 官方声明 | UC 的 Discover/Catalog Explorer、自动血缘、质量监控和 Agentic 敏感分类形成数据管理面。 | 分类含 LLM/Beta 子项并需 Review；未证明这些操作都由 Genie One 单一对话完成。 | S、A、M | [Data discovery](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-discovery)；[Quality](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-quality-monitoring)；[Classification](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-classification) |

## Snowflake

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| SNF-01 | 官方声明 | Snowflake Intelligence 已作为企业 AI 体验发布，面向跨结构化/非结构化数据问答和工作。 | 官方公告称 GA；区域、Edition 和客户账号未验证。 | E、A、M | [Snowflake Intelligence GA](https://www.snowflake.com/en/blog/snowflake-intelligence-enterprise-ai/) |
| SNF-02 | 官方声明 | Snowflake Cowork 提供对话式业务工作入口，可做研究、分析和动作，并支持移动端方向。 | 不同 Cowork/Intelligence 能力状态需逐项核验。 | E、A、F | [Snowflake Cowork](https://docs.snowflake.com/en/user-guide/snowflake-cortex/snowflake-cowork) |
| SNF-03 | 官方声明 | 官方把 Snowflake Intelligence 描述为 personal work agent，并宣布 MCP actions、mobile、secure sandbox 等演进。 | “GA soon”或“coming soon”只计路线，不计当前 GA。 | E、X、F | [Snowflake Intelligence: the work agent](https://www.snowflake.com/en/blog/snowflake-intelligence-work-agent) |
| SNF-04 | 官方声明 | Cortex Agent 以 Snowflake role/privilege 管理 agent object、模型与工具权限。 | 默认角色行为可能使同一用户在不同入口得到不同可见范围。 | I、S、T | [Set up Cortex Agents](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-setup) |
| SNF-05 | 官方声明 | Agent 监控可查看完整 trace、工具、SQL、图表、延迟和 token；访问未脱敏 trace 需要特定权限。 | trace 本身可能包含敏感数据，必须治理访问。 | Q、O、I | [Monitor Cortex Agents](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-monitor) |
| SNF-06 | 官方声明 | Agent 支持不可变版本、alias 和回滚。 | 这是领先的 Agent 软件生命周期证据，不等于底层数据/策略版本完全联动。 | Q、O | [Cortex Agent versioning](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-versioning) |
| SNF-07 | 官方声明 | Agent evaluation 可评估工具选择等指标；Analyst evaluation 可比较 verified query、结果正确性和延迟。 | Agent evaluation 当前不会实际调用 MCP 工具，是动作回归的明确缺口。 | Q | [Cortex Agent evaluations](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-evaluations)；[Cortex Analyst evaluations](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst-evaluations) |
| SNF-08 | 官方声明 | MCP connectors 可对接 Jira、Salesforce、Slack 等，并支持用户 OAuth。 | connector 状态和外部系统权限需逐项验证。 | T、I、X | [MCP connectors](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp-connectors) |
| SNF-09 | 官方声明 | Snowflake-managed MCP 允许 Claude、ChatGPT、Cursor 等客户端使用 Snowflake 资产，调用受用户默认角色约束。 | 默认角色而非任意当前角色是重要授权语义。 | T、I、F | [Snowflake-managed MCP](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp) |
| SNF-10 | 官方声明 | Native Apps 的 Agents/MCP 已在 2026-08 发布 GA，支持 feature policy、caller grant 和跨应用能力。 | 只证明 Native Apps 范围，不等于所有 MCP/Agent 功能 GA。 | T、I、M | [Native Apps Agents and MCP GA](https://docs.snowflake.com/en/release-notes/2026/other/2026-08-07-native-apps-agents-mcp-ga) |
| SNF-11 | 官方声明 | service-agent user type 已 GA；官方还公开讨论 Agent Identity。 | Agent Identity 仍有预览/渐进交付成分。 | I、M | [Service agent user type](https://docs.snowflake.com/en/release-notes/2026/other/2026-07-23-service-agent-user-type)；[Trusted data, trusted AI](https://www.snowflake.com/en/blog/trusted-data-trusted-ai/) |

## Google Cloud

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| GCP-01 | 官方声明 | Conversational Analytics API v1 在 2026-06 对 BigQuery/Looker GA，支持 verified queries、citations、UDF、billed bytes 和 data residency。 | v1 API 不返回图表，是 UI/API 不同构的限制。 | T、Q、O、M | [Conversational Analytics API release notes](https://docs.cloud.google.com/gemini/data-agents/conversational-analytics-api/release-notes) |
| GCP-02 | 官方声明 | BigQuery conversational analytics 可多步分析并形成可视报告，且 GA。 | 官方产品博客不能替代账号级正确性测试。 | A、M | [Conversational analytics in BigQuery GA](https://cloud.google.com/blog/products/data-analytics/conversational-analytics-in-bigquery-now-ga) |
| GCP-03 | 官方声明 | Gemini Enterprise 被定位为集中入口，可访问 BigQuery、Looker、AlloyDB、Spanner、Cloud SQL 等数据 Agent，并通过 API/MCP 扩展。 | 部分数据库 Agent 或主动工作流仍处于 Preview。 | E、T、F | [Conversational analytics in the Google Data Cloud](https://cloud.google.com/blog/products/data-analytics/conversational-analytics-in-google-data-cloud-in-q326) |
| GCP-04 | 官方声明 | BigQuery data agent 使用调用用户的底层数据权限，可配置参数化 verified query 和细粒度角色。 | Agent 资源权限与数据源权限是两层，不应混同。 | I、S、Q | [Create BigQuery data agents](https://docs.cloud.google.com/bigquery/docs/create-data-agents) |
| GCP-05 | 官方声明 | API 使用用户凭据查询底层数据源；拥有 API 角色不自动获得数据源访问权。 | 支持最终用户授权链，但跨数据产品语义一致性仍需验证。 | I | [Conversational Analytics access control](https://docs.cloud.google.com/gemini/data-agents/conversational-analytics-api/access-control) |
| GCP-06 | 官方声明 | BigQuery conversational analytics 可使用多种知识源，官方建议知识源增多时拆分 Agent；复杂 join/上下文会受 token 和准确性影响。 | 明确存在上下文、配额和 429/成本边界。 | S、M、O | [Conversational analytics](https://docs.cloud.google.com/bigquery/docs/conversational-analytics)；[Authentication and limits](https://docs.cloud.google.com/gemini/data-agents/conversational-analytics-api/authentication) |
| GCP-07 | 官方声明 | 官方持续发布 BigQuery、Lakehouse、Database agents、MCP/ADK 与 scheduled/proactive action。 | Preview/路线项不计当前成熟度。 | T、X、F | [New data agents across the agentic data cloud](https://cloud.google.com/blog/products/data-analytics/new-data-agents-across-the-agentic-data-cloud/) |
| GCP-08 | 官方声明 | BigQuery 在 2026 年从 conversational analytics Preview 迭代到 GA，并增加对象/非结构化与成本审计能力。 | 发布节奏不等于全产品统一治理完成。 | M、F、O | [BigQuery release notes](https://docs.cloud.google.com/bigquery/docs/release-notes) |

## AWS

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| AWS-01 | 官方声明 | Amazon Quick Suite 文档明确把 Chat 定义为 primary interface，并组合 agents、spaces、integrations、Quick Sight/Flows/Automate/Research。 | 这是最直接支持用户方向判断的官方声明之一；不证明传统 UI 消失。 | E、A | [How Amazon Quick Suite works](https://docs.aws.amazon.com/quick/latest/userguide/how-quicksuite-works.html) |
| AWS-02 | 官方声明 | Quick Suite 同时提供 system/custom agents；回答和可执行动作受用户权限约束。 | 需验证具体 connector 是否真正传递用户身份。 | I、X | [Work with agents](https://docs.aws.amazon.com/quick/latest/userguide/working-with-agents.html) |
| AWS-03 | 官方声明 | Quick Suite 能接远程 MCP，支持 user/service/no-auth 等认证和 VPC；工具可被发现并作为 action connector。 | service/no-auth 路径与 OBO 的风险不同。 | T、I、F | [MCP integration](https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html) |
| AWS-04 | 官方声明 | Quick Suite 可通过 web、MCP 和 coding-agent connector 接入，并支持 scheduled tasks。 | connector 广度不等于各连接器拥有相同审计和撤销语义。 | T、F、A | [Connections and desktop integrations](https://docs.aws.amazon.com/quick/latest/userguide/connections-desktop.html) |
| AWS-05 | 官方声明 | 2026-06 更新加入带阶段审批到目标自治的 autonomous agents、identity propagation、activity feed 和多数据集分析。 | 新能力的规模可靠性与客户采用仍 Unknown。 | X、I、O、M | [Amazon Quick autonomous agents update](https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-quick/) |
| AWS-06 | 官方声明 | 2026-08 多数据集 topics GA，并宣称人和 Agent 使用同一 semantic model，包含 RLS/CLS。 | 对复杂业务口径、版本与回归深度仍需实测。 | S、I、M | [Amazon Quick multi-dataset topics GA](https://aws.amazon.com/about-aws/whats-new/2026/08/amazon-quick/) |
| AWS-07 | 官方声明 | Apps/action integrations 区分 READ/WRITE consent，并提供 sandbox 约束。 | 不自动等价于草案、验证、回滚、事后证明的完整动作生命周期。 | X、I | [Security and sandboxing](https://docs.aws.amazon.com/quick/latest/userguide/security-sandbox-apps.html) |
| AWS-08 | 官方声明 | AgentCore policy 支持以 LOG_ONLY 模式测试策略并查看 trace。 | 属于 Bedrock AgentCore 层，是否与 Quick Suite 端到端共用需验证。 | X、Q、O | [Test an AgentCore policy](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-test-a-policy.html) |

## Microsoft

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| MS-01 | 官方声明 | Fabric data agent 已 GA，可对 OneLake 多类源进行对话式分析并接入外部 orchestrator，且结合 Purview。 | 当前只读；存在 25×25 结果、英语、非结构化和跨区域等限制。 | A、S、M | [Fabric data agent](https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent) |
| MS-02 | 官方声明 | Fabric data agent 可发布到 Microsoft 365 Copilot Agent Store，并通过 code interpreter 生成可视结果。 | Preview；同租户/账号约束，M365 orchestrator 可能重组回答。 | E、A、F | [Use a Fabric data agent in Microsoft 365 Copilot](https://learn.microsoft.com/en-us/fabric/data-science/data-agent-microsoft-365-copilot) |
| MS-03 | 官方声明 | Azure AI Foundry 可调用 Fabric data agent，并采用最终用户 on-behalf-of。 | Preview；需验证 tenant、consent 和各数据源权限。 | I、T | [Fabric tool in Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/fabric?view=foundry-classic) |
| MS-04 | 官方声明 | 已发布的 Fabric data agent 可暴露一个 MCP tool；Fabric Core MCP 使用 Entra OAuth、RBAC 和审计。 | Preview；一个 Agent 一个 MCP tool 约束会影响工具细分治理。 | T、I、O | [Fabric data agent MCP server](https://learn.microsoft.com/en-us/fabric/data-science/data-agent-mcp-server)；[Fabric MCP server](https://learn.microsoft.com/en-us/rest/api/fabric/articles/mcp-servers/what-is-fabric-mcp-server) |
| MS-05 | 官方声明 | Fabric data agent 有 Git/source control、deployment、CLI/batch API；service principal 仅用于 ALM。 | ALM 身份不等于运行时最终用户身份。 | T、Q、O | [Fabric data agent source control](https://learn.microsoft.com/en-us/fabric/data-science/data-agent-source-control) |
| MS-06 | 官方声明 | data agent 可用示例查询/SQL few-shot，并通过 SDK 检测冲突。 | 评测以 SQL 为主，不能证明跨工具动作回归。 | Q、S | [Example queries and validation](https://learn.microsoft.com/en-us/fabric/data-science/data-agent-example-queries) |
| MS-07 | 官方声明 | Purview integration 可记录完整 prompt/response 审计。 | Preview；敏感会话内容本身需要治理。 | O、I | [Purview governance for Fabric data agent](https://learn.microsoft.com/en-us/fabric/data-science/data-agent-purview-governance) |
| MS-08 | 官方声明 | Microsoft 公开路线包括 MCP-compliant workflow tools 和 Entra agent identity。 | Roadmap 明确可能变更；只能计演进方向。 | T、I、X | [MCP-compliant tools roadmap](https://learn.microsoft.com/en-us/power-platform/release-plan/2026wave1/microsoft-copilot-studio/use-mcp-compliant-tools-agent-workflows)；[Data platform planned features](https://learn.microsoft.com/en-us/power-platform/release-plan/2026wave1/data-platform/planned-features) |

## Oracle

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| ORA-01 | 官方声明 | OCI Database Tools 提供托管远程 MCP，并可发布参数化 SQL/PLSQL 工具。 | 自定义写工具的风险取决于 tool schema、DB role 与审批。 | T、X | [Database Tools MCP overview](https://docs.oracle.com/en-us/iaas/database-tools/doc/overview-mcp-server.html) |
| ORA-02 | 官方声明 | MCP 支持 OAuth、逐用户授权、短期 OBO 数据库认证和审计，并区分 401/403。 | 是数据库身份链的强证据，跨 OAC/Select AI 的一致性仍需验证。 | I、O | [MCP authentication and authorization](https://docs.oracle.com/en-us/iaas/database-tools/doc/authorization-and-authentication.html) |
| ORA-03 | 官方声明 | 最终用户身份可传播到 Oracle Database，并由数据库实施行、列、单元级 Deep Data Security。 | 依赖 Oracle Database 26ai/具体部署条件。 | I、S | [Integrate Database Tools MCP Server](https://docs.oracle.com/en/database/oracle/oracle-database/26/ddscg/integrate-database-tools-mcp-server.html) |
| ORA-04 | 官方声明 | MCP tool/report 可以由应用角色细粒度授权。 | 需验证角色变更、撤销与会话缓存。 | I、T | [Role-based access](https://docs.oracle.com/en-us/iaas/database-tools/doc/role-based-access.html) |
| ORA-05 | 官方声明 | 官方建议优先参数化工具、最小权限并限制通用 SQL。 | 安全建议不是自动实施证据。 | X | [Security considerations](https://docs.oracle.com/en-us/iaas/database-tools/doc/security-considerations.html) |
| ORA-06 | 官方声明 | Oracle Analytics Cloud 提供 AI Agents；Autonomous Database Select AI Agents 支持工具和动作历史。 | 消费入口分散在 OAC、Select AI 与 Database Tools；统一路由 Unknown。 | E、A、X | [Oracle Analytics AI Agents](https://docs.oracle.com/en/cloud/paas/analytics-cloud/acubi/oracle-analytics-ai-agents.html)；[Select AI Agents concepts](https://docs.oracle.com/en/cloud/paas/autonomous-database/serverless/adbsb/select-ai-agents-concepts.html) |
| ORA-07 | 官方声明 | Autonomous Database 文档提供 A2A 前置和互操作路径。 | A2A 可连接不等于共同身份和策略面。 | F、T | [A2A prerequisites](https://docs.oracle.com/en-us/iaas/autonomous-database-serverless/doc/prerequisites-a2a.html) |

## 阿里云

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| ALI-01 | 官方声明 | Quick BI Smart Q 提供统一入口，路由到问数、报告、洞察、搭建和搜索等 Agent。 | 属于增购能力；Edition、区域和账号未验证。 | E、A | [Smart Q 首页](https://help.aliyun.com/zh/quick-bi/user-guide/smart-q-home-page) |
| ALI-02 | 官方声明 | Smart Q 支持多 Agent、多轮、报告/搭建和移动端。 | 同一入口不自动证明同一语义对象与评测。 | E、A、F | [Smart Q](https://help.aliyun.com/zh/quick-bi/user-guide/smartq) |
| ALI-03 | 官方声明 | Quick BI v6.2 增加供外部 Agent 使用的 Skill，并提供基于 OpenAPI 的 CLI，覆盖组织权限、数据、嵌入和审计等管理。 | CLI 是管理/自动化入口，不应成为业务对象真相源。 | T、I、O | [Quick BI v6.2 发布说明](https://help.aliyun.com/zh/quick-bi/product-overview/quick-bi-v6-2-release-notes) |
| ALI-04 | 官方声明 | Quick BI Skill 可由外部 Agent 调用，按用户授权数据集返回推理、SQL 和图表。 | 部分路径涉及浏览器自动化或配置凭据；最终用户身份连续性需验证。 | T、I、A | [Quick BI Open Skill](https://help.aliyun.com/zh/quick-bi/user-guide/quick-bi-open-skill-manual) |
| ALI-05 | 官方声明 | DMS MCP 覆盖 40+ 数据源，可 NL2SQL、执行查询、发起数据变更工单、审批并查日志。 | 查询和变更必须按 DMS 权限与审批逐项测试。 | T、X、O | [部署 DMS MCP Server](https://help.aliyun.com/zh/dms/use-cases/deploy-dms-mcp) |
| ALI-06 | 官方声明 | DMS 权限细分到实例、库、表、行、列以及查询、变更、导出工作流。 | 权限模型强，但外部 Agent 是否始终携带最终用户身份需另验。 | I、S、X | [DMS 权限管理](https://help.aliyun.com/zh/dms/permissions/) |
| ALI-07 | 官方声明 | DMS API 的 RealLoginUserUid/AssumeUser 存在灰度/内部边界；固定 AK 路径可能把日志记在凭据所有者。 | 这是身份连续性的明确风险证据。 | I、O | [指定 API 调用者](https://help.aliyun.com/zh/dms/developer-reference/specify-the-api-caller) |
| ALI-08 | 官方声明 | DataWorks Data Agent 支持以自然语言进行数据集成、开发、运维、地图和治理任务，并在动作前确认。 | 与 Quick BI/DMS 的统一对象、身份、trace 仍 Unknown。 | A、X、T | [DataWorks Data Agent](https://help.aliyun.com/zh/dataworks/user-guide/data-agent) |
| ALI-09 | 官方声明 | DataWorks DI Agent 支持自然语言创建/管理单表与整库、离线与实时同步，自动探测 Schema、映射、资源和调度，确认后发布。 | 需购买 Data Agent 和 Serverless 资源组；文档中的 80+ 连接器需按源/动作/Region 核验。 | E、A、T、F | [DI Agent](https://help.aliyun.com/zh/dataworks/user-guide/introduction-to-data-integration-and-ai-native-capabilities) |
| ALI-10 | 官方声明 | DI Agent 还描述结构化/非结构化 ETL、Embedding、ChatDB 元数据/样例/分析，以及建库建表和结构变更。 | 广泛写操作扩大事故半径；官方声明不是本轮账号实测，生产必须保留 Diff/审批/后验。 | A、X、S | [DI Agent](https://help.aliyun.com/zh/dataworks/user-guide/introduction-to-data-integration-and-ai-native-capabilities) |
| ALI-11 | 官方声明 | Data Governance Agent 可自然语言扫描、生成治理计划与 SQL Diff，确认后修复并复检；Data Map 提供搜索、预览和血缘。 | 能力依 Region/Edition/增值模块；与 Quick BI/DMS 的同一身份和 trace 仍 Unknown。 | S、A、X、O | [Data Governance Agent](https://help.aliyun.com/zh/dataworks/user-guide/data-governance-agent)；[Data Map](https://help.aliyun.com/zh/dataworks/user-guide/data-map/) |

## 腾讯云

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| TCE-01 | 官方声明 | DataBuddy 宣称“对话即交付”，组合统一语义、MCP、Data+AI。 | 2026-08 新发布，属于厂商声明；账号、规模、客户成熟度未验证。 | E、S、T | [DataBuddy 产品页](https://cloud.tencent.com/product/databuddy) |
| TCE-02 | 官方声明 | DataBuddy 文档把平台描述为 Agent Native，以自然语言贯穿数据任务。 | 文档发布日期非常新，不能以路线完整度替代运行成熟度。 | E、A、M | [DataBuddy 产品概述](https://cloud.tencent.com/document/product/1835/135576) |
| TCE-03 | 官方声明 | 2026-08 发布列表含工程、治理、分析 Agent、RBAC+ACL、CI/CD、MCP 和可观测。 | 各模块深度、评测、回滚和跨 Agent 身份需要实测。 | S、T、O | [DataBuddy 发布动态](https://cloud.tencent.com/document/product/1835/135574) |
| TCE-04 | 官方声明 | DatabaseClaw 把操作分 L1-L4，对 L3/L4 请求确认，并可通过 IAM Deny 禁止破坏性动作、在 VPC 内运行。 | 分级和确认是强安全设计；幂等、事后验证和回滚仍需验证。 | X、I | [DatabaseClaw 能力与安全](https://cloud.tencent.com/document/product/1813/130681) |
| TCE-05 | 官方声明 | DatabaseClaw 使用独立 AI role，默认全局只读；写角色按实例授予并保留全审计。 | 最终用户与 AI role 的责任归属和委托链需进一步核验。 | I、X、O | [DatabaseClaw 权限配置](https://cloud.tencent.com/document/product/1813/134138) |
| TCE-06 | 官方声明 | DatabaseClaw Skill 可供第三方 Agent 使用，并强调最小权限和 session 审计。 | 外部 Agent 的 OAuth/OBO 细节公开证据不足。 | T、I、O | [DatabaseClaw Skill](https://cloud.tencent.com/document/product/1813/132895) |
| TCE-07 | 官方声明 | 腾讯云智能体平台持续加入 connector/actions 和审批中心。 | 是否与 DataBuddy/DatabaseClaw 共用策略对象是 Unknown。 | X、T、M | [智能体平台更新动态](https://cloud.tencent.com/document/product/1759/104191) |

## 华为云

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| HWC-01 | 官方声明 | DataArts Insight 智能分析助手提供自然语言分析入口。 | 公开测试；账号、区域、Edition、准确性与并发未验证。 | E、A、M | [DataArts Insight 产品功能](https://support.huaweicloud.com/productdesc-dataartsinsight/dataartsinsight_01_0009.html) |
| HWC-02 | 官方声明 | DataArts Insight 支持用 Ticket 嵌入资产/智能分析助手。 | 官方提示持有有效 Ticket 者可访问对应资产/数据；Ticket 生命周期和最终用户映射是关键验证项。 | I、F | [嵌入 DataArts Insight](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0455.html) |
| HWC-03 | 官方声明 | Insight 提供自然语言查询 API，并按数据集权限执行；DQE 可注入过滤与权限。 | 是否与 Studio 治理、数据库 RLS、外部 Agent 共享同一身份/语义尚无闭环证据。 | T、I、S | [DataArts Insight API](https://support.huaweicloud.com/api-dataartsinsight/dataartsinsight_api_0008.html)；[DQE 权限与过滤](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0303.html) |
| HWC-04 | 官方声明 | AgentArts 定位为企业级 Agent 平台，提供工具、API→MCP、trace/evaluation 和多渠道发布。 | 该事实证明组件能力，不证明已与 DataArts/数据库对象贯通。 | T、Q、F | [AgentArts 产品介绍](https://support.huaweicloud.com/productdesc-agentarts/agentarts_03_0002.html) |
| HWC-05 | 官方声明 | AgentArts 网关统一接入 REST/MCP，支持 API Key/OAuth、网络隔离、JWT 自定义声明、工具检索和多种凭据提供者。 | 出站支持 OAuth2/STS 是强组件证据；最终用户 OBO 到 DataArts/DB 的标准路径仍 Unknown。 | T、I | [网关介绍](https://support.huaweicloud.com/highcode-agentarts/agentarts_10_022.html)；[创建网关](https://support.huaweicloud.com/highcode-agentarts/agentarts_10_024.html) |
| HWC-06 | 官方声明 | AgentArts MCP gateway 原生 tools/list 与 tools/call，并进行协议版本协商。 | 网关可发现工具；公开页未证明统一的逐工具业务策略、动作审批与结果后置验证。 | T、X | [MCP Server Target](https://support.huaweicloud.com/highcode-agentarts/agentarts_10_063.html)；[MCP 协议版本](https://support.huaweicloud.com/highcode-agentarts/agentarts_10_074.html) |
| HWC-07 | 官方声明 | AgentArts 支持多轮评测集、在线工具轨迹评测、版本化评测集、trace/结果回流和多任务对比。 | 通用 Agent 评测能力强；尚无公开证据表明它覆盖 DataArts SQL 结果等价、权限负例与数据库动作后置条件。 | Q、O | [维护评测集](https://support.huaweicloud.com/ops-agentarts/agentarts_14_0032.html)；[Trace 数据回流](https://support.huaweicloud.com/ops-agentarts/agentarts_14_0021.html)；[对比评估](https://support.huaweicloud.com/ops-agentarts/agentarts_14_0131.html) |
| HWC-08 | 官方声明 | DAS 官方最佳实践展示第三方 Agent 通过 MCP 执行数据库运维，可涉及付费资源和广泛操作。 | 公测样例使用 AK/SK；不能作为低风险、最终用户 OBO 的生产证据。 | T、X、I | [DAS MCP 最佳实践](https://support.huaweicloud.com/bestpractice-das/das_best_practice_01_0017.html) |
| HWC-09 | 官方声明 | GaussDB(DWS) 文档提供 MCP 元数据、活动与执行工具，并发布数据分析 Agent 实践。 | 工具权限、只读保护、用户委托、审批和回滚需逐项验证。 | T、A、X | [DWS MCP](https://support.huaweicloud.com/intl/en-us/devg-911-dws/dws_04_1464.html)；[DWS 数据分析 Agent](https://support.huaweicloud.com/bestpractice-dws/dws_05_0152.html) |
| HWC-10 | Unknown | 未找到公开官方证据证明 Genie One 类入口、Insight、Studio、AgentArts、DAS/DWS 使用同一最终用户身份、语义对象 ID、逐工具策略、trace 与评测 ID。 | 这是证据空白，不等于内部没有。 | E、S、I、T、Q | 需要按专项报告的账号/架构验证 Gate 闭合。 |

## 火山引擎

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| VOL-01 | 官方声明 | DataWind 智能分析可按产品、项目、Agent、数据集等授权，并支持行列级权限。 | 最终用户身份从嵌入/API 到数据源的连续性需验证。 | I、S | [智能分析权限管理](https://www.volcengine.com/docs/85637/1588225) |
| VOL-02 | 官方声明 | DataWind 提供 OpenAPI、iframe/JWT 等第三方集成方式。 | JWT claim、撤销、数据源授权和审计需实测。 | T、I、F | [第三方集成](https://www.volcengine.com/docs/85637/1863973) |
| VOL-03 | 官方声明 | 深度研究 API 可由外部应用发起复杂分析。 | 结果正确性、引用、成本和长任务恢复边界需验证。 | A、T | [深度研究 API](https://www.volcengine.com/docs/85637/1863965) |
| VOL-04 | 官方声明 | 产品提供审计、反馈、成功/失败和处理明细。 | 未找到与版本化回归评测完全闭环的公开证据。 | Q、O | [智能分析审计与反馈](https://www.volcengine.com/docs/85637/1860218) |
| VOL-05 | 官方声明 | 对话与深度研究支持自动选择数据集，并有 SaaS/私有化边界。 | 某些场景仅限内部使用；跨系统动作能力证据不足。 | E、A、M | [智能分析使用说明](https://www.volcengine.com/docs/85637/1783727) |

## 百度智能云

| ID | 标签 | 可核验事实 | 状态/边界 | 支持维度 | 官方来源 |
|---|---|---|---|---|---|
| BIDU-01 | 官方声明 | 百度“胜算”/DataBuilder 产品页描述本体、逻辑、动作和治理一体的 Agent 数据平台方向。 | 当前公开 API、身份、评测、版本、状态和端到端约束证据不足。 | E、S、X | [百度胜算 DataBuilder](https://cloud.baidu.com/product/databuilder) |
| BIDU-02 | Unknown | 公开资料不足以在同一粒度上确认外部 Agent 工具协议、最终用户委托、SQL/结果回归、动作审批与生产运营。 | 因证据不足给出宽置信区间，不得解读为能力缺失。 | I、T、Q、M | 需账号与接口文档补证。 |

## 细粒度能力、数据源接入与责任边界补充证据束

本节为[厂商能力详册](./vendor-entry-atlas.html#capabilities)中的 `67 × 11` 能力矩阵、12 类数据源矩阵和责任卡提供直接证据束。矩阵单元格是本研究根据下列官方材料做出的有限分类，不是厂商原文，也不是账号实测：

- `支持（A）`：当前官方文档明确可用；
- `限用（L）`：可以使用，但受 Preview/Beta/邀测/Edition/数量、类型或其他关键条件限制；
- `组合（J）`：需要接入、建模、联邦、相邻产品或外部编排后实现；
- `待证（U）`：公开证据不足，不能解释为确认不支持；
- `不支持（N）`：官方明确当前范围外。

数据源接入方式另分为 `直用（D）/接入（P）/限用（L）/工具（T）/待证（U）/不支持（N）`：`直用`表示 Agent 可直接分析，`接入`表示需先摄取、复制、联邦、建数据集或知识库，`工具`表示只能作为外部工具或操作调用。连接器数量不进入能力分，除非其最终用户身份、数据时效、语义和执行路径也有证据。括号中的字母只用于底层数据和复核，不在矩阵单元格中展示。

| ID | 厂商 | 可核验的细粒度事实 | 对矩阵/责任判断的边界 | 主要官方来源 |
|---|---|---|---|---|
| CAP-DBX-01 | Databricks | Genie Agent 可使用 UC managed/external/foreign tables、views、metric/materialized views；知识存储含描述、同义词、Join、SQL 表达式、指令、示例 SQL、trusted assets 和 benchmark。Chat 生成查询为只读，并实施 UC 行过滤/列掩码；Agent mode 可多查询并形成带引用/可视化报告。 | Agent mode、Volume 文档和 Genie One 外部源含 Beta；不能把相邻 Lakeflow/Federation 路径记成外部源“零准备直达”。 | [Genie Agents concepts](https://docs.databricks.com/aws/en/genie-agents/concepts)；[Volume files](https://docs.databricks.com/aws/en/genie-agents/volumes)；[External sources](https://docs.databricks.com/aws/en/genie-one/external-sources) |
| CAP-DBX-02 | Databricks | benchmark 最多 500 问；Chat 可比较生成与期望 SQL 的结果等价，Agent mode 使用 LLM judge。Conversation API 支持有状态会话、配置序列化和 CI/CD 管理。 | 结果等价是强正确性证据，但并不自动覆盖外部动作后置条件；API/UI 并非所有字段和体验都同构。 | [Monitor Genie Agents](https://docs.databricks.com/aws/en/genie-agents/monitor)；[Conversation API](https://docs.databricks.com/aws/en/genie/conversation-api) |
| CAP-DBX-03 | Databricks | Lakehouse Federation 提供受治理、只读的 MySQL/PostgreSQL/Teradata/Oracle/Redshift/Salesforce Data 360/Snowflake/SQL Server/Synapse/BigQuery 等外部查询；Lakeflow Connect 提供数据库 CDC、文件、SaaS 和流式连接器。 | 这些是平台数据接入路径，不等于 Genie UI 可不经连接、Catalog 和权限配置直接使用。 | [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/)；[Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/) |
| CAP-SNF-01 | Snowflake | CoWork Agent 可组合 semantic view/Cortex Analyst、Cortex Search 与 UDF/存储过程工具；CoWork 支持 Deep Research 和多类文件上传。 | 上线前仍需创建语义视图、Search service、Agent 和角色；文件、工具和产品状态需逐项核验。 | [Build agents](https://docs.snowflake.com/en/user-guide/snowflake-cortex/snowflake-cowork/build-agents)；[CoWork](https://docs.snowflake.com/en/user-guide/snowflake-cortex/snowflake-cowork) |
| CAP-SNF-02 | Snowflake | Cortex Analyst evaluation 用 verified queries 作 ground truth，执行生成/期望查询并比较结果与延迟。 | 强于只评文本，但 Cortex Agent evaluation 当前不实际调用 MCP 工具，不能证明外部动作回归。 | [Cortex Analyst evaluations](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst-evaluations)；[Cortex Agent evaluations](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-evaluations) |
| CAP-SNF-03 | Snowflake | 获得 Cortex Search service `USAGE` 的角色可访问已索引内容，即使没有底层表权限。 | 这是搜索索引与底层查询授权语义不同的明确反例；不能把“都有 RBAC”简化为权限完全同构。 | [Query a Cortex Search service](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/query-cortex-search-service) |
| CAP-GCP-01 | Google | BigQuery Conversational Analytics GA，可使用 project/dataset/table/view/graph/UDF、Knowledge Catalog、verified queries、对象表和多种 AI 分析函数，并提供查询预算/上限。 | 官方能力广度不等于近 100% 等营销准确率；本研究只计架构能力，不采信营销命中率。 | [BigQuery CA GA](https://cloud.google.com/blog/products/data-analytics/conversational-analytics-in-bigquery-now-ga)；[Conversational analytics](https://docs.cloud.google.com/bigquery/docs/conversational-analytics) |
| CAP-GCP-02 | Google | 2026-06/07 官方路线把 BigQuery/Looker CA 推到 GA，并扩展 Lakehouse 与 AlloyDB/Spanner/Cloud SQL data agents、Graph、OTEL 和主动动作。 | Lakehouse、部分数据库、Graph/主动动作仍有 Preview；只影响受限状态与动量，不计为全量当前 GA。 | [New data agents](https://cloud.google.com/blog/products/data-analytics/new-data-agents-across-the-agentic-data-cloud/)；[Q3 2026 update](https://cloud.google.com/blog/products/data-analytics/conversational-analytics-in-google-data-cloud-in-q326) |
| CAP-AWS-01 | AWS | Quick 支持 Athena/Aurora/Glue/OpenSearch/Redshift/S3/Databricks/BigQuery/MySQL/PostgreSQL/文件及 Jira/ServiceNow/GitHub/Salesforce 等源；Spaces 可组合文档、Dashboard、topic、dataset、knowledge base 与 actions，并保留资源权限。 | 同一“支持源”可能是直连、SPICE/数据集、connected KB 或 action；因此在数据源矩阵中分别标 `D/P/T`。 | [Supported data sources](https://docs.aws.amazon.com/quick/latest/userguide/supported-data-sources.html)；[Spaces](https://docs.aws.amazon.com/quick/latest/userguide/working-with-spaces.html)；[Data access integrations](https://docs.aws.amazon.com/quick/latest/userguide/data-access-integrations.html) |
| CAP-AWS-02 | AWS | Agent 可配置 persona、知识、resources 和 actions；Flows/Automate 可编排研究、用户输入、外部动作和运行记录，action authentication 可使用用户或服务身份。 | 入口/动作易用度强；公开资料未提供与 Snowflake/Databricks 同粒度的 SQL/结果等价回归，因此 Q03 维持 Unknown。 | [Agents](https://docs.aws.amazon.com/quick/latest/userguide/working-with-agents.html)；[Flows](https://docs.aws.amazon.com/quick/latest/userguide/using-amazon-quick-flows.html)；[Actions](https://docs.aws.amazon.com/quick/latest/userguide/int-actions-how-it-works.html) |
| CAP-MS-01 | Microsoft | Fabric Data Agent 需要 F2/P1、租户 AI/cross-geo 设置、源读取权限；每 Agent 最多 5 个源。支持 Lakehouse、Warehouse、semantic model、KQL、SQL/Mirrored DB、Microsoft Graph，并以 Entra 用户身份访问。 | Graph、Ontology、Azure AI Search 等含 Preview；服务主体 ALM 与最终用户运行身份分开。 | [Create a Fabric data agent](https://learn.microsoft.com/en-us/fabric/data-science/how-to-create-data-agent)；[Add data sources](https://learn.microsoft.com/en-us/fabric/data-science/data-agent-add-datasources?tabs=gql) |
| CAP-MS-02 | Microsoft | 作者可补 source/agent instructions、SQL examples 和 Power BI Prep for AI/Verified Answers；SQL example validation 可检查语法、Schema 与冲突。官方当前把 root-cause、causal inference、advanced analytics 列为范围外。 | SQL 验证不证明跨源、多步、动作评测；明确范围外项记 `N`，而不是 Unknown。 | [Example queries](https://learn.microsoft.com/en-us/fabric/data-science/data-agent-example-queries)；[Create a Fabric data agent](https://learn.microsoft.com/en-us/fabric/data-science/how-to-create-data-agent) |
| CAP-ALI-01 | 阿里云 | Quick BI 主流数据源均可进入基础分析与 Smart Q，但高级能力依数据源；Smart Q 需要在数据集上配置问答，维护字段、聚合、术语和知识。 | “均支持 Smart Q”不等于所有源的直连/关联/高级能力相同，需按 connector 和模式标限制。 | [不同数据源支持能力](https://help.aliyun.com/zh/quick-bi/user-guide/features-supported-by-different-data-sources)；[准备数据](https://help.aliyun.com/zh/quick-bi/user-guide/prepare-data/) |
| CAP-ALI-02 | 阿里云 | 官方新手指南展示默认字段或指标导致回答错误，需要建立计算字段或调整知识并重新学习；API 数据源又有版本、10MB、100 列、1000 行直连等限制。 | 这是客户语义准备与失败修复成本的直接证据，不能因入口完整而给“零预置”评价。 | [Smart Q 新手指南](https://help.aliyun.com/zh/quick-bi/getting-started/smartq-novice-guide)；[API 数据源](https://help.aliyun.com/zh/quick-bi/user-guide/create-an-api-data-source) |
| CAP-TCE-01 | 腾讯云 | DataBuddy 官方架构描述关系库、湖仓、NoSQL/KV、MQ/流、文件/对象/API/多模态和 5 类摄取模式；发布说明称 47+ 源、离线/实时、CDC、自然语言建源与任务。 | 2026-08 新产品，很多信息是厂商架构/发布声明；来源广度、准确度、自愈和客户规模不能当账号实测。 | [产品架构](https://cloud.tencent.com/document/product/1835/135578)；[发布动态](https://cloud.tencent.com/document/product/1835/135574) |
| CAP-TCE-02 | 腾讯云 | FAQ 给出全湖、联邦、直连 OLAP 三类数据路径，描述 OBO、RBAC+ACL、脱敏/审计、高风险 SQL 阻断和人类确认，并给出 99.5% SLA。 | 需验证 OBO 在每种源和外部 Agent 中的真实实施、风险确认的幂等/后置验证，以及 SLA 覆盖对象。 | [DataBuddy FAQ](https://cloud.tencent.com/document/product/1835/135597) |
| CAP-ORA-01 | Oracle | OAC Analytics AI Agent 一个 Agent 使用一个 dataset；dataset 可来自文件、表、多表或 subject area，必须索引，可限制列和设置强制过滤；知识文件为 PDF/TXT、最多 10 个、每个小于 5MB。 | one-dataset/索引/文件限制直接进入预置负担；官方提醒 LLM 可能不准确，关键事实需人工验证。 | [Dataset used by an agent](https://docs.oracle.com/en/cloud/paas/analytics-cloud/acubi/dataset-used-oracle-analytics-ai-agent.html)；[Indexing](https://docs.oracle.com/en/cloud/paas/analytics-cloud/acubi/indexing-dataset-oracle-analytics-ai-assistant.html)；[Knowledge file considerations](https://docs.oracle.com/en/cloud/paas/analytics-cloud/acubi/oracle-analytics-ai-agent-knowledge-document-file-considerations.html) |
| CAP-ORA-02 | Oracle | OAC 官方连接源清单覆盖 Oracle Apps/DB、EMR/Redshift/Hive/Spark/Databricks/BigQuery/SQL Server/Snowflake/PostgreSQL、文件、Drive/Dropbox、REST/OData/Salesforce 等。 | 底层 OAC connector 广度不等于每种源均为 AI Agent 零准备直达；仍需先形成并索引 dataset。 | [Supported data sources](https://docs.oracle.com/en/cloud/paas/analytics-cloud/acsds/listed-supported-data-sources-oracle-analytics-cloud.html) |
| CAP-VOL-01 | 火山引擎 | Data Agent 快速入门要求购买/授权、项目、连接、数据集、启用分析并等待 15 分钟以上向量化；模型配置需超级管理员设置 embedding/query/analysis model。 | UI 简洁但首次可信任务并非零配置；模型运营责任部分留给客户。 | [快速入门](https://www.volcengine.com/docs/85637/1783727?lang=zh)；[模型配置](https://www.volcengine.com/docs/85637/2275379) |
| CAP-VOL-02 | 火山引擎 | 官方称 40+ 数据连接并区分抽取/直连/实时；直连不能跨数据连接关联，SaaS 连接需 IP 白名单。 | 连接器数量不能覆盖跨源 Join、网络与刷新成本；直接进入易用度扣分和 `D/P/L` 模式判断。 | [数据连接](https://www.volcengine.com/docs/85637/1588183) |
| CAP-HWC-01 | 华为云 | Insight 当前官方源清单含 DWS、GaussDB、MySQL、PostgreSQL、Doris、ClickHouse、API、DLI、Hive，并要求同企业项目/区域及网络准备。 | Studio 的更多离线/实时/CDC 源是相邻产品，不能自动记成 Insight Agent 当前直接源。 | [Insight 数据源](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0101.html)；[Studio 数据源](https://support.huaweicloud.com/usermanual-dataartsstudio/dataartsstudio_01_0005.html) |
| CAP-HWC-02 | 华为云 | 官方准备指南建议数据干净、简单、适中；复杂指标应提前计算，称当前大模型处理指标能力较弱；多表自动关联准确率低，建议预先 Join 为一个宽表。 | 这是华为“获得可信答案的易用度”得分较低的直接官方证据，不是由竞争对手资料推断。 | [智能分析数据准备](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5118.html) |
| CAP-HWC-03 | 华为云 | 助手可配置模型、Prompt、场景、关键词、实体、问题模板、关联问题、洞察模板、同义词和时间等；另有评测管理/BadCase。 | 配置面丰富支持准确度工程，但也增加客户准备；尚未证明 AgentArts 通用 Eval 与 Insight SQL 结果等价/权限负例同一闭环。 | [智能分析助手配置](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5059.html)；[评测管理](https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5080.html) |
| CAP-BIDU-01 | 百度智能云 | DataBuilder 产品页声明本体、逻辑、Action、多层上下文、结构化/非结构化、权限、沙箱、资源隔离和审计；公开权限文档确认 IAM+RBAC 与 Workspace 角色。 | 没有找到同粒度的 Agent connector、首次任务、API/MCP、OBO、评测与状态文档；方向项标 `L`、其余维持 `U`，不能推断不存在。 | [DataBuilder](https://cloud.baidu.com/product/databuilder)；[权限管理](https://cloud.baidu.com/doc/DataBuilder/s/mm99rjtfl) |

## 入口视觉与官方演示证据索引

本节只记录“官方公开过什么入口形态”，不把截图或视频升级为`实际观察`，也不单独提高成熟度分。所有素材已本地化到 [`assets/vendor-entry/`](./assets/vendor-entry/)，用于主报告和[厂商入口详册](./vendor-entry-atlas.html)；版权归相应厂商。

| ID | 厂商/入口 | 本地素材 | 素材性质与可支持命题 | 官方原始页面 | 官方视频/动态状态 |
|---|---|---|---|---|---|
| VIZ-01 | Snowflake CoWork | `snowflake-cowork.webp` | 官网真实产品 UI；支持“对话、自动化、工件、能力、搜索和历史任务进入同一工作面”。 | [CoWork 产品页](https://www.snowflake.com/en/product/snowflake-cowork/) | [AI Pulse 2026-06](https://www.snowflake.com/en/ai-pulse/june-2026/)，CoWork 深入介绍 05:26、Demo 17:48。 |
| VIZ-02 | Databricks Genie One | `databricks-genie-one.png` | 官方文档真实 UI；支持“Ask/Search、Dashboard、Genie Space、App 和 Domain 进入简化消费首页”。 | [Genie One](https://docs.databricks.com/aws/en/genie-one) | [官方端到端 Demo](https://www.youtube.com/watch?v=Tc3WqbV7fKA)；[交互式 Tour](https://www.databricks.com/resources/demos/tours/bi/databricks-aibi-genie)。 |
| VIZ-03 | Google BigQuery Conversational Analytics | `google-bigquery-conversational-analytics.gif` | 官方动态 UI；支持“对话可触发多步分析，且产品有 Conversations/Agent Catalog 形态”。 | [官方发布博客与动图](https://cloud.google.com/blog/products/data-analytics/introducing-conversational-analytics-in-bigquery) | 同一官方页面含四段动态演示；未用第三方长视频补位。 |
| VIZ-04 | AWS Amazon Quick | `aws-quick-suite.png` | 官方发布真实 UI，图中仍用旧称 Quick Suite；支持“Chat、Agents、Spaces、Flows、Research 首屏收敛”。 | [AWS 发布文章](https://aws.amazon.com/blogs/business-intelligence/reimagine-business-intelligence-amazon-quicksight-evolves-to-amazon-quick-suite/) | [AWS 官方产品视频](https://www.youtube.com/watch?v=duccb_K1seQ)；当前名称和机制另见 [Amazon Quick 文档](https://docs.aws.amazon.com/quick/latest/userguide/how-quicksuite-works.html)。 |
| VIZ-05 | Microsoft Fabric Data Agent | `microsoft-fabric-data-agent.png` | Microsoft Learn 真实作者/测试 UI；支持“数据源、字段、指令、测试与发布在同一作者面”，不支持“已有统一业务首页”。 | [Create a Fabric data agent](https://learn.microsoft.com/en-us/fabric/data-science/how-to-create-data-agent) | [Microsoft 官方 Demo](https://www.youtube.com/watch?v=5hPVjbV2bRU)。 |
| VIZ-06 | 阿里云 Quick BI 智能小Q | `alibaba-quick-bi-smartq.png` | 官方帮助中心真实 UI；支持“智能小Q是顶部一级入口，并路由问数、解读、报告、搭建和搜索”。 | [智能小Q首页](https://help.aliyun.com/zh/quick-bi/user-guide/smart-q-home-page) | [官方智能小Q实操视频页](https://help.aliyun.com/zh/quick-bi/videos/smartq)。 |
| VIZ-07 | 腾讯云 DataBuddy | `tencent-databuddy.webp` | 腾讯云大数据团队发布的真实产品 UI，并由产品页/文档交叉确认；支持“任务、Skills、SQL、工程、治理、分析处于同一工作台”。 | [官方团队文章](https://cloud.tencent.com/developer/article/2672626)；[产品页](https://cloud.tencent.com/product/databuddy) | 截至基准日未确认到与当前入口一一对应的官方专场视频。 |
| VIZ-08 | Oracle Analytics AI Agent | `oracle-analytics-ai-agent.png` | Oracle 文档真实作者 UI；支持“数据、补充指令、首条消息、主题与知识文档可配置”，不代表最终消费者首页。 | [Create an Oracle Analytics AI Agent](https://docs.oracle.com/en/cloud/paas/analytics-cloud/acubi/create-oracle-analytics-ai-agent.html) | [Oracle 官方消费者端 Demo，2026-05](https://www.youtube.com/watch?v=FYg5mGs7-IE)。 |
| VIZ-09 | 火山引擎 Data Agent | `volcano-data-agent.png` | 官方快速入门真实 UI；支持“研究模式、联网、拓展与附件直接进入对话任务”。 | [Data Agent 快速入门](https://www.volcengine.com/docs/85637/1783727?lang=zh) | [官方 Data Agent 系列课程](https://developer.volcengine.com/videos/set/7552801541149687846)。 |
| VIZ-10 | 华为云 DataArts Insight 智能分析助手 | `huawei-dataarts-insight-assistant.png` | 官方快速入门真实 UI；支持“项目内已有自然语言问答入口”，同时页面明确企业版/公测等前置。 | [快速入门与原图](https://support.huaweicloud.com/qs-dataartsinsight/dataartsinsight_02_0007.html) | [官方视频索引：使用智能分析助手，02:24](https://support.huaweicloud.com/dataartsinsight_video/index.html)。 |
| VIZ-11 | 百度智能云 DataBuilder Data Agent | `baidu-databuilder-data-agent.png` | **官网概念图，不是真实控制台**；只支持“厂商公开表达多层上下文、工具、人机协同与可信结果方向”。 | [DataBuilder 产品页](https://cloud.baidu.com/product/databuilder) | 截至基准日未确认对应真实入口的官方演示；[官方视频中心](https://cloud.baidu.com/video-center/index.html)不作为对应性证据。 |

## 证据空白与反证条件

以下问题如果被官方架构材料或账号级只读验证证实，会显著改变本次评分：

1. 华为云若能证明一个最终用户身份从统一对话入口贯穿 Insight、Studio、AgentArts、DAS/DWS，并由底层数据库 RLS/列权限实施，`I` 可提高 2–3 分。
2. 华为云若能证明同一业务指标/语义对象、版本和资源 ID 同时服务 Dashboard、问数、外部 Agent 与数据库工具，`S` 可提高 1.5–2 分。
3. 华为云若能证明动作具备草案、静态/运行前验证、风险分级、审批、幂等、执行后验证和补偿/回滚，`X` 可提高 2–3 分。
4. 腾讯 DataBuddy 若出现连续两个以上版本周期的生产案例、SLA、评测与升级/回滚证据，`M/Q/O` 将显著上调。
5. 百度若补齐细粒度接口、身份、trace/evaluation 和状态资料，应重新评分而不是沿用低置信度分数。
6. 任何厂商若账号实测发现 UI、API、MCP 使用不同凭据或绕过语义/行列权限，应下调 `I/S/T`，即使营销页宣称“统一”。
