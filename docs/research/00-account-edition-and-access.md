# 账号版本、访问方式与演示边界

信息截止：2026-08-16  
证据状态：`DOC_VERIFIED + WORKSPACE_VERIFIED + RECORDED`

## 结论摘要

这是一个真实可用的 AWS Databricks Free Edition 工作区，UI 左上角已经直接显示 `Databricks Free Edition`。它适合学习、个人原型和本项目的合成数据演示，但不应包装成生产环境验证，也不应上传企业专有数据。

账号的实际对象与官方 Free Edition 限制一致：一个 2X-Small Serverless Starter SQL Warehouse、Serverless-only、一个 workspace/metastore，以及可见但受配额约束的 Jobs、Lakeflow、Apps、Genie 和 Lakebase 入口。

## 官方已确认事实

### Free Edition 的定位

- 面向学习、教学、个人探索和原型，不是带 SLA 的商业生产环境。
- 只提供 Serverless 计算，不能自定义经典集群配置。
- 一个工作区、一个 metastore；没有 Account Console 和账号级 API。
- 登录方式限于邮件验证码、Google 或 Microsoft；不支持 SSO 和 SCIM。
- 一个最大为 2X-Small 的 SQL Warehouse。
- Notebook 计算、Jobs、Lakeflow Pipelines、Model Serving 和 AI Search 都有额度或数量限制。
- 最多三个 Databricks Apps；App 闲置到规定时间会自动停止，但可以重新启动。
- 一个带 scale-to-zero 的 Lakebase 项目。
- 不支持 Knowledge Assistant、Clean Rooms、Online Tables 和部分企业管理能力。
- 可能因日/月公平使用额度耗尽而暂时停止计算，但数据和设置不会因此被删除。
- Free Edition 条款面向非商业用途；官方比较页还提示不应把它当作存放企业专有 POC 数据的环境。

来源：

- [Databricks Free Edition limitations](https://docs.databricks.com/aws/en/getting-started/free-edition-limitations)
- [Sign up for Databricks Free Edition](https://docs.databricks.com/aws/en/getting-started/free-edition)
- [Free trial 与 Free Edition 对比](https://docs.databricks.com/aws/en/getting-started/free-trial-vs-free-edition)

### 没有自有数据不等于无法演示

每个工作区可使用只读 `samples` Catalog。当前官方列出的样例包括：

- `samples.nyctaxi.trips`：纽约出租车行程；
- `samples.tpcds_sf1`：约 1 GB 的 TPC-DS 数据；
- `samples.tpch`：TPC-H 数据；
- `samples.wanderbricks`：模拟旅行预订平台，包含用户、住宿、预订和评论；
- `samples.databricks.datasets` Volume：用于数据管道的文件样例。

因此，第一轮真实验证可以保持只读：Catalog Explorer 浏览对象、SQL Editor 查询、Notebook 展示 DataFrame、导入样例 Dashboard。`samples` Catalog 本身只读，后续需要修改、建语义层或制造售后/运维场景时，再把必要的子集复制到自有 Schema 或生成合成表。

来源：

- [Sample datasets](https://docs.databricks.com/aws/en/discover/databricks-datasets)
- [Sample dashboards](https://docs.databricks.com/aws/en/sql/get-started/sample-dashboards)

## 外部自动化访问

Databricks 推荐外部交互式工具使用 OAuth User-to-Machine：

```bash
databricks auth login --host <workspace-url>
```

浏览器完成授权后，CLI 管理短期访问令牌。CLI 本身是 REST API 的包装层，SDK、Terraform、Bundles 和其他支持统一认证的工具可以复用相同认证配置。

来源：

- [Authentication for the Databricks CLI](https://docs.databricks.com/gcp/en/dev-tools/cli/authentication)
- [Authorize user access with OAuth](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-u2m)
- [Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/)

## 实际访问与安全实现

### 已完成

- 初始公开端点检查确认 DNS/TLS 正常、未认证 API 返回 401；
- 用户在临时 Playwright Chromium 中完成一次 Google 登录；
- 通过本机 CDP 复用同一浏览器会话完成 UI 导航与录屏；
- OAuth U2M/PKCE Token 只驻留于短时进程内存，没有写入项目、`.databrickscfg` 或持久 Token cache；
- 一次性 OAuth broker/socket 已过期并退出；
- 录屏时自动替换邮箱和 UUID，并模糊账号/头像控件；
- 私有 Workspace URL 只保留规范化主机，原始查询参数没有进入交付物；
- Free Edition 的 LinkedIn “real person”提示选择 `Not now`，没有增加第三方账号连接。

详细前置证据见 `evidence/workspace/2026-08-14-access-audit.md`；真实结果见 `docs/research/03-live-workspace-validation.md`。

### 会话边界

Databricks UI 顶部可能显示 `Verify identity`，Free Edition 还可能弹出 “Verify you're a real person / Verify on LinkedIn”。本轮确认后者可安全选择 `Not now`，不影响 Jobs/Pipelines 等页面。它不等于必须再授予 Google OAuth，也不应由自动化反复点击。

### 账号与数据边界

- Free Edition 官方定位是个人学习和非商业实验；无 SLA、支持或可靠性保证；
- 仅 Serverless，SQL Warehouse 限一个且最大 2X-Small；
- 一个带 scale-to-zero 的 Lakebase 项目是额度上限，不代表已经创建或验证；
- 官方比较页明确把 Free Edition 与可放企业专有 POC 数据的商业试用区分开；
- 因此本项目只使用 `samples` 和 `.invalid` 保留域的确定性合成数据。

## 本轮验证顺序（已执行）

1. 规范化 URL、识别 AWS 与 UI 版本标签；
2. 建立一次用户授权的临时浏览器和内存态 OAuth；
3. 先只读检查 Catalog、Warehouse、Jobs、Pipelines、Apps、Genie 与 Lakebase 入口；
4. 查询 `samples.nyctaxi.trips`，确认 21,932 行；
5. 只在独立 `dbx_demo_20260814` Schema 写入合成数据；
6. 运行 9/9 可信基线查询并导入演示 Notebook；
7. 创建和配置 Genie Agent，核对中文回答与生成 SQL；
8. 完成隐私清洗录屏；
9. 验证 Starter SQL Warehouse 为 `STOPPED`。
