# 真实工作区验证记录

信息截止：2026-08-17（数据与 Genie 核心操作执行于 2026-08-14；Genie 深度评测与长录屏补充于 2026-08-17）  
证据状态：`WORKSPACE_VERIFIED + GENIE_VERIFIED + RECORDED`  
隐私状态：邮箱、用户 ID、Workspace ID、Warehouse ID、Catalog 私有名称、OAuth code 和 Token 均未记录

## 1. 可用性结论

该 AWS Databricks 工作区真实可用，不只是登录页可达：

- OAuth U2M 身份验证成功，身份为 Active；
- Unity Catalog API 可访问；
- SQL Warehouse 可以从停止状态启动并执行 SQL；
- `samples.nyctaxi.trips` 可查询；
- Files API 可以向 Unity Catalog managed Volume 上传文件；
- SQL Warehouse 可以从 Volume 读取 CSV 并创建 Delta managed tables；
- 完成验证后 Warehouse 可以恢复到 `STOPPED`。

UI 左上角直接显示 `Databricks Free Edition`，因此版本已经明确确认，不再是特征推断。官方当前限制与实测一致：Serverless-only、一个最大 2X-Small 的 SQL Warehouse、受配额约束的 Jobs/Lakeflow/Apps/Lakebase 等能力。

## 2. 第一轮只读能力清单

| 对象 | 真实结果 |
|---|---|
| 身份 | HTTP 200，Active；未记录身份值 |
| Catalog | 3 个；包含 `samples`、`system` 和 1 个非标准 Catalog |
| SQL Warehouse | 1 个；`2X-Small`、`PRO`、初始 `STOPPED` |
| Genie Agent/Space | 初始 1 个与本项目无关；随后通过 UI 新建本项目 Agent |
| Traditional Cluster | 0 |
| Jobs | 0 |
| Pipelines | 0 |
| Apps | 0 |
| Workspace 根目录 | 3 个 Directory |
| Lakebase | Compute 中入口可见，并提示迁移到 Lakebase Postgres 新首页；未创建 Project/Instance |

## 3. 样例 SQL 验证

执行语句：

```sql
SELECT COUNT(*) AS trip_count
FROM samples.nyctaxi.trips;
```

结果：

- Statement Execution API：HTTP 200；
- Query state：`SUCCEEDED`；
- `trip_count=21932`；
- Warehouse 状态：`STOPPED → STARTING → RUNNING → STOPPED`；
- 无数据写入。

## 4. 合成数据灌入

目标对象：

- Schema：`dbx_demo_20260814`；
- Managed Volume：`seed_files`；
- Delta managed tables：14；
- Views：3。

结果：

| 指标 | 结果 |
|---|---:|
| 上传文件 | 14 |
| 上传字节 | 1,221,837 |
| Delta 表 | 14 |
| Delta 表总行数 | 18,498 |
| 本地/远端行数核对 | PASS |
| 业务视图 | 3 |
| `after_sales_cases` | 700 行 |
| `dbops_incident_context` | 3 行 |
| 回滚 | 未触发 |
| 最终 Warehouse 状态 | STOPPED |

表清单：

- 售后域：`customers`、`products`、`orders`、`order_items`、`refunds`、`support_tickets`、`support_policies`；
- 数据库运维域：`db_instances`、`db_metrics`、`slow_queries`、`alerts`、`changes`、`incidents`、`runbooks`；
- 视图：`after_sales_cases`、`daily_sales`、`dbops_incident_context`。

## 5. 安全边界

- 仅上传固定种子生成的合成数据；
- 邮箱使用 `example.invalid`，主机使用 `.invalid`；
- 所有创建对象位于新建的独立 Schema；
- 写入脚本在发现同名 Schema 已存在时会拒绝覆盖；
- 中途失败只允许 `DROP` 本轮刚创建的 Schema，不操作用户既有对象；
- Token 仅存在于运行进程内，未写入 `.databrickscfg` 或 token cache；
- 每次由脚本启动的 Warehouse 都在结束后主动停止。

## 6. 真实 UI 与录屏结果

