# Databricks 工作区访问审计

检查时间：2026-08-14T14:48:51+08:00  
检查方式：未认证、只读网络探测；官方 CLI OAuth 挑战  
数据写入：无

## 隐私处理

- 用户提供的 URL 已规范化为不含查询参数的工作区根域名。
- 邮箱、`autoLogin` 参数、组织查询参数没有写入项目文件。
- 没有要求或保存 Google 密码、Cookie、浏览器存储、PAT 或 OAuth 授权码。

## 已验证

- 主机名形态为 AWS Databricks 工作区。
- DNS 解析成功。
- TLS 证书校验成功，`ssl_verify_result=0`。
- 未认证访问工作区入口返回 HTTP 303 登录流程。
- 未认证访问 SQL Warehouses API 返回 HTTP 401，符合受保护 API 的预期行为。
- 登录页标题为 `Databricks - Sign In`。
- 官方 Databricks CLI v1.12.1 已安装到项目隔离目录。
- CLI 发布压缩包通过官方 `SHA256SUMS` 校验。
- CLI 可生成标准 OAuth U2M 浏览器挑战，回调地址为本机 `localhost:8020`。
- 本轮等待期间没有收到浏览器回调；挑战随后被主动终止。

## 尚未验证

- 账号是否为 Free Edition、Free Trial 或付费工作区。
- Workspace ID、区域和 metastore。
- `samples` Catalog、SQL Warehouse、Notebook、Genie、Lakeflow、Apps 和 Lakebase 的实际可见性。
- OAuth 身份授权是否完成。

## 当前边界

CLI OAuth 回调监听在运行终端所在主机的 `localhost`。只有同一台主机上的浏览器，或由用户主动建立的安全端口转发，才能把浏览器授权结果送回 CLI。不得要求用户在聊天中粘贴授权码或 Token。

## 凭据存储复核与清理

- 当前 Linux 环境没有可用的系统密钥环，CLI 在发起挑战前自动创建了 `auth_storage=plaintext` 配置骨架。
- 缓存结构中的令牌条目数为 0；没有 access token 或 refresh token。
- 已终止 OAuth 进程，并确认 8020–8040 范围没有残留 OAuth 监听器。
- 本次尝试新建的空 `.databrickscfg` 与空 token cache 文件已删除，复核结果均为 absent。
- 在获得用户明确选择的安全远程授权方案前，不再发起会降级到明文存储的 CLI 登录。
