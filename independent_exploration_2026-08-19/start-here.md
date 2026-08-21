# 先看这页：这套研究究竟在解决什么问题

这套材料研究的不是“要不要再做一个聊天框”，而是一个更具体的问题：

> 当业务负责人问“最近 30 天华东退款率为什么上升”，产品能否在权限范围内找到正确数据、使用一致口径、完成分析，并把事实、推断和缺失证据讲清楚？

## 用一条客户任务理解目标产品

假设经营负责人发现退款率上升。今天，这个问题往往要经过业务、数据和数据库团队：找表、确认指标、申请权限、写 SQL、排查坏数、比较人群，再把结论整理成报告。只要其中一个环节断掉，回答就可能慢、不可复算，或者看起来合理却无法核验。

本文讨论的目标产品希望把这条任务接起来：

1. 用户直接说出问题，不必先判断该打开哪个产品；
2. 产品识别所需数据、指标、时间范围和当前用户权限；
3. 口径或数据有歧义时先追问，数据缺失时明确停止或保留 `Unknown`；
4. 产品执行受控查询和分析，返回表、图、SQL、口径、数据来源与可复算结果；
5. 如果问题涉及数据库异常，继续引用实例状态、SQL、执行计划和变更证据，但不把相关性冒充根因；
6. 如果用户要求执行动作，先给出影响和审批卡；未经授权不执行，执行后由权威系统验证结果。

用户购买的是这条完整任务，而不是 `Harness`、`MCP`、状态机或一组内部模块。那些技术只负责让任务可执行、可审计和可替换。

## 研究现在得出了什么

- **可以确认：** 华为云、Databricks 和其他云厂商都已经公开了数据接入、问数、语义治理、Agent、数据库诊断或工具调用中的一部分能力。
- **可以确认：** Databricks 的公开优势不只是问答界面，而是数据、语义、权限、查询、评测和外部调用之间的对象连续性。
- **仍需验证：** 华为云现有产品能否共享资源 ID、最终用户身份、语义、任务状态、证据与发布生命周期。
- **当前建议：** 先用一条合成数据任务验证端到端闭环，再决定由公司级产品协作承载，还是由数据库团队先做低依赖版本。

这里的“建议”是产品设计输入，不是华为云现状、立项决定或交付承诺。

## 文中常见术语分别是什么

| 术语 | 身份 | 在本文中的白话含义 |
|---|---|---|
| Data Intelligence / 数据智能 | 建议产品工作名 | 让用户用自然语言完成数据接入、问数、分析、知识、治理和数据库调查的一组能力 |
| DataArts Intelligence | 建议产品名 | 假设由 DataArts 相关团队共同承载时使用的名称，不是已确认的正式产品名 |
| Database Intelligence / 数据库智能 | 建议产品名 | 假设由数据库团队先做端到端版本时使用的名称，不是已确认的正式产品名 |
| C0–C7 | 本文定义 | 为讨论优先级而建立的八类能力编号，不是行业标准或现有产品菜单 |
| 五个平面 | 本文分析框架 | 用体验、上下文、策略、执行和保证五个方面比较产品，不是厂商官方架构 |
| Harness | 行业常用技术类别 | Agent 的执行框架；负责运行任务，但不是客户购买的功能 |
| Goal Contract | 本文定义 | 一次任务要完成什么、哪些边界不能越过、怎样算成功的机器可读约定 |
| CLI / MCP / API | 行业接口形式 | 供程序和外部 Agent 调用能力的接口；它们不是面向业务人员的产品入口 |
| Artifact / Evidence | 本文执行合同术语 | 任务产生的可继续使用结果，以及支持结论、状态和动作的证据 |
| Gate | 本研究的验证关口 | 必须拿到指定证据才能继续立项、选型或开放能力的检查点 |
| OBO | 行业身份术语 | `on behalf of`，表示系统以最终用户身份访问数据，而不是用一个共享高权限账号代替所有人 |
| Verified Query / 可信查询 | 厂商术语或通用描述 | 已由人或规则确认口径的查询样例，用来减少开放式生成 SQL 的偏差 |

## 按你的问题选择阅读入口

| 你想回答的问题 | 先读 | 需要证据时再读 |
|---|---|---|
| DataArts 和 Databricks 到底差在哪 | [`independent-findings.md`](./independent-findings.md) | [`evidence-ledger.md`](./evidence-ledger.md) |
| 自然语言 Agent 会不会成为主入口 | [`agent-entry-governance-visual-report.html`](./agent-entry-governance-visual-report.html) | [`agent-entry-governance-deep-dive.md`](./agent-entry-governance-deep-dive.md) |
| 产品实际会怎样回答用户 | [`huawei-product-ui-prototypes.html`](./huawei-product-ui-prototypes.html) | [`huawei-catch-up-plan.html`](./huawei-catch-up-plan.html) |
| 两种建设方案如何选择 | [`huawei-catch-up-plan.html`](./huawei-catch-up-plan.html) | [`huawei-catch-up-product-plan.md`](./huawei-catch-up-product-plan.md) |
| 哪些结论还不能成立 | [`unknowns-and-validation.md`](./unknowns-and-validation.md) | 两份 evidence ledger |
| 想逐项核对 11 家厂商 | [`vendor-entry-atlas.html`](./vendor-entry-atlas.html) | [`agent-entry-evidence-ledger.md`](./agent-entry-evidence-ledger.md) |

## 阅读时需要记住的边界

- 研究基准日和公开资料核验日为 2026-08-19；产品方案基准日为 2026-08-20。
- 事实只来自本轮重新访问的公开官方资料和无需登录的只读页面。
- 本轮没有开通、购买、修改或连接任何云资源，也没有厂商账号级控制台验证。
- HTML 中的华为产品画面使用合成数据，是设计原型，不是现网截图。
- 精确评分是研究者按公开证据形成的比较工具，不是厂商实测成绩；立项前仍需执行验证 Gate。
