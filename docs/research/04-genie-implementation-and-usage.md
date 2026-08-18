# Genie Agent：实现原理、多种用法与演示手册

信息截止：2026-08-17  
状态：官方文档校准 + 本工作区实现/录屏持续验证

## 1. 先分清 Genie 家族

| 产品/模式 | 主要用户 | 解决的问题 | 本项目是否重点 |
|---|---|---|---|
| Genie Agent | 业务用户、数据分析师、领域专家 | 对一个受控业务域的数据自然语言问答 | **是，核心** |
| Chat mode | 日常单问、追问、较直接的 SQL 分析 | 选择相关语义和示例，生成 SQL、表格或图表 | **是** |
| Agent mode | 复杂、多步骤、需要多次 SQL 的分析 | 拆任务、迭代查询、形成结构化报告与引用 | **是** |
| Genie One | 普通业务用户的统一入口 | 路由到数据资产、Dashboard、App 或 Genie Agent | 只解释定位 |
| Genie Code | 数据工程师/开发者 | 生成、解释、优化和修复 Notebook、SQL、Pipeline、Dashboard | 只解释与 Genie Agent 的差异 |
| 通用自定义 Agent | 应用开发/平台团队 | 自选模型、检索、工具、状态、工作流和动作 | 仅作为外部组合边界 |

Genie Agent 的关键不是“用户不再需要 SQL”，而是由领域专家先把数据源、业务口径、示例、权限和正确性评测准备好，再把这套分析能力交给业务用户。

