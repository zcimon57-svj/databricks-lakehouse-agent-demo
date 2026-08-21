# 数据智能与数据库 Agent 产品决策 Brief（V2）

> 状态：当前总目标与展示契约
> 日期：2026-08-20
> 关系：本文件是后续研究与汇报的总契约；[`00-project-brief.md`](00-project-brief.md) 保留为 Databricks 实测与演示交付的 Phase 1 记录，不被覆盖。

## 1. 一句话目标

通过真实 Databricks 演示、跨厂商产品旅程比较和华为云端到端验证，识别数据智能产品的新市场基线、华为跨产品接缝及数据库不可替代责任，支撑产品归属、投资范围和落地路线决策。

这不是“照抄 Databricks 功能清单”，也不是预先决定由数据库团队、DataArts 或 AgentArts 单独建设。当前要先把可证明的事实、产品假设和关键未知项分开，再用验证 Gate 决定组织与产品边界。

## 2. 三条研究线

| 研究线 | 回答的问题 | 当前材料 | 证据边界 |
|---|---|---|---|
| A. Databricks 真实演示 | 领先产品如何把数据、语义、分析、Agent 和外部入口串成用户旅程 | 工作区实测、合成数据、SQL、14 段有声录屏、Genie 专题 | Free Edition 快照；不是商业版 SLA、容量或外部 API 生产验证 |
| B. 市场基线 | 竞争焦点已经移动到哪里，哪些能力成为共同基线 | 11 家厂商、67 项能力、10 个维度、官方资料证据账本和可视报告 | 公开资料研究；评分是分析模型，不是权威基准或采购结论 |
| C. 华为产品决策 | 差距发生在哪些产品接缝，谁应拥有入口、对象、策略、执行和证据 | DataArts / AgentArts / RDS / DAS 等公开资料、四种归属选项、未知项与验证 Gate | 尚未完成目标账号、跨产品、真实租户和客户工作流验证 |

## 3. 当前可用结论

### 3.1 已有证据支持的判断

1. 数据智能竞争已不只是“自然语言生成 SQL”，而是从意图进入，到受治理执行，再到可复算工件、评测、审计和外部工具调用的完整任务闭环。
2. 市场基线可以用五个平面描述：体验、上下文、策略、执行、保障。单独的聊天入口、Catalog、NL2SQL 或数据库诊断都不足以形成闭环。
3. Databricks 的领先样本价值主要在对象连续性：同一套治理对象和语义能够进入 SQL、Metric View、Genie、Dashboard、API 与评测，而不只是拥有更多孤立模块。
4. 华为云公开产品组合已经覆盖数据集成、治理、BI、数据库、Agent 编排等多类能力；当前最需要验证的是跨产品连续性，而不是简单统计“有没有模块”。
5. 对数据库产品而言，不可替代的责任是安全执行、引擎上下文、实时诊断、负载保护、动作控制和可验证结果；这不等于应由数据库团队重建完整 BI、治理与通用 Agent 平台。

### 3.2 当前方案假设

当前优先验证“双平面、一条客户旅程”：

- DataArts / BI 平面拥有数据资产、业务语义、分析工件与领域治理；
- 数据库执行平面拥有只读查询、诊断、负载保护和高风险动作；
- AgentArts 或统一会话壳负责编排与多工具协作；
- 共享控制面提供 canonical ID、on-behalf-of 身份、策略判定、任务/工件/动作状态、Trace、Eval、Audit 和 Cost。

这只是待验证的产品架构假设，不是现网能力声明，也不预设最终组织归属。

## 4. 领导需要做的当前决策

当前不请求直接批准固定“90 天产品建设”，而是请求批准一轮有停止条件的联合验证，产出组织与产品归属所需的证据：

