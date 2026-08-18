# 自然语言分析，以及内嵌与外部 Agent 的差异

信息截止：2026-08-16  
证据状态：`DOC_VERIFIED + GENIE_WORKSPACE_VERIFIED + RECORDED`

## 1. 本项目关注的不是通用聊天机器人

自然语言分析的目标是把业务问题转换成受权限约束、可查看 SQL、可验证结果的数据查询。它必须建立在结构化、受治理且有业务语义的数据之上。

Genie Agent（旧称 Genie Space）是面向特定业务域的自然语言数据接口。它的核心仍是 Unity Catalog 中的受治理数据、业务语义和 SQL；当前官方导航还增加了把 Unity Catalog Volume 附加到 Agent、分析其中非结构化文件的能力，因此不能再简单表述为“只支持结构化表”。本项目真实演示只使用结构化表/视图，没有把 PDF/Word 文件分析包装成已验证能力。

来源：[Genie Agents concepts](https://docs.databricks.com/aws/en/genie-agents/concepts)

## 2. 内嵌 Genie 的工作流程

```text
领域专家选择数据集
      │
      ├─ 表/列注释、PK/FK、Join 关系
      ├─ Knowledge Store 中的同义词和业务定义
      ├─ Instructions 与示例 SQL
      ├─ Trusted Assets
      └─ Benchmark 问题集
      ▼
业务用户提出自然语言问题
      ▼
Genie 生成只读 SQL → SQL Warehouse 执行
      ▼
结果表 / 图表 / 解释 / 追问
      ▼
反馈、错误样例、Benchmark → 领域专家继续改进
```

重要特点：

- 生成查询通常是只读 SQL；
- 用户仍按自己的 Unity Catalog 数据权限看到结果；
- Row Filter 和 Column Mask 会继续生效；
- Agent 作者配置 SQL Warehouse，业务用户不必单独获得 Warehouse 权限；
- Genie 可以展示生成 SQL，便于解释和核验；
- Benchmark 用于评估，不会自动成为回答上下文；
- 准确率依赖表/列描述、业务术语、Join、示例 SQL 和可信函数，而不只是模型大小。

## 3. 为什么 Metric View 很重要

Metric View 将收入、退款率、活跃客户等指标定义成可复用的语义对象，并可增加显示名、格式和同义词。这样 Dashboard、SQL 和 Genie 不必分别发明一套业务口径。

这也是一个需要实际演示的独特点：自然语言不是直接对着原始列名猜测，而是尽量利用治理层和语义层减少歧义。

来源：[Agent metadata in metric views](https://docs.databricks.com/aws/en/business-semantics/agent-metadata)、[Query metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views/query)

## 4. 外部应用或 Agent 使用 Genie

外部方式包括：

- Genie Conversations API；
- Databricks SDK 的 Genie 客户端；
- Databricks App 将 Genie Agent 声明为资源；
- 外部 Agent 把 Genie API 封装成一个数据分析工具。

外部调用不是获得“无限制的数据问答接口”。调用者仍需处理：

- OAuth 或服务身份；
- Genie Agent ID、会话 ID 和异步消息状态；
- 对 Genie Agent、底层数据和相关 Warehouse 的权限；
- 限流、超时、重试和错误展示；
- 用户身份传递与按用户过滤；
- SQL/结果审计、Prompt 注入和业务动作审批；
- 将结构化回答转成自己应用需要的 UI 或 JSON。

来源：[Use the Genie Spaces API](https://docs.databricks.com/aws/en/genie/conversation-api)、[Add a Genie Agent resource to a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/genie)

## 5. 内嵌与外部的差异

| 维度 | 工作区内 Genie | 外部应用/Agent 调用 |
|---|---|---|
| 上手 | 无代码 UI，数据与上下文可直接选择 | 需要 SDK/API、认证和会话代码 |
| 身份 | 浏览器用户身份，平台自动套用数据权限 | 要决定代表用户还是服务身份 |
| 展示 | 内置 SQL、表格、图表、反馈 | 调用者自行设计 UI、解释和失败降级 |
| 语义 | Agent 配置和 Catalog 元数据原生可见 | 复用同一个 Genie Agent，但要传递正确 Agent ID |
| 评估 | Author UI、Benchmark、反馈闭环 | 需把 API 轨迹和业务结果接入自己的测试体系 |
| 自动化 | 适合探索与人工分析 | 适合嵌入售后、运维、门户和多 Agent 流程 |
| 风险 | 用户能检查 SQL，动作范围偏分析 | 容易被误接成自动动作，必须增加审批和幂等边界 |

## 6. 四个必须验证的问题

1. 中文问题、中文元数据和英文列名混用时效果如何？
2. 没有业务描述时的回答，与增加描述、Metric View 和示例 SQL 后差异有多大？
3. 同一用户在 UI 与 API 中是否获得相同结果和权限行为？
4. 错误问题、歧义问题、无权限问题和不存在指标时，系统是澄清、拒绝、空结果还是生成错误 SQL？

## 7. 案例中的 Agent 边界

### 智能售后

Genie 负责订单、退款和客服统计等结构化分析。售后政策文档如果 Free Edition 不支持 Knowledge Assistant，则使用受控的政策表或 Databricks App 中的简单检索演示替代，并明确这不是 Knowledge Assistant 的生产验证。

### 数据库智能运维

Genie 负责指标、慢 SQL、告警、事件和变更记录的结构化分析。Runbook 可先放入结构化表进行可追溯查询。Agent 可以生成诊断建议或工单草稿，但真实修复命令必须经过人工确认；Free Edition 演示不得连接生产数据库。

## 8. 本工作区 Genie 实测

创建了一个新的演示 Genie Agent，并明确绑定 7 个 Unity Catalog 数据源：

- `after_sales_cases`；
- `refunds`；
- `support_policies`；
- `dbops_incident_context`；
- `runbooks`；
- `orders`；
- `customers`。

领域指令显式固化：

- 默认中文回答并展示或描述实际执行的只读 SQL；
- “未解决工单”定义为状态不属于 `resolved`、`closed`；
- 售后、退款/政策、数据库事故分别优先使用指定表/视图；
- 退款、改订单、发客户消息、变更工单状态和数据库修复都必须标记“需要人工审批”，不得生成或执行变更 SQL；
- 不能从已连接数据确认时回答“未知”，不猜测。

还把真实运行过的售后行动队列 SQL 接受为一个 Curated Example，问题为：

> 哪些负面、高优先级且未解决的售后工单应优先处理？

### 真实问答核对

问题：`哪个区域未解决的 P1 售后工单最多？请给出各区域数量，并说明使用的数据表。`

| 检查项 | 可信 SQL 基线 | Genie 实际回答 | 结果 |
|---|---|---|---|
| 西南 | 3 | 3 | PASS |
| 华南 | 2 | 2 | PASS |
| 东北 | 1 | 1 | PASS |
| 华北 | 1 | 1 | PASS |
| 数据源 | `after_sales_cases` | `after_sales_cases` | PASS |
| 解释性 | SQL 可见 | Show code 可展开生成 SQL | PASS |

Genie 用约 37 秒完成回答，并生成柱状图。`M09-genie-embedded-natural-language.mp4` 依次展示回答/图表、Show code、7 Sources、Instructions 和 Curated Examples。

## 9. “内嵌能力”与“外部 Agent 工具”的真正独特点

```text
内嵌 Genie
浏览器用户 → 工作区身份/权限 → Agent 语义配置 → Warehouse → SQL/图表/反馈

外部应用或 Agent
最终用户/服务身份 → OAuth → Conversation API → 异步轮询 → 结果/SQL
                                  │
                                  └→ 调用方自己负责 UI、重试、审计、审批和降级
```

内嵌的优势不是模型“更强”，而是平台已经把身份、Unity Catalog 权限、Warehouse、业务配置、SQL 展示、图表和反馈闭环接好。外部的优势是可组合进售后门户、ChatOps、多 Agent 和自动化流程，但调用方必须显式承担身份代理、限流、异步状态、错误恢复、追踪和动作安全。

截至 2026-08-16，官方文档已把产品导航更新为 Genie Agents，并注明 formerly known as Genie Spaces；但公开 Conversation API 路径仍使用 `/api/2.0/genie/spaces/{space_id}/...`。实现外部集成时应以当前 API 文档为准，不应凭 UI 新名称自行改 endpoint。

## 10. 案例流程与审批 Gate

### 智能售后

```text
自然语言问题
  → Genie/SQL 读取售后视图、退款、政策
  → 形成 18 条优先行动队列
  → 生成建议/消息/工单草稿
  → 人工审批 Gate
  → 外部售后系统执行退款、改订单、发消息或改状态
```

### 数据库智能运维

```text
指标 + 慢 SQL + 告警 + 变更 + 事故
  → dbops_incident_context 关联
  → Genie/SQL 总结根因与 Runbook
  → 生成诊断与工单草稿
  → 人工审批 + 幂等/权限/回滚检查
  → 运维工具执行实际修复
```

本轮只验证读取、分析、解释和草稿边界；没有连接生产数据库，也没有执行退款、订单、消息、工单或数据库变更。