来源：[Genie Agents](https://docs.databricks.com/aws/en/genie-agents/)、[Genie Agents concepts](https://docs.databricks.com/aws/en/genie-agents/concepts)、[Use Genie Code](https://docs.databricks.com/aws/en/genie-code/use-genie-code)

## 2. 实现架构

```text
领域专家 Authoring Plane
  ├─ Sources：Unity Catalog tables/views/metric views/volumes(beta)
  ├─ Knowledge store：描述、同义词、Join、指标/过滤表达式
  ├─ Instructions：业务口径、回答格式、选表优先级、安全边界
  ├─ Examples / Trusted assets：示例 SQL、参数化 SQL、UC Functions
  └─ Benchmarks：问题 + Ground-truth SQL / Evaluation note
                         │
                         ▼
业务用户 Runtime Plane
  用户身份 → Agent 权限与数据权限 → 问题/历史上下文
                                      │
                   ┌──────────────────┴─────────────────┐
                   ▼                                    ▼
             Chat mode                            Agent mode
       相关上下文 → SQL → 结果             规划 → 多次 SQL/检索 → 报告
                   │                                    │
                   └──────── SQL Warehouse ─────────────┘
                                      │
                         表格 / 图表 / SQL / 引用 / 追问
                                      │
                                      ▼
治理与改进 Plane
  Monitor 对话/反馈/错误 → Review → Example/Trusted asset → Benchmark 回归
```

对应 SVG：`site/assets/diagrams/genie-implementation-architecture.svg`。

### 2.1 Sources

结构化主路径使用 Unity Catalog 中的 managed/external/foreign tables、views、metric views 和 materialized views。Genie 会利用表/列名称、描述、PK/FK、样例值和 Agent 自己的 Knowledge Store 来选择表和生成 SQL。

本项目实际绑定：

- 售后：`after_sales_cases`、`refunds`、`support_policies`；
- 数据库运维：`dbops_incident_context`、`runbooks`；
- 订单/客户：`orders`、`customers`。

当前官方还提供“Analyze files in volumes” Beta：Agent mode 可以在同一问题中结合结构化表与 Volume 中的 PDF、Word、PPT、图片等文件。该能力需要 Preview、AI Gateway、权限和文件限制，本工作区未开启，因此只作为扩展用法，不宣称实测。

来源：[Analyze files in volumes with a Genie Agent](https://docs.databricks.com/aws/en/genie-agents/volumes)

### 2.2 Knowledge Store 与 Instructions

两者不是同一件事：

- Knowledge Store 更适合描述、同义词、Join 关系和可复用 SQL expressions；
- General Instructions 更适合全局业务规则、选表顺序、日期/状态口径、输出语言和安全要求；
- 它们都只影响当前 Agent，不会反向修改 Unity Catalog 全局元数据。

本项目的关键指令：

- 中文回答并展示/描述实际只读 SQL；
- “未解决”=`ticket_status NOT IN ('resolved','closed')`；
- 售后、退款/政策、数据库事故分别优先使用指定视图/表；
- 未确认就回答“未知”；
- 退款、改订单、客户消息、工单状态、数据库修复必须人工审批；
- 不生成或执行变更 SQL。

### 2.3 Examples、Trusted Assets 与 Functions

| 类型 | 作用 | 是否直接保证答案 | 适用 |
|---|---|---|---|
| 普通 Example SQL | 给 Genie 一个“类似问题应该怎样查”的参考 | 不保证 | 常见 Join、过滤、窗口和业务口径 |
| 参数化 Example SQL | 让同一逻辑替换日期、区域、产品等参数 | Chat mode 精确复用时可标 Verified | 高频标准问法 |
| Unity Catalog SQL Function | 把复杂或敏感逻辑封装成可授权函数 | 被信任使用时可标 Verified | 统一指标、复杂规则、限制自由 SQL |
| Curated Example | 从一次真实回答审查后收录 | 作为后续上下文 | 把纠错结果变成可复用知识 |

本项目已把“负面、高优先级、未解决售后工单行动队列”真实 SQL 收录为一个 Curated Example。

来源：[Tune Genie Agent quality](https://docs.databricks.com/aws/en/genie-agents/tune-quality)

### 2.4 Benchmark 与 Monitor

Benchmark 是评测，不是训练材料。官方明确说明 Benchmark 问题和 SQL 不会进入 Genie 回答上下文；它们只用于判断配置调整前后是否退化。

两种评测模式：

- Chat mode：用 Genie SQL 结果与 Ground-truth SQL 的结果集比对；
- Agent mode：多步报告由 LLM judge 评分，可提供 Evaluation note 指定必须覆盖的事实。

Monitor 用于查看真实会话历史、状态、用户反馈和错误，再把经过人工审查的好答案转成 Example/Trusted Asset，并加入回归问题。

本项目已在 Agent mode 加入 3 个内嵌 Benchmark：

1. 未解决 P1 工单区域数量；
2. 退款总金额最高原因；
3. 三个数据库事故的根因与解决办法。

每个问题都有 Ground-truth SQL 和 Evaluation note。完整的外部 10 问题表仍保留，用于后续扩展到 10 条回归集。

### 2.4.1 2026-08-17 真实评测闭环

三次 Agent-mode 批量运行都保留在工作区中，不能只截取最好看的结果：

| 运行 | Accuracy | 结论 |
|---|---:|---|
| 09:53:59 | 33%（1/3） | P1 题通过；退款和 DBOps 的 Ground-truth SQL 使用了不存在的旧列名，属于评测真值错误，不应算成模型质量问题 |
| 10:18:59 | 33%（1/3） | 自动化脚本把新 SQL 插到 Monaco 编辑器旧 SQL 前，形成拼接 SQL；UI 虽提示更新成功，但实际查询解析失败 |
| 10:27:28 | 33%（1/3） | 真值 SQL 已真正修正；P1 通过，退款题事实正确但输出范围不合规，DBOps 出现评测器与可见回答矛盾 |

第三轮逐题解释：

- **P1 区域：通过。** 回答与两边 SQL 结果都为西南 3、华南 2、华北 1、东北 1；
- **所有状态退款：严格失败。** 回答的最高原因和金额正确，都是“与描述不符 / 80,135.35”，但 Agent 额外返回 Top 5 和 `refund_count`；评测器给出 `Extra Rows / Incomplete Output`，说明“事实正确”不等于“输出契约合规”；
- **三个数据库事故：需人工复核。** 可见报告和 SQL 都覆盖 INC-001/002/003 的根因与处置，但评测器标记 `Empty Result`。这与页面证据矛盾，不能把它直接归因于模型，也不能擅自改成通过。

这三类失败必须分别处理：真值/Schema 错误先修评测集，输出契约问题调 Instructions 或 Trusted Asset，评测器异常保留证据并人工复核。为得到 100% 而放宽问题或删除失败样本，会破坏 Benchmark 的意义。

### 2.4.2 同一 Agent 的真实业务问答

在非 Benchmark 的正常 Agent 会话中连续验证了三种用法：

1. 明确“所有状态”后询问退款最高原因：34.7 秒返回“与描述不符、80,135.35、51 笔”，并提供 `refunds` 数据源、详细排名和 Show code；
2. 询问三个数据库事故：26.4 秒返回 INC-001/002/003 的根因和处置，并明确系统只提供只读分析、不执行修复；
3. 继续追问自动化/审批边界：沿用会话上下文，把只读诊断、证据收集、建议/草稿与退款、配置变更、终止查询、删除数据等真实动作分开。

正常业务回答可用，并不推翻严格 Benchmark 的失败；两者分别回答“用户能否得到有用答案”和“输出是否满足预先定义的回归契约”。

来源：[Test and monitor a Genie Agent](https://docs.databricks.com/aws/en/genie/monitor)

## 3. 一次问题实际上怎样执行

1. 用户以自己的身份打开 Agent；
2. 平台检查用户是否可访问 Agent、底层 Unity Catalog 数据和必要能力；
3. Genie 从问题、当前会话历史、Agent Instructions、Knowledge Store、元数据、Examples/Functions 中筛选相关上下文；
4. Chat mode 通常生成一个或少量 SQL；Agent mode 先规划，再执行多次 SQL/检索；
5. SQL 在绑定的 SQL Warehouse 执行，Row Filter、Column Mask 等治理仍应生效；
6. Genie返回文字、表格、图表、引用和可展开 SQL；
7. 用户反馈进入 Monitor，领域专家决定是否修数据、修元数据、修指令或添加受信资产；
8. Benchmark 回归验证修改没有破坏原有问题。

不要把第 3 步描述为“把整个数据库发给模型”。系统会筛选相关元数据/上下文，实际数据查询仍通过 SQL Warehouse 和用户权限执行。

## 4. 多种使用方式

### 4.1 工作区内直接问答

适合业务用户自助分析：

- “哪个区域未解决 P1 工单最多？”
- “哪种退款原因总金额最高？”
- “VIP 与非 VIP 平均解决时间差多少？”
- “三个数据库事故各自的根因和 Runbook 是什么？”

独特点：身份、权限、Sources、Warehouse、SQL、图表和反馈都由工作区承接。

### 4.2 连续追问

同一会话可继续问：

- “只看 VIP 呢？”
- “按工单类别拆分。”
- “把结果画成柱状图。”
- “解释你使用了哪些过滤条件。”

追问会利用当前对话历史。Benchmark 则故意把每个问题作为新会话运行，避免历史信息污染测试。

### 4.3 Agent mode 深度分析

适合需要多次取数和综合判断的问题：

- 汇总售后队列，再关联退款、客户和政策；
- 对数据库事故分别检查告警、慢 SQL、变更和 Runbook；
- 输出结构化报告、证据表和建议，而不是只返回一张聚合表。

复杂并不等于允许写入。Agent mode 可以更深入地分析，但本项目仍禁止自动退款、自动发消息或自动修库。

### 4.4 Dashboard 与 Genie

可以从 AI/BI Dashboard 配合 Genie 做“看板回答固定问题、Genie 回答临时问题”。要注意：已有 Agent 被普通方式链接到 Dashboard 时，Dashboard filter 不一定自动传递进聊天；由 Dashboard 发布流程自动创建的 Agent 才按官方说明支持相应过滤体验。演示时不能默认两边上下文完全一致。

### 4.5 临时文件与 Volume 文件

- 用户可以在单次会话中上传本地 CSV/Excel，与 Agent 数据结合；
- Beta Volume 文件能力可让 Agent mode 检索 PDF/Word/PPT/图片；
- 文件权限仍按用户身份检查；
- 这不等于一个无限制企业知识库，需要关注文件数、大小、格式、区域和额外推理费用。

### 4.6 iframe 嵌入企业门户

管理员允许可信域后，可把 Genie 以 iframe 嵌入内部网站。最终用户仍要登录 Databricks，并且必须拥有 Agent 和底层数据权限；嵌入用户只能问问题，不能编辑 Agent 配置。

```html
<iframe
  src="<GENIE_AGENT_EMBED_URL>"
  allow="clipboard-write"
  width="100%"
  height="600">
</iframe>
```

来源：[Embed a Genie Agent in an external app](https://docs.databricks.com/aws/en/genie/embed)

### 4.7 Conversation API

适合外部聊天机器人、售后门户和普通程序化问答。当前文档仍保留旧的 `spaces` 路径命名：

```http
POST /api/2.0/genie/spaces/{space_id}/start-conversation
Authorization: Bearer <OAUTH_ACCESS_TOKEN>
Content-Type: application/json

{"content":"哪个区域未解决的 P1 工单最多？"}
```

调用方要管理 conversation/message ID、异步状态、超时、重试、限流、用户身份和结果渲染。本项目没有把实际 ID 或 Token 写入文件。

来源：[Use the Genie Spaces API](https://docs.databricks.com/aws/en/genie/conversation-api)

### 4.8 Agent mode API（Beta）

适合需要多步研究报告、计划和流式结果的外部应用。2026 文档使用新的 Agent API，并通过 SSE 返回事件：

```http
POST /api/2.0/genie/agents/{agent_id}/responses
Authorization: Bearer <OAUTH_ACCESS_TOKEN>
Accept: text/event-stream
```

它和普通 Conversation API 不是同一调用模式。实施前必须确认 Preview、区域和账号支持情况。

来源：[Agent mode APIs in Genie Agents](https://docs.databricks.com/aws/en/genie-agents/api)

### 4.9 作为多 Agent 系统的数据工具

```text
用户/工单/ChatOps
      │
      ▼
Supervisor / Router
      ├─ Genie：结构化数据分析
      ├─ Policy Tool：规则/文档证据
      ├─ Ticket Tool：创建工单草稿
      └─ Action Tool：退款/改订单/修库
                           │
                    人工审批 + 幂等 + 回滚
```

此时 Genie 应定位为“受治理的数据分析工具”，而不是拥有所有业务权限的超级 Agent。

## 5. 内嵌、iframe、API 与自定义 Agent 对比

| 维度 | 工作区内 Genie | iframe 嵌入 | Conversation/Agent API | 自定义 Agent + SQL Tool |
|---|---|---|---|---|
| 最快上线 | 最快 | 快 | 中 | 慢 |
| 用户界面 | Databricks 提供 | Genie UI 嵌入 | 自己实现 | 自己实现 |
| 身份 | 浏览器用户 | 仍需 Databricks 登录 | OAuth/服务身份/代表用户 | 完全由应用设计 |
| 业务语义 | 原生 Agent 配置 | 同一个 Agent | 同一个 Agent | 需自行构建或调用 Genie |
| SQL/图表 | 原生 | 原生 | 返回结构需自行渲染 | 自行实现 |
| 多步编排 | Agent mode | Agent mode | Agent mode API Beta | 最灵活 |
| 写动作 | 不应直接混入分析 | 外部系统另接 | 调用方加审批工具 | 调用方全责 |
| 运维责任 | Databricks 较多 | 双方 | 调用方更多 | 调用方最多 |

## 6. 推荐实施流程

```text
Gate 0：用例和动作边界
  → Gate 1：数据、口径、权限准备
  → Gate 2：最小 Agent（少量高质量 Sources）
  → Gate 3：Instructions / Knowledge / Examples
  → Gate 4：可信 SQL 与 20–50 个代表问题
  → Gate 5：Benchmark + 失败分类 + 回归阈值
  → Gate 6：小范围业务用户试用与 Monitor
  → Gate 7：iframe/API/多 Agent 集成
  → Gate 8：生产身份、审计、成本、SLA 与动作审批
```

最常见的失败不是“模型不够大”，而是：表太多、口径矛盾、Join 不明确、元数据贫乏、问题集不代表真实用户、服务身份权限过大，以及把分析回答直接接成不可逆写操作。

## 7. 本项目的长视频设计

### G1：业务用户与多种问法

- Agent About/Capabilities 与建议问题；
- Chat/Agent mode 区别；
- 售后聚合、退款原因、数据库事故三类问题；
- 表格、图表、Show code、追问；
- 说明写动作 Gate。

### G2：领域专家实现

- 7 Sources；
- Instructions；
- Curated Example；
- Monitor 对话历史；
- 3 个 Benchmark、Ground-truth SQL、Evaluation note 与批量评测。

### G3：内嵌与外部集成

- 工作区直接用；
- iframe；
- Conversation API；
- Agent mode API/SSE；
- 多 Agent 售后/运维架构；
- 身份、审计、重试和审批责任。

真实工作区录屏负责证明 G1/G2；G3 由 SVG、代码片段和本地讲解视频说明，避免把未实际调用的外部 Agent API冒充为已跑通。
