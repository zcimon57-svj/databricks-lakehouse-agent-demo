# 模块研究与演示矩阵

状态说明：`DOC_VERIFIED`、`WORKSPACE_VERIFIED`、`RECORDED`、`ENTRY_RECORDED`（真实入口已录但未创建资源）、`NOT_CREATED`。

| ID | 模块 | 主问题 | 内嵌入口 | 外部入口 | 案例 | 当前状态 |
|---|---|---|---|---|---|---|
| M01 | Account 与 Workspace | 登录后实际获得了什么环境 | Workspace UI | Workspace API（账号级 API 在 Free Edition 不支持） | C1 | RECORDED |
| M02 | Catalog/Schema/Table/Volume | 数据对象如何组织 | Catalog Explorer | SQL、CLI、SDK、REST | C1-C4 | RECORDED |
| M03 | Delta Lake/Lakehouse | 数据湖如何获得表语义和事务能力 | SQL、Notebook | Spark/Delta 客户端、Sharing | C1 | RECORDED |
| M04 | Unity Catalog | 权限、血缘和发现如何统一 | Catalog UI、Lineage | API、系统表、外部引擎 | C1-C4 | RECORDED |
| M05 | 数据接入 | 文件、数据库、SaaS、流数据怎么进入 | Add Data、Lakeflow | Connectors、Auto Loader、API | C1 | RECORDED |
| M06 | 数据转换与调度 | 开发态如何变成可运营任务 | Notebook、Pipelines、Jobs | Bundles、CLI、SDK、REST | C1 | ENTRY_RECORDED |
| M07 | SQL Warehouse | 分析 SQL 在哪里执行 | SQL Editor | JDBC、ODBC、SQL Connector、Statement API | C1-C4 | RECORDED |
| M08 | Dashboard/Metric View | 指标如何复用和展示 | AI/BI Dashboard | Embedding、BI 工具、API | C1-C3 | DOC_VERIFIED |
| M09 | 自然语言分析 | 自然语言如何可靠地产生分析 | Genie Agent | Conversation API、外部 Agent Tool | C2-C4 | RECORDED |
| M10 | Lakebase | OLTP 与 Lakehouse 如何配合 | Lakebase Postgres UI/SQL | PostgreSQL 驱动、Data API、App、Agent | C3-C4 | ENTRY_RECORDED |
| M11 | Databricks Apps | 如何交付业务应用 | Apps UI | 浏览器、API、企业入口 | C3-C4 | DOC_VERIFIED / NOT_CREATED |
| M12 | 数据共享与联邦 | 不复制或跨组织如何访问 | Catalog/Marketplace | Open Sharing、Federation | C1 | DOC_VERIFIED / NOT_CREATED |
| M13 | 外部开发与自动化 | 如何离开工作区 UI 工作 | Git/Notebook | CLI、SDK、REST、Connect、Bundles | C1-C4 | WORKSPACE_VERIFIED |
| M14 | Free Edition 限制 | 演示结果能否代表生产环境 | Free Edition UI 标签 | 官方配额/限制文档 | 全部 | RECORDED |
| M15 | 成本与运维 | 谁承担计算、并发和失败恢复 | Warehouse/Run UI | 系统表、API、外部监控 | 全部 | WORKSPACE_VERIFIED |

## 交付解释

- `RECORDED` 不等于该产品的全部生产能力都验证；只表示矩阵中的主问题有真实 UI/操作证据。
- M06 和 M10 为真实入口录屏，但没有创建 Job/Pipeline 或 Lakebase 项目，避免为了展示制造不必要资源。
- M08、M11、M12 由架构图、官方文档和外部视频讲解覆盖；本轮没有虚构 Dashboard/App/Share/Connection 的现场操作。
- 四个案例 C1-C4 均有本地 SQL/Notebook 或真实录屏，其中 C2-C4 是独立录屏。

## 每个模块的最小证据包

- 官方定义与状态；
- 真实工作区入口截图；
- 一次成功操作；
- 至少一个失败或限制边界；
- 一段真实录屏；
- 一个外部调用方式；
- 内嵌与外部差异结论；
- 对领导的一句话价值；
- 对技术人员的复现步骤；
- 来源和信息截止日。
