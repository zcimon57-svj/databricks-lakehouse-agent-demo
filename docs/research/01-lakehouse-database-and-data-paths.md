# 数据湖、Lakehouse、数据库与数据路径

信息截止：2026-08-16  
证据状态：`DOC_VERIFIED + CORE_PATH_WORKSPACE_VERIFIED + RECORDED`

## 1. 先把三个概念分开

### 数据湖

核心是对象存储上的大规模文件和开放数据格式。优点是容量、成本和灵活性；如果只有文件，事务、一致的 Schema、发现、权限和高性能 BI 通常需要额外系统补齐。

### Lakehouse

Databricks 的核心主张不是“把数据湖换成数据库”，而是在数据湖之上组合：

- Delta Lake：ACID 事务、Schema enforcement/evolution 和可靠表语义；
- Spark/Photon：批、流、SQL 与大规模处理；
- Unity Catalog：统一对象、权限、发现、血缘和审计；
- SQL Warehouse：与存储解耦的分析 SQL 计算；
- Lakeflow：接入、转换和任务编排。

来源：[What is a data lakehouse?](https://docs.databricks.com/aws/en/lakehouse/)、[Data warehousing architecture](https://docs.databricks.com/aws/en/sql/get-started/data-warehousing-concepts)

### Lakebase

Lakebase 是托管 Postgres OLTP，不是 Delta Lake 的替代物：

- Lakehouse 适合大规模分析、历史数据、流批处理和 Gold 数据集；
- Lakebase 适合低延迟点查、事务、应用状态、会话、任务和 CRUD；
- Synced Tables 可以把 Unity Catalog 中的分析结果复制到 Lakebase，供应用低延迟读取；
- 应用也可以把事务变化回流到 Delta，用于后续分析与审计。

来源：[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp/)、[Serve lakehouse data with synced tables](https://docs.databricks.com/aws/en/oltp/projects/sync-tables)

## 2. Unity Catalog 是贯穿层，不只是一个数据目录

Unity Catalog 使用 `catalog.schema.object` 三层命名空间。对象包括表、视图、Volume、函数、模型和服务。它在查询或调用发生时自动执行权限检查、记录血缘并提供审计入口。

数据对象需要区分：

| 类型 | 数据在哪里 | 谁管理文件生命周期 | 写入 | 典型用途 |
|---|---|---|---|---|
| Managed Table | Databricks 管理的存储 | Unity Catalog/Databricks | 是 | 默认和优先选择 |
| External Table | 外部对象存储 | 用户或外部平台 | 是 | 已有湖存储、独立生命周期 |
| Foreign Table | 外部数据库或 Catalog | 外部系统 | 通常只读 | Federation、迁移过渡、临时分析 |
| Volume | 对象存储中的非表文件 | Managed 或 External | 取决于权限 | CSV、JSON、PDF、模型或其他文件 |

来源：[What is Unity Catalog?](https://docs.databricks.com/aws/en/data-governance/unity-catalog)、[What are tables?](https://docs.databricks.com/aws/en/tables/table-overview)

## 3. 高频主流程

```text
文件 / RDBMS / SaaS / Kafka
            │
            ▼
  Lakeflow Connect / Auto Loader / Streaming
            │
            ▼
       Bronze：原始、可回放
            │
            ▼
       Silver：清洗、去重、关联
            │
            ▼
       Gold：指标、主题和数据产品
            │
    ┌───────┼───────────────┐
    ▼       ▼               ▼
SQL/BI   Genie/自然语言   Sharing/API/App

Unity Catalog 横跨所有层：对象、权限、血缘、审计、共享
```

Bronze/Silver/Gold 是提高数据质量的设计模式，而不是必须创建三个物理 Catalog。小型演示可以使用同一 Catalog 下的三个 Schema；生产设计则需要结合团队、环境、数据敏感度和存储隔离来决定边界。

来源：[Reliability best practices](https://docs.databricks.com/aws/en/lakehouse-architecture/reliability/best-practices)、[What are catalogs?](https://docs.databricks.com/aws/en/catalogs)

## 4. 外部数据库数据有四条完全不同的路径

### A. 搬进 Lakehouse：Lakeflow Connect / CDC

- 适合持续分析、高数据量、较低查询延迟和历史留存；
- MySQL、PostgreSQL、SQL Server 等可通过托管 CDC 接入；
- 连接对象受 Unity Catalog 管理；
- 目标是 Delta 表，后续由 Databricks 计算处理。

来源：[Managed database connectors](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/cdc-overview)

### B. 数据不搬：Lakehouse Federation

- 外部数据库仍是事实来源；
- Databricks 通过 JDBC 下推查询；
- 外部库以 Foreign Catalog 形式出现在 Unity Catalog；
- 主要用于临时报表、POC、迁移前探索；
- 默认只读，性能、并发和成本还受远端数据库影响。

来源：[Connect to external databases and catalogs](https://docs.databricks.com/aws/en/query-federation)

### C. 把 Lakehouse 数据提供给外部使用者：OpenSharing

- 接收者可以是另一个 Databricks 账号，也可以不是 Databricks 用户；
- 适合跨组织或跨云共享表、文件和其他支持资产；
- 与把数据复制成 CSV 邮件发送相比，可以保留更明确的权限、更新和数据产品边界。

来源：[Share data and AI assets securely](https://docs.databricks.com/aws/en/data-sharing)、[What is OpenSharing?](https://docs.databricks.com/aws/en/opensharing)

### D. 让外部应用查询：SQL Driver/API 或 Lakebase

- 分析型 SQL：JDBC、ODBC、Databricks SQL Connector、Statement Execution API 连接 SQL Warehouse；
- 事务型应用：标准 Postgres 驱动连接 Lakebase；
- Databricks Apps 内部集成可由平台注入资源和身份；
- 真正的外部应用需要自己处理 OAuth、连接池、令牌轮换、网络、重试和错误恢复。

来源：[Databricks SQL Connector for Python](https://docs.databricks.com/aws/en/dev-tools/python-sql-connector)、[Connect external app to Lakebase](https://docs.databricks.com/aws/en/oltp/projects/external-apps-connect)

## 5. 内嵌与外部使用的核心差异

| 场景 | 工作区内嵌体验 | 外部体验 | Databricks 的独特点 |
|---|---|---|---|
| 发现数据 | Catalog Explorer、搜索、自动上下文 | API、SQL metadata、客户端工具 | 同一 Catalog 对象贯穿 SQL、Pipeline、BI 和 Agent |
| 查询 | SQL Editor/Notebook 自动绑定计算 | 必须配置 warehouse/endpoint | 计算存储分离，外部仍走统一治理 |
| 数据工程 | UI 创建 Pipeline/Job，直接看运行图 | CLI/SDK/Bundle 适合 CI/CD | 同一资源既能 UI 操作也能 API 化 |
| 外部库 | UI 建 Connection/Foreign Catalog | SQL/API 建连接，认证责任更高 | 不搬数据也能纳入 Catalog 权限与发现 |
| 数据共享 | UI 配置 Share/Recipient | 开放协议客户端消费 | 接收方不一定使用 Databricks |
| OLTP | Lakebase UI、Apps 资源绑定 | 标准 Postgres 驱动 + OAuth 轮换 | 分析表可同步到 Postgres，应用状态可再回到湖 |

## 6. 演示中必须避免的误导

- 不把 Lakehouse Federation 说成数据已经摄取到 Delta；
- 不把 Lakebase 说成分析仓库或 Spark 的替代；
- 不把 Bronze/Silver/Gold 说成强制产品对象；
- 不把 `samples.tpch` 的规模描述成当前查询扫描量；样例 Catalog 可以使用抽样、共享或优化存储；
- 不因 Free Edition 演示成功就推断生产 SLA、安全和网络能力已经验证；
- 不把 UI 中一键完成的操作描述为外部应用无需认证、配额和错误处理。

## 7. 本工作区的真实高频链路

```text
14 个固定种子 CSV
        │ Files API
        ▼
workspace.dbx_demo_20260814.seed_files（managed Volume）
        │ read_files + CREATE TABLE AS SELECT
        ▼
14 个 Delta managed tables / 18,498 行
        │ SQL 关联与业务定义
        ├───────────────┬──────────────────┐
        ▼               ▼                  ▼
after_sales_cases   daily_sales   dbops_incident_context
700 行              销售汇总       3 个事故真值
        │               │                  │
        └────── SQL Warehouse ─────────────┘
                    │
              SQL / Genie Agent
```

真实 UI 已确认：

- `Add data` 页面同时提供 Create/modify table、Upload files to a volume，以及 S3、Salesforce、SQL Server、SAP、ServiceNow、SharePoint 等连接器入口；
- Catalog Explorer 中 `orders` 类型为 `MANAGED`，并能看到到 `after_sales_cases` 和 `daily_sales` 的自动血缘；
- Jobs & Pipelines 页面把 `Ingestion pipeline`、`ETL pipeline` 和 `Job` 分开；本账号当前为空，没有为演示创建任务；
- Compute 页面显示一个 2X-Small Serverless Starter Warehouse，以及 Lakebase 入口；
- Warehouse 完成查询后已确认 `STOPPED`。

对应录屏：`M02`、`M05`、`M06`、`M07`，见 `videos/recordings/README.md`。

## 8. Lakehouse、Federation、Sharing、Lakebase 的决策边界

| 需要解决的问题 | 首选路径 | 关键代价/边界 | 本轮证据 |
|---|---|---|---|
| 反复分析外部源并保留历史 | Lakeflow Connect / CDC → Delta | 复制数据、连接器运维、延迟 | UI 入口 + 官方文档；未接真实源 |
| 临时访问不想复制的数据 | Lakehouse Federation | 远端性能/并发、通常只读 | 官方文档/外部视频；未建 Connection |
| 跨团队/组织交付数据产品 | Delta/Open Sharing | Recipient、资产与更新契约 | 官方文档；未建 Share |
| BI/分析 SQL | SQL Warehouse | Warehouse 配额、并发、成本 | 9/9 查询和 4 个 SQL 案例实测 |
| 应用低延迟 CRUD/事务 | Lakebase Postgres | 项目、分支、连接池、事务与备份职责 | 真实入口 + Free Edition 配额；未建项目 |
| 外部系统调用分析结果 | JDBC/ODBC/Connector/Statement API | OAuth、网络、重试、审计 | API 成功执行过可信 SQL |

截至 2026-08-16，官方将 Lakebase 描述为集成于平台的托管 Postgres，支持自动扩缩、分支、Unity Catalog 集成、标准 Postgres 客户端和 Data API。Free Edition 的额度是一个 scale-to-zero 项目。本项目没有创建它，因此只讲架构定位和入口，不宣称性能、事务或同步链路已实测。
