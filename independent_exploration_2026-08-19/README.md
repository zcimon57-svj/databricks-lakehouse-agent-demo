# DataArts、Databricks 与云上同类产品独立探索

- 研究基准日：2026-08-19
- 本轮公开资料核验日：2026-08-19
- 唯一继承的问题定义：仓库根目录 `DATAARTS_DATABRICKS_INDEPENDENT_EXPLORATION_BRIEF.md`
- 研究边界：公开官方资料与无需登录的只读页面；未开通、购买、修改或连接任何云资源
- 排除项：本仓库既有 Markdown、HTML、SVG、录屏、脚本、历史 Session、先前方案与记忆均不作为本轮事实证据

## 证据标签

- `官方声明`：当前官方产品文档、API、发布说明、价格、架构材料、官方演示或官方案例明确描述。
- `实际观察`：本轮在明确账号、区域、Edition 和时间下实际看到或运行。若没有账号级只读验证，一律不使用此标签。
- `推断`：由已列官方事实推导，且会写明推导链与反证条件。
- `用户观感/客户反馈`：只保留为待验证信号，不当作产品事实。
- `Unknown`：证据不足、登录/区域/Edition/私有预览不可达，或来源冲突。
- `建议`：基于事实、Unknown 与权衡形成的决策输入，不描述为现状。

## 比较规则

1. 先还原产品边界与一条真实客户旅程，再比较能力。
2. 明确比较单位是单功能、单产品、产品组合，还是端到端客户任务。
3. 不以功能名称数量打分；比较入口、前置条件、深度、权限、语义、失败行为、评测、运营、接口与商业成熟度。
4. “未找到公开证据”只形成 `Unknown`，不形成“没有能力”。
5. 营销页、配置入口、端到端可用、生产可运营、外部可复用、可规模销售分层记录。
6. 时间敏感事实记录云、区域、Edition、GA/Preview、核验日和直接链接；资料未说明的字段写 `Unknown`。
7. 对所有厂商同时记录优势、限制、成本/配额、预览状态与不适用场景。

## 产物

- `evidence-ledger.md`：逐条来源、声明、范围、状态、限制与可复核链接。
- `independent-findings.md`：产品边界、端到端旅程、深度差距、市场基线、数据库原生责任与产品归属方案。
- `unknowns-and-validation.md`：公开资料无法闭合的事实、账号级验证协议与决策 Gate。

## Agent 入口、治理与授权专项

- [`agent-entry-governance-visual-report.html`](./agent-entry-governance-visual-report.html)：主交互式可视化报告；除 11 家入口缩略图外，新增 67 项能力的八域覆盖摘要、关键数据源与接入方式、准确性保障能力/获得可信答案的易用度，并保留综合评分、华为差距、目标形态、路线 Gate 与官方证据。
- [`huawei-catch-up-plan.html`](./huawei-catch-up-plan.html)：华为云 Conversation-first / Capability-first / Harness-first 领先方案可视化子页面；先定义 C0–C7 产品能力与优先级，再用一个对话 Agent 的十种结构化回答展示真实运行链路，随后比较两种完整产品架构、模块、路线与 Gate。新增“数据建设”章节，对照 Databricks Lakeflow/Unity Catalog 与阿里云 DataWorks DI/Governance Agent，补齐接数据库、导文件、生成数据产品和持续治理。顶部“全篇”切换支持双方案、仅方案一、仅方案二；88 项 `di` CLI/MCP 原子能力已移至页面最末并默认折叠。
  - [`仅看方案一`](./huawei-catch-up-plan.html?view=company)；[`仅看方案二`](./huawei-catch-up-plan.html?view=db)。