| ID | UI 证据 | 结果 |
|---|---|---|
| M01 | Home + New 菜单 | Free Edition 标签；数据、Notebook、Query、Dashboard、Genie Agent、Metric View、Job、ETL Pipeline、App 等入口 |
| M02 | Catalog Explorer | `dbx_demo_20260814`、orders=MANAGED、Details、到售后/销售视图的自动 Lineage |
| M05 | Data Ingestion | 文件/Volume 与对象存储、数据库、SaaS Connector 入口 |
| M06 | Jobs & Pipelines | Ingestion pipeline、ETL pipeline、Job 三类入口；当前无已有资源 |
| M07/M10 | Compute | 2X-Small Serverless Starter Warehouse；Lakebase 入口；未创建实例 |
| M09 | Genie Agent | 中文问题、正确答案/图表、Show code、7 Sources、Instructions、1 Curated Example |
| C2 | SQL Editor | 可信自然语言问题基线，结果西南 3、华南 2、东北 1、华北 1 |
| C3 | SQL Editor | 18 条售后行动队列和写动作审批边界 |
| C4 | SQL Editor | 3 个数据库事故根因/Runbook 上下文和修复审批边界 |

所有录屏均为真实工作区、1440×758 左右、H.264、4 fps、内嵌中文字幕；无音轨。账号头像已模糊，邮箱和 UUID 自动替换。完整文件、时长和 SHA-256 见 `videos/recordings/README.md`。

## 7. 集中评测结果

一次内存态 OAuth 长会话完成了下列操作：

- 创建 `genie_benchmark_questions` Delta 表，保存 10 个可信问题和审批边界；
- `DESCRIBE DETAIL orders` 成功；
- `DESCRIBE HISTORY orders` 返回 2 条历史记录；
- 9/9 个业务与数据库运维基线查询成功；
- 在用户个人 Workspace 中导入 10 单元 SQL 演示 Notebook；
- 注册对象总数为 18：14 个基础表、3 个视图、1 个基准表。

可信答案摘要：

| 问题 | 真实结果 |
|---|---|
| 工单总数 | 700 |
| 未解决 P1 工单最多区域 | 西南 3；华南 2；东北 1；华北 1 |
| 退款总额最高原因 | 与描述不符：80,135.35 |
| VIP 平均解决时间 | 2,041.64 分钟，28 条有效样本 |
| 非 VIP 平均解决时间 | 1,729.10 分钟，502 条有效样本 |
| 最近有订单日期/渠道 | 2026-08-01；partner；1 单；931.83 |
| 负面 P1/P2 未解决工作队列 | 18 |
| 数据库事故 | 3 |

其他初始实际资源：

- AI/BI Dashboard：0；
- Unity Catalog Connection：0；
- Delta Sharing Share：0；
- Database Instance：0；
- Genie Space：1，但初始列表内容没有引用 `dbx_demo_20260814`。

## 8. Genie Agent 配置与实测

通过 UI 新建并配置了一个明确绑定本项目数据的 Genie Agent：

- 7 个 Sources：`after_sales_cases`、`refunds`、`support_policies`、`dbops_incident_context`、`runbooks`、`orders`、`customers`；
- 中文业务指令：未解决口径、表选择优先级、未知处理、只读 SQL、所有业务/运维写动作需要人工审批；
- 1 个 Curated Example：真实运行过的售后优先行动队列 SQL；
- 问题：哪个区域未解决的 P1 售后工单最多，并说明数据表；
- 结果：西南 3、华南 2、东北 1、华北 1，使用 `after_sales_cases`；
- 与可信 SQL 基线完全一致；
- UI 可展开生成 SQL并生成柱状图。

2026-08-17 深化验证：

- 在真实 Agent 中加入 3 个 Agent-mode Benchmarks（P1 区域、所有状态退款、三个数据库事故），每题含 Ground-truth SQL 和 Evaluation note；
- 三次批量运行均保留，最终有效运行是 10:27:28，Accuracy=33%（1/3）；
- P1 题通过；退款题事实正确但因额外行/列不满足严格输出契约；DBOps 可见答案完整却被评测器标成 `Empty Result`，保留为人工复核；
- 正常 Agent 会话成功回答所有状态退款（80,135.35）、三个事故及后续审批边界问题；
- 新增 Genie 实现架构、多入口对比 SVG，以及 G1 业务使用、G2 配置评测、G3 外部集成架构三段长视频。

## 9. 最终资源与边界

- Starter SQL Warehouse：2026-08-16 清理脚本返回 `STOPPED / already_stopped`；
- OAuth broker/socket：已到期退出，不再运行；
- Job/Pipeline/Dashboard/App/Lakebase Project/Share/Connection：没有为本演示创建；
- 合成数据 Schema 与 Genie Agent 保留，便于用户后续演示；清理 SQL 见 `sql/99-cleanup-demo.sql`；
- Free Edition 不提供生产 SLA，不能从本轮推导企业级性能、容量、私网、合规或真实数据安全结论。
