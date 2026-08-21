# DataArts、Databricks 与云上数据智能产品独立探索

## 先从一个客户问题开始

> “最近 30 天华东退款率为什么上升？告诉我哪些是事实，哪些还只是推断。”

这套研究关心的不是谁先做出聊天框，而是谁能把这句话变成一条可信任务：找到用户有权访问的数据，确认退款率口径，完成查询和分析，返回表、图、SQL 与证据；数据不够时明确说明，涉及数据库动作时先审批再执行。

第一次打开这套材料，请先读 [`start-here.md`](./start-here.md)。它用一条客户任务解释研究目标、当前结论、术语身份和阅读路径，不要求先了解 `Harness`、C0–C7、Goal Contract 或 CLI/MCP。

## 这轮研究回答三个问题

1. 华为云、Databricks 和其他云厂商分别能把上述任务做到哪一步，哪些只停留在公开声明；
2. 华为云的公开差距主要来自能力缺失，还是来自数据、身份、语义、执行和证据之间的接缝；
3. 在内部事实尚未验证前，应该先验证什么，什么情况下才选择公司级协作方案或数据库团队低依赖方案。

当前没有最终组织结论。四种产品归属方案都保留，是否成立取决于账号、接口、客户需求和内部 Owner Gate。

## 按读者选择入口

| 读者 | 建议先读 | 读完应该能回答 |
|---|---|---|
| 业务或管理读者 | [`start-here.md`](./start-here.md) → [`independent-findings.md`](./independent-findings.md) | 为谁解决什么问题；当前建议和最大 Unknown 是什么 |
| 产品负责人 | [`huawei-product-ui-prototypes.html`](./huawei-product-ui-prototypes.html) → [`huawei-catch-up-plan.html`](./huawei-catch-up-plan.html) | 用户说什么、产品做什么、交付什么、何时拒绝或要求审批 |
| 架构与研发 | [`huawei-catch-up-product-plan.md`](./huawei-catch-up-product-plan.md) | 两种方案、模块边界、接口合同、路线和发布 Gate |
| 研究复核者 | [`agent-entry-governance-deep-dive.md`](./agent-entry-governance-deep-dive.md) → evidence ledger | 判断依据、来源、反证条件和评分方法 |
| 测试与安全负责人 | [`unknowns-and-validation.md`](./unknowns-and-validation.md) | 哪些事实还未知；如何验证；什么情况必须停止 |

## 研究边界与证据标签

- 研究基准日和公开资料核验日：2026-08-19。
- 唯一继承的问题定义：仓库根目录 [`DATAARTS_DATABRICKS_INDEPENDENT_EXPLORATION_BRIEF.md`](../DATAARTS_DATABRICKS_INDEPENDENT_EXPLORATION_BRIEF.md)。
- 事实范围：公开官方资料与无需登录的只读页面；未开通、购买、修改或连接任何云资源。
- 排除项：本仓库既有 Markdown、HTML、SVG、录屏、脚本、历史 Session、先前方案与记忆均不作为本轮事实证据。

- `官方声明`：当前官方产品文档、API、发布说明、价格、架构材料、官方演示或官方案例明确描述。
- `实际观察`：本轮在明确账号、区域、Edition 和时间下实际看到或运行。若没有账号级只读验证，一律不使用此标签。
- `推断`：由已列官方事实推导，且会写明推导链与反证条件。
- `用户观感/客户反馈`：只保留为待验证信号，不当作产品事实。
- `Unknown`：证据不足、登录/区域/Edition/私有预览不可达，或来源冲突。
- `建议`：基于事实、Unknown 与权衡形成的决策输入，不描述为现状或承诺。

<details>
<summary>查看完整比较纪律</summary>