- [`huawei-product-ui-prototypes.html`](./huawei-product-ui-prototypes.html)：统一对话 Agent 回答画册，包含接入现有数据库、导入新数据、从已有库生成数据产品、数据治理，以及原有综合经营、智能问数、智能分析、知识构建、数据库调查和安全行动十种回答；Pipeline、Schema/Profile、资产蓝图、治理报告、表格、图表、知识图、诊断时间线与审批卡都嵌在 Agent 回复内，并明确标注为产品设计示意而非现网截图。
- [`huawei-catch-up-product-plan.md`](./huawei-catch-up-product-plan.md)：上述方案的完整可审阅文档；按“产品能力目标与优先级 → 对话回答画册 → 方案对比 → 两套架构/选型 → 共同与专属模块 → 技术实现”的顺序组织，并保留 Owner/OKR、Epic、发布 Gate 与许可证/商业边界。Goal Contract 已降级为执行保障，原子能力全集移至文末附录 A。
- [`vendor-entry-atlas.html`](./vendor-entry-atlas.html)：集中式厂商能力详册；先提供可筛选/可下载的 `67 × 11` 细粒度能力矩阵、12 类数据源、七步任务流程与逐厂商前置准备/责任卡，再展示 11 家大图、首次任务路径、治理边界、强项、残差和官方视频/动态。
- [`agent-entry-governance-deep-dive.md`](./agent-entry-governance-deep-dive.md)：校验“自然语言 Agent 成为主入口”的判断，深入比较统一入口、语义治理、身份委托、CLI/MCP、安全动作、评测保证、演进路线与华为建议。
- [`agent-entry-scorecard.csv`](./agent-entry-scorecard.csv)：十维权重、厂商原始分、当前加权总分、不确定度、演进动量与路线吻合度。
- [`agent-entry-evidence-ledger.md`](./agent-entry-evidence-ledger.md)：专项逐条官方证据、状态、限制、支持维度与反证条件。
- [`assets/vendor-entry/`](./assets/vendor-entry/)：上述 HTML/Markdown 使用的本地官方入口素材。10 份为真实 UI/UI 动画，百度 1 份为明确标注的官网概念图；素材均不等价于账号实测。

## 本轮完成状态

- 已重建华为云 DataArts Studio、DataArts Insight、DataArts Fabric、LakeFormation、DAS/RDS/DWS 公开边界。
- 已重建 Databricks Unity Catalog、语义层、AI/BI/Genie、API/嵌入、Agent/MCP、Federation/CDC 与 Lakebase 数据库智能链路。
- 已覆盖 AWS、Microsoft、Google Cloud、Snowflake、Oracle、阿里云、腾讯云、火山引擎和百度智能云中会改变决策的公开能力。
- 已按经营分析、售后联查、财务证据、数据库故障和 SaaS/Agent 嵌入五条客户任务链完成比较。
- 已形成四种产品归属方案及反证条件；因无账号级验证，最终组织归属仍保持开放。

## 阅读顺序

1. 若重点是“Agent 是否会成为主入口、能力实质差在哪”，先打开 [`agent-entry-governance-visual-report.html`](./agent-entry-governance-visual-report.html)，再进入 [`vendor-entry-atlas.html#capabilities`](./vendor-entry-atlas.html#capabilities)筛选 67 项能力、数据源和责任边界，最后向下看入口大图与视频。
2. 若重点是“用户在对话里问完后，Agent 到底如何回答和展示结果”，先看 [`huawei-product-ui-prototypes.html`](./huawei-product-ui-prototypes.html)，再打开 [`huawei-catch-up-plan.html`](./huawei-catch-up-plan.html) 比较产品能力与两条组织路线；需要完整协议、模块、Owner/OKR、选型和 Gate 细节时读 [`huawei-catch-up-product-plan.md`](./huawei-catch-up-product-plan.md)。
3. 再读 [`agent-entry-governance-deep-dive.md`](./agent-entry-governance-deep-dive.md) 的判断校正、十维评分、差距和路线建议。
4. 若重点是 DataArts/Databricks 整体产品边界，读 [`independent-findings.md`](./independent-findings.md) 的决策摘要、客户旅程和方案比较。
5. 对任何重要事实，从报告链接、[`agent-entry-evidence-ledger.md`](./agent-entry-evidence-ledger.md) 或 [`evidence-ledger.md`](./evidence-ledger.md) 回到直接官方来源。
6. 在立项、产品归属或账号测试前，执行 [`unknowns-and-validation.md`](./unknowns-and-validation.md) 的 G1-G5；未通过的项继续标记为 `Unknown`。