| Gate | 要验证的核心问题 | 必须拿到的判定证据 |
|---|---|---|
| G1 对象连续性 | DataArts、AgentArts、RDS/DAS 是否能引用同一资产、语义、会话与工件 | 跨产品对象映射、稳定 ID、版本和深链实测 |
| G2 身份与权限 | 最终用户身份能否 on-behalf-of 传递，策略能否在执行端强制 | 正向/越权用例、审计记录、服务身份与用户身份边界 |
| G3 语义与正确性 | 指标、Join、时间、状态等口径能否复用并被回归验证 | Golden Questions、严格结果比对、语义变更影响证据 |
| G4 工具与动作 | 内嵌入口和外部 Agent 是否共用同一能力合同 | API/Tool 契约、异步状态、幂等、预演、审批和验证链 |
| G5 运营与保障 | 是否具备端到端 Trace、Eval、Audit、Cost 和失败恢复 | 一条真实任务的共享 Trace、评测集、故障注入与恢复记录 |
| G6 商业与组织 | 客户是否为完整工作流付费，哪个团队适合承担产品责任 | 设计伙伴访谈、场景基线、WTP/采购路径、RACI 与成本模型 |

任一 Gate 未通过，都应缩小或调整产品边界，而不是用演示效果替代证据。

## 5. 需要持续讲清的业务故事

1. **经营分析与追问**：业务负责人从一个问题进入，得到受治理指标、证据 SQL、可保存工件，并继续发布到看板或触发后续任务。
2. **智能售后**：客服联查订单、退款、客户与工单，形成可引用的证据包；退款、改订单、发消息由独立动作工具审批执行。
3. **数据库风险与业务影响**：应用负责人从“为什么结算变慢”进入，关联业务指标、慢 SQL、告警、变更和拓扑；建议可自动生成，修复动作必须预演、审批与验证。
4. **SaaS/伙伴内嵌**：外部产品通过统一 Tool/API 复用数据语义、最终用户权限、任务状态和证据，而不是获得共享高权限数据库连接。

每个故事都要同时展示业务结果、数据对象、身份策略、执行路径、工件、证据和动作边界。

## 6. 展示层契约

主页只展示领导决策需要的最小信息：

1. 一屏结论；
2. 三类证据；
3. 五平面市场基线；
4. 华为跨产品接缝；
5. 四种产品归属选项与当前待验证假设；
6. G1–G6 决策 Gate；
7. 三个业务故事；
8. Databricks 实测与精选录屏；
9. 证据边界与详细研究入口。

67×11 能力矩阵、完整证据账本、评分细节、产品原型和历史方案不堆在主页；它们通过子页面展开，并始终标明“公开事实 / 分析推断 / 方案假设 / 待验证”。

## 7. 关键入口

- [`../independent_exploration_2026-08-19/independent-findings.md`](../independent_exploration_2026-08-19/independent-findings.md)：独立研究综合结论
- [`../independent_exploration_2026-08-19/agent-entry-governance-deep-dive.md`](../independent_exploration_2026-08-19/agent-entry-governance-deep-dive.md)：Agent 入口、治理和共享控制面深挖
- [`../independent_exploration_2026-08-19/unknowns-and-validation.md`](../independent_exploration_2026-08-19/unknowns-and-validation.md)：未知项和验证计划
- [`../independent_exploration_2026-08-19/vendor-entry-atlas.html`](../independent_exploration_2026-08-19/vendor-entry-atlas.html)：11 家厂商入口旅程图谱
- [`../independent_exploration_2026-08-19/agent-entry-governance-visual-report.html`](../independent_exploration_2026-08-19/agent-entry-governance-visual-report.html)：领导可视化研究报告
- [`research/03-live-workspace-validation.md`](research/03-live-workspace-validation.md)：Databricks 工作区实测
- [`research/04-genie-implementation-and-usage.md`](research/04-genie-implementation-and-usage.md)：Genie 实现与使用方式

## 8. 历史材料处理

早期“华为云 RDS 受治理智能层 / 90 天 MVP”页面、SVG、H1 录屏和研究稿保留为 Phase 1 方案记录。独立调研已经说明，固定的双引擎范围、五个新增服务和 90 天建设承诺不能作为当前决策前提；新页面必须把它们标为历史方案，并以 G1–G6 验证结果作为后续路线输入。