1. 先还原产品边界与一条真实客户旅程，再比较能力。
2. 明确比较单位是单功能、单产品、产品组合，还是端到端客户任务。
3. 不以功能名称数量打分；比较入口、前置条件、深度、权限、语义、失败行为、评测、运营、接口与商业成熟度。
4. “未找到公开证据”只形成 `Unknown`，不形成“没有能力”。
5. 营销页、配置入口、端到端可用、生产可运营、外部可复用、可规模销售分层记录。
6. 时间敏感事实记录云、区域、Edition、GA/Preview、核验日和直接链接；资料未说明的字段写 `Unknown`。
7. 对所有厂商同时记录优势、限制、成本/配额、预览状态与不适用场景。

</details>

## 主要产物

### 面向决策与产品

- [`start-here.md`](./start-here.md)：一页业务入口、术语身份和按问题选择的阅读路径。
- [`independent-findings.md`](./independent-findings.md)：产品边界、客户任务、条件性结论和四种产品归属方案。
- [`agent-entry-governance-visual-report.html`](./agent-entry-governance-visual-report.html)：先看一条真实任务和结论，再下钻厂商入口、治理、身份、评分和华为云差距。
- [`huawei-product-ui-prototypes.html`](./huawei-product-ui-prototypes.html)：十个合成场景，展示用户提问后会得到什么结果、证据和审批边界；不是现网截图。
- [`huawei-catch-up-plan.html`](./huawei-catch-up-plan.html)：产品能力、两种建设方案和阶段路线的可视化版本；也可[只看公司协作方案](./huawei-catch-up-plan.html?view=company)或[只看数据库团队方案](./huawei-catch-up-plan.html?view=db)。
- [`huawei-catch-up-product-plan.md`](./huawei-catch-up-product-plan.md)：完整产品方案，保留 Owner/OKR、架构、模块、接口、Epic 与发布 Gate。

### 面向复核与验证

- [`unknowns-and-validation.md`](./unknowns-and-validation.md)：25 项关键 Unknown、验证前提、G1–G5 和安全停止条件。
- [`evidence-ledger.md`](./evidence-ledger.md)：整体产品研究的逐条官方来源、范围、状态和限制。
- [`agent-entry-evidence-ledger.md`](./agent-entry-evidence-ledger.md)：Agent 入口、身份、治理、工具和评测专项证据。
- [`agent-entry-governance-deep-dive.md`](./agent-entry-governance-deep-dive.md)：完整判断、分析框架、评分方法、反方压力测试和路线建议。
- [`vendor-entry-atlas.html`](./vendor-entry-atlas.html)：11 家厂商入口与任务路径；`67 × 11` 能力矩阵作为专家附录保留。
- [`agent-entry-scorecard.csv`](./agent-entry-scorecard.csv)：十维评分原始数据。分数是公开证据上的研究工具，不是账号实测成绩。
- [`assets/vendor-entry/`](./assets/vendor-entry/)：10 份官方真实 UI/UI 动画和 1 份明确标注的官网概念图；素材不等价于账号实测。

### 本轮内容质量审查

- [`content-humanity-and-readability-independent-review.md`](./content-humanity-and-readability-independent-review.md)：Ian 对术语、前置信息、AI 文风与桌面/手机阅读的独立审查。
- [`humanization-implementation-options-analysis.md`](./humanization-implementation-options-analysis.md)：直接整改、通用 Humanizer 和仓库级 Skill 的选型分析。
- [`reader-first-editorial-contract.md`](./reader-first-editorial-contract.md)：后续改文档必须遵守的读者、术语、证据、分层和 HTML 验收规则。

## 已经完成与仍未完成

已经完成：重建华为云、Databricks 和九家同类厂商的公开产品边界；按经营分析、售后联查、财务证据、数据库故障和外部 Agent 嵌入五条客户任务比较；形成四种产品归属方案及反证条件。

仍未完成：账号级功能、权限、Region/Edition、性能、成本、端到端成功率、内部接口与组织 Owner 验证。因此，任何重要结论都应回到两份 evidence ledger；立项、产品归属或账号测试前必须执行 [`unknowns-and-validation.md`](./unknowns-and-validation.md) 的 G1–G5，未通过的项继续标记为 `Unknown`。
