(function () {
  "use strict";

  const statusMeta = {
    A: { short: "支持", label: "官方资料明确当前可用", weight: 1 },
    L: { short: "限用", label: "可以使用，但受预览、版本、配额或任务范围限制", weight: .65 },
    J: { short: "组合", label: "需要接入、建模、联邦、相邻产品或外部编排后实现", weight: .4 },
    U: { short: "待证", label: "公开证据不足，仍需确认；不代表没有该能力", weight: 0 },
    N: { short: "不支持", label: "官方明确当前不支持或不在产品范围内", weight: 0 }
  };
  const sourceMeta = {
    D: { short: "直用", label: "Agent 可直接把它作为分析数据源" },
    P: { short: "接入", label: "需要先摄取、复制、建数据集、联邦或建立知识库" },
    L: { short: "限用", label: "可以直接使用，但受预览、类型、大小、数量或版本限制" },
    T: { short: "工具", label: "仅作为外部工具或动作调用，不等于分析数据源" },
    U: { short: "待证", label: "公开证据不足，仍需确认" },
    N: { short: "不支持", label: "官方明确当前不支持" }
  };

  const domains = [
    { id: "E", name: "交互入口与协作", desc: "发现 Agent、表达目标、澄清问题、续接任务与分享结果" },
    { id: "D", name: "数据源与接入方式", desc: "支持哪些数据源，以及直接使用、先接入、联邦查询或工具调用等方式" },
    { id: "S", name: "业务语义与知识准备", desc: "提问前如何准备指标、表关联、业务术语、示例和知识" },
    { id: "A", name: "分析能力与结果交付", desc: "从查询和多步研究走到图表、报告、订阅与可复用结果" },
    { id: "T", name: "工具调用与任务自动化", desc: "API、CLI、MCP、嵌入、工作流和外部系统操作" },
    { id: "G", name: "身份、权限与审计", desc: "最终用户身份、行列权限、工具授权、租户隔离与审计" },
    { id: "Q", name: "准确性验证与质量保障", desc: "查询验证、可信逻辑、结果一致性、评测、执行链路与回归" },
    { id: "O", name: "上线与运行管理", desc: "可用状态、配额、SLA、版本、回滚与使用分析" }
  ];

  const capabilities = [];
  const add = (domain, id, name, definition) => capabilities.push({ domain, id, name, definition });
  add("E", "E01", "统一自然语言入口", "业务用户可在一个主入口表达目标，而非先判断应打开哪个专业产品。 ");
  add("E", "E02", "Agent 发现、选择与任务分流", "可发现领域 Agent 或数据资产，并按任务分流；不是固定的单 Agent 输入框。");
  add("E", "E03", "多轮对话与上下文保持", "后续问题能引用本轮已选数据、条件、结果和工件。");
  add("E", "E04", "歧义检测与追问澄清", "遇到指标、维度、时间或数据源歧义时先澄清，而非静默猜测。");
  add("E", "E05", "会话历史、恢复与长任务续接", "可恢复会话或长任务，并辨认完成、失败、取消等状态。");
  add("E", "E06", "团队空间、分享与协作", "会话、Agent、数据范围或结果能作为受控对象分享给团队。");
  add("E", "E07", "办公端、移动端、嵌入与第三方入口", "同一能力可进入 Office、SaaS、移动端、企业门户或外部 Agent，而非只在厂商控制台使用。");

  add("D", "D01", "平台内湖仓、数仓与语义模型", "Agent 可查询厂商平台内受治理的表、视图、指标或语义模型。");
  add("D", "D02", "业务数据库直连或联邦查询", "可在不先离线复制全部数据的前提下读取 MySQL、PostgreSQL、SQL Server、Oracle 等。");
  add("D", "D03", "跨云、外部数据目录与第三方数仓", "可治理访问其他云、开放表格式、外部数据目录或第三方数仓。");
  add("D", "D04", "本地表格文件", "CSV/XLSX/JSON 等可上传并成为当前任务的数据输入。");
  add("D", "D05", "文档、图片与非结构化内容", "PDF/Office/文本/图片等可检索、引用或与结构化分析结合。");
  add("D", "D06", "SaaS 与协作内容", "Salesforce/Jira/ServiceNow/Drive/SharePoint/Slack 等可作为知识或分析输入。");
  add("D", "D07", "流式、事件与时序数据", "Agent 可分析流式、日志、事件或时序源，而非只看批量静态表。");
  add("D", "D08", "数据库变更同步（CDC）与增量接入", "平台可持续把源端变化增量送入 Agent 可用的数据对象。");
  add("D", "D09", "API、网页与自定义连接器", "可通过 API、网页抓取或自定义工具接入未内置的数据或知识源。");
  add("D", "D10", "结构化与非结构化联合分析", "同一研究计划中能联合 SQL 数据、文档和外部知识，而非分开提问。");

  add("S", "S01", "可用表、字段与数据范围", "作者能限制 Agent 看到的表、字段、数据集、主题域或知识源。");
  add("S", "S02", "表关联（Join）与实体关系", "可明确声明或治理跨表关系，而非让模型临时猜测关联方式。");
  add("S", "S03", "指标与语义模型", "指标、聚合、时间口径和业务实体可复用且由权威对象实施。");
  add("S", "S04", "同义词、术语表与业务词汇", "用户语言可稳定映射到数据对象、指标和业务定义。");
  add("S", "S05", "枚举、值映射与业务规则", "渠道名、状态码、组织层级等值级语义可预先配置。");
  add("S", "S06", "可信查询、示例 SQL 与示例问答", "高价值问题可绑定可信查询或示例，减少开放式自然语言转 SQL 的偏差。");
  add("S", "S07", "Agent 指令与业务约束", "可配置范围、回答规则、时间逻辑、拒答和输出要求。");
  add("S", "S08", "知识文档与检索增强（RAG）", "政策、定义、手册等可成为可引用的受控知识源。");
  add("S", "S09", "自动元数据与上下文增强", "平台可利用描述、Profile、血缘或统计自动增强上下文，同时允许人工修正。");
  add("S", "S10", "共享且可版本管理的语义对象", "仪表板、Agent、API 与第三方入口引用同一语义对象和版本。");

  add("A", "A01", "自然语言生成并执行查询", "从目标生成 SQL/DAX/KQL/图查询等，并在权限范围内执行。");
  add("A", "A02", "查询与执行步骤可查看", "用户可检查生成查询、选用工具、执行计划或关键中间步骤。");
  add("A", "A03", "表格与可视化", "答案可形成适合问题的表格和图表，而非仅返回文本。");
  add("A", "A04", "保存并发布仪表板或分析结果", "结果可成为可授权、可刷新、可继续编辑的正式分析资产。");
  add("A", "A05", "多步分析与深度研究", "系统能拆解复杂目标、执行多次查询/检索并综合报告。");
  add("A", "A06", "异常、根因与归因", "能围绕异常继续钻取维度、影响因素或候选原因，而非只做汇总。");
  add("A", "A07", "预测分析与 AI 分析函数", "可调用预测、异常检测、关键驱动等受控分析函数。");
  add("A", "A08", "来源引用、SQL 与数据证据", "答案能回指数据、文档、查询或可信资产，便于核验。");
  add("A", "A09", "报告、文档与可复用结果", "可输出带结构、引用且能继续使用的报告、文档或结果资产。");
  add("A", "A10", "定时、订阅与主动洞察", "分析或研究可按计划运行、推送变化并保留运行记录。");

  add("T", "T01", "会话与 Agent API/SDK", "第三方系统可程序化创建会话、提问、轮询结果和管理 Agent。");
  add("T", "T02", "嵌入、iframe 与组件", "可把消费体验嵌入企业门户或应用，并明确用户/发布者凭据语义。");
  add("T", "T03", "向外部 Agent 提供 MCP 工具", "厂商数据或 Agent 能以标准工具形式提供给外部 Agent。");
  add("T", "T04", "调用远程 MCP 与外部工具", "自有 Agent 可发现和调用 Jira、Salesforce 或自定义远程 MCP 工具。");
  add("T", "T05", "CLI、源码控制、CI/CD 与部署", "配置可版本化、差异比较、批量发布和环境迁移，而非只能在界面中点击操作。");
  add("T", "T06", "自定义函数与工具", "可把 UDF、存储过程、API 或代码封装成受控工具。");
  add("T", "T07", "外部应用写动作", "可在用户确认/策略范围内更新工单、CRM、消息或数据库对象。");
  add("T", "T08", "可视工作流与自动化", "可编排步骤、条件、人类输入、审批和定时运行。");
  add("T", "T09", "多 Agent、Supervisor 与 A2A", "可把领域 Agent/工具组合为受控计划，而非把所有上下文塞给一个模型。");

  add("G", "G01", "以最终用户身份查询（OBO）", "底层查询以短期最终用户身份执行，而非统一服务账号或发布者凭据。");
  add("G", "G02", "行级安全", "底层或受治理语义层按用户实施行过滤，且不同入口一致。");
  add("G", "G03", "列级权限与脱敏", "敏感列、掩码和数据分类在 Agent 路径中不降级。");
  add("G", "G04", "Agent、工具与资源的细粒度权限", "能分别授予 Agent、数据源、工具、操作和结果资产权限。");
  add("G", "G05", "按用户授权、确认与撤销（OAuth）", "外部 SaaS 或工具按用户授权，可撤销且不共享长期密钥。");
  add("G", "G06", "服务身份与定时任务", "后台任务使用可辨识、最小权限的 Agent/服务身份，而非个人长期 Token。");
  add("G", "G07", "工作空间、项目与租户隔离", "数据、模型、会话、工具和结果资产具有明确的租户或项目边界。");
  add("G", "G08", "端到端审计", "可把用户、Agent、策略、数据查询、工具调用、结果和动作串在同一审计链。");

  add("Q", "Q01", "数据结构、语法与查询验证", "执行前检查生成查询的语法、对象、类型、引用范围和冲突。");
  add("Q", "Q02", "可信逻辑与确定性答案", "关键问题可固定到 verified query/verified answer/规则，而非每次自由生成。");
  add("Q", "Q03", "SQL 与结果一致性测试", "自动执行生成查询与期望查询并比较结果，而非只让大模型评价文本相似度。");
  add("Q", "Q04", "多步任务与工具调用评测", "评测能覆盖任务分流、工具选择、研究计划和多步输出，而非只测单轮 SQL。");
  add("Q", "Q05", "执行链路、工具步骤与中间结果", "能定位选择了哪个 Agent 或工具、生成了什么查询、耗时与失败位置。");
  add("Q", "Q06", "反馈、BadCase 与线上回流", "用户反馈和失败样本可进入可裁决、可复现的改进队列。");
  add("Q", "Q07", "回归测试、版本比较与发布门禁", "新配置、模型或语义版本可与基线比较，并阻止质量退化的版本发布。");
  add("Q", "Q08", "失败、重试、取消与成本监控", "可观察并控制错误、长任务、重试、Token/查询成本和配额。");

  add("O", "O01", "版本、区域、许可与前置条件透明", "官方材料明确可用状态、版本、区域、许可和必要开关。");
  add("O", "O02", "预算、配额与用量控制", "可设查询/Token/任务/连接器预算，查看消耗并避免失控。");
  add("O", "O03", "SLA、支持与可靠性承诺", "生产入口和关键依赖有可核验 SLA/支持边界，而非只给 Demo。");
  add("O", "O04", "版本、别名、灰度发布与回滚", "Agent、配置和语义可版本化，支持环境迁移、灰度发布或快速回退。");
  add("O", "O05", "使用情况与运营看板", "可按 Agent、用户、任务、数据源、成功率、延迟和成本进行运营分析。");

  const vendorOrder = ["snowflake", "databricks", "google", "aws", "microsoft", "alibaba", "tencent", "oracle", "volcano", "huawei", "baidu"];
  const vendorLabels = {
    snowflake: "Snowflake", databricks: "Databricks", google: "Google", aws: "AWS", microsoft: "Microsoft",
    alibaba: "阿里云", tencent: "腾讯云", oracle: "Oracle", volcano: "火山引擎", huawei: "华为云", baidu: "百度智能云"
  };

  const ids = capabilities.map(item => item.id);
  const expand = prefix => ids.filter(id => id.startsWith(prefix));
  const range = (prefix, start, end) => Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${String(start + i).padStart(2, "0")}`);
  function makeProfile(groups) {
    const map = Object.fromEntries(ids.map(id => [id, "U"]));
    Object.entries(groups).forEach(([status, list]) => list.forEach(id => {
      if (!(id in map)) throw new Error(`Unknown capability id ${id}`);
      map[id] = status;
    }));
    return map;
  }

  const profiles = {
    snowflake: makeProfile({
      A: [...range("E",1,6), "D01","D04","D05","D10", ...range("S",1,8),"S10", ...range("A",1,6),"A08","A09","A10", "T01","T03","T04","T05","T06","T07","T08","T09", ...expand("G"), "Q01","Q02","Q03","Q05","Q06","Q07","Q08", "O01","O02","O04","O05"],
      L: ["E07","D03","D06","D09","S09","T02","Q04","O03"],
      J: ["D02","D07","D08","A07"]
    }),
    databricks: makeProfile({
      A: [...range("E",1,6),"D01","D02","D03","D09",...expand("S"),...range("A",1,6),"A08","A09",...range("T",1,6),"T08","T09","G01","G02","G03","G04","G06","G07","G08",...expand("Q"),"O01","O02","O04","O05"],
      L: ["E07","D04","D05","D06","D10","A10","T07","G05","O03"],
      J: ["D07","D08","A07"]
    }),
    google: makeProfile({
      A: [...range("E",1,5),"D01","D03","D05","D07","D09","D10",...expand("S"),...range("A",1,9),"T01","T02","T03","T04","T06","T09","G01","G02","G03","G04","G06","G07","G08","Q01","Q02","Q05","Q06","Q08","O01","O02","O05"],
      L: ["E06","E07","D02","D04","D06","A10","T05","T07","T08","G05","Q03","Q04","Q07","O03","O04"],
      J: ["D08"]
    }),
    aws: makeProfile({
      A: [...expand("E"),...range("D",1,6),"D09","D10","S01","S02","S03","S04","S07","S08","S09","S10",...range("A",1,6),"A08","A09","A10","T02","T04","T06","T07","T08","T09",...expand("G"),"Q01","Q05","Q06","Q08","O01","O02","O04","O05"],
      L: ["D07","S05","S06","A07","T01","T03","T05","Q02","Q04","O03"],
      J: ["D08"]
    }),
    microsoft: makeProfile({
      A: [...expand("E"),"D01","D02","D06","D07","S01","S02","S03","S04","S06","S07","S09","S10","A01","A02","A03","A04","T01","T02","T05","T06","G01","G02","G03","G05","G06","G07","G08","Q01","Q02","Q05","Q06","Q08","O01","O02","O04","O05"],
      L: ["D05","D09","D10","S05","S08","A08","A09","T03","Q03","Q07","O03"],
      J: ["D03","D04","D08","A10","T04","T07","T08","T09","G04"],
      N: ["A05","A06","A07"]
    }),
    alibaba: makeProfile({
      A: [...range("E",1,6),"D01","D02","D04","D06","D09",...range("S",1,9),"A01","A02","A03","A04","A05","A06","A08","A09","A10","T01","T02","T03","T05","T06","T09","G02","G03","G04","G06","G07","G08","Q02","Q06","Q08","O01","O02","O05"],
      L: ["E07","D03","D05","D10","S10","A07","G05","Q01","O03","O04"],
      J: ["D07","D08","T04","T07","T08","G01","Q05"]
    }),
    tencent: makeProfile({
      A: [...expand("E"),...expand("D"),...expand("S"),...range("A",1,6),"A08","A09",...range("T",1,6),"T08","T09","G02","G03","G04","G06","G07","G08","Q01","Q02","Q05","Q06","Q08","O01","O03","O04","O05"],
      L: ["D03","A07","A10","T02","G01","Q04","Q07","O02"],
      J: ["T07"]
    }),
    oracle: makeProfile({
      A: ["E03","E04","E05","E06","E07","D01","D02","D03","D04","D06","D09","S01","S02","S03","S07","S08","S09","A01","A03","A04","A08","A09","A10","T01","T02","T03","T04","T06","T07","T08","T09",...expand("G"),"Q01","Q05","Q08","O01","O02","O03","O05"],
      L: ["D05","D10","S04","S05","S06","A02","A05","T05","Q02","Q06","O04"],
      J: ["E01","E02","D07","D08","S10","A06","A07"]
    }),
    volcano: makeProfile({
      A: [...expand("E"),"D01","D02","D03","D04","D05","D06","D09","D10",...range("S",1,8),...range("A",1,6),"A08","A09","A10","T01","T02","G02","G03","G06","G07","G08","Q05","Q06","Q08","O01","O02","O05"],
      L: ["D07","S09","S10","A07","T04","T06","T09","G01","G04","Q01","Q02","O04"],
      J: ["D08"]
    }),
    huawei: makeProfile({
      A: ["E03","E04","E05","E06","E07","D01","D02","D09","S01","S03","S04","S05","S06","S07","A01","A02","A03","A04","A10","T01","T02","G02","G06","G07","Q01","Q02","Q06","O01","O05"],
      L: ["E01","E02","S02","S09","A06","A07","G03","Q03","Q07","O02"],
      J: ["D07","D08","T03","T04","T06","T07","T08","T09","G04","G05","G08","Q04","Q05","Q08","O04"]
    }),
    baidu: makeProfile({
      A: ["G04","G07"],
      L: ["E01","E02","E03","D01","D05","D10","S01","S02","S03","S04","S07","S08","S10","A01","A05","A06","A09","T06","T07","T08","T09","G08"]
    })
  };

  const vendors = {
    snowflake: {
      pattern: "工作 Agent + 语义/Search 双引擎", accuracy: 9.3, accuracyUncertainty: .4, ease: 7.4, easeUncertainty: .6,
      prep: "创建 CoWork/Agent；准备 semantic view/Cortex Analyst、Cortex Search service、UDF/存储过程工具与角色授权。",
      vendorDoes: "负责 Agent 规划、Analyst/Search 调用、报告与工件、版本/alias、Trace/Eval、托管 MCP 与连接器运行。",
      customerDoes: "定义可信指标与 verified query，构建搜索索引，授予 Agent/对象/工具权限，配置每用户 OAuth，验收动作与回归集。",
      friction: "控制面最完整，但不是零配置。Cortex Search service 的 USAGE 可访问已索引内容，其安全语义不能简单等同于底表权限；外部 MCP 动作也尚未进入真实调用式 Agent Eval。",
      source: ["https://docs.snowflake.com/en/user-guide/snowflake-cortex/snowflake-cowork/build-agents", "https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst-evaluations", "https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/query-cortex-search-service"]
    },
    databricks: {
      pattern: "Catalog 中心的受治理 Agent", accuracy: 9.2, accuracyUncertainty: .4, ease: 7.7, easeUncertainty: .6,
      prep: "开通 Workspace/SQL entitlement；在 Unity Catalog 授权表/视图/metric view；创建 Genie Space，配置说明、Join、SQL 表达式、示例 SQL、trusted assets 与 benchmark。",
      vendorDoes: "负责 Chat/Agent mode 计划、多 SQL 执行、报告/引用/可视化、UC 权限实施、会话 API 与 benchmark 运行。",
      customerDoes: "缩小数据域，维护共享语义与示例，决定 volume/外部源，配置 OAuth 与 READ VOLUME，建立 benchmark 并裁决结果。",
      friction: "核心结构化数据路径强；文档 Volume、Genie One 外部源和部分 Agent/MCP 能力仍为 Beta/Preview，外部源还可能不会自动触发。",
      source: ["https://docs.databricks.com/aws/en/genie-agents/concepts", "https://docs.databricks.com/aws/en/genie-agents/monitor", "https://docs.databricks.com/aws/en/genie-one/external-sources"]
    },
    google: {
      pattern: "原生分析函数 + Data Agent API", accuracy: 8.8, accuracyUncertainty: .5, ease: 8.1, easeUncertainty: .6,
      prep: "选择 BigQuery/Looker 数据，配置 Agent 数据域、IAM、Knowledge Catalog 上下文、verified queries、说明、UDF 与查询预算。",
      vendorDoes: "负责多步 Conversational Analytics、查询执行、引用/报告、对象表多模态与内置 anomaly/forecast/key-driver 等函数。",
      customerDoes: "策展知识源与 verified queries，限制项目/数据集/表，治理跨云资产，设置 billed bytes/配额并验证跨产品语义。",
      friction: "BigQuery 内置路径易启动且能力广；Looker、BigQuery、Knowledge Catalog、数据库 Agent 与 Gemini Enterprise 的对象/策略仍分布在多个面，部分数据库/动作路径为 Preview。",
      source: ["https://cloud.google.com/blog/products/data-analytics/conversational-analytics-in-bigquery-now-ga", "https://docs.cloud.google.com/bigquery/docs/conversational-analytics", "https://cloud.google.com/blog/products/data-analytics/new-data-agents-across-the-agentic-data-cloud/"]
    },
    aws: {
      pattern: "Chat-primary 工作 Agent + Spaces/Actions", accuracy: 7.8, accuracyUncertainty: .7, ease: 8.7, easeUncertainty: .5,
      prep: "配置 Quick 用户/Pro 许可；连接数据源和 Apps；构建 dataset/topic/knowledge base/Space；创建 Agent，选择知识、persona、资源与 actions。",
      vendorDoes: "负责统一 Chat、Research、Flows、Automate、Spaces、连接器认证、动作执行、运行记录与跨 AWS 服务编排。",
      customerDoes: "决定每个 Space/Agent 可见资源，编写 persona/参考文档，维护 topic/数据集语义，配置 user/service OAuth、consent、IAM 与自动化审批。",
      friction: "数据与应用覆盖最宽、消费入口最省心；但‘连接得上’不等于有强 verified-query/result-equivalence 回归，正确性工程公开深度弱于 Snowflake/Databricks。",
      source: ["https://docs.aws.amazon.com/quick/latest/userguide/how-quicksuite-works.html", "https://docs.aws.amazon.com/quick/latest/userguide/supported-data-sources.html", "https://docs.aws.amazon.com/quick/latest/userguide/working-with-spaces.html"]
    },
    microsoft: {
      pattern: "Fabric 构建 + M365 分发", accuracy: 8.2, accuracyUncertainty: .6, ease: 7.4, easeUncertainty: .7,
      prep: "需要 F2/P1 及租户 AI/cross-geo 设置；创建 Workspace/Data Agent，绑定最多 5 个源并授予读取；补描述、指令、example queries 或 Power BI Verified Answers。",
      vendorDoes: "按源路由 NL2SQL/DAX/KQL/GQL，使用 Entra 用户身份读取，提供 Fabric 测试/发布并通过 M365/Agent Store 分发。",
      customerDoes: "准备 semantic model/Prep for AI、源说明和 verified answers，处理租户/容量/区域，发布并验证 Fabric 与 M365 两层体验。",
      friction: "身份和办公分发强，但作者面与消费面分离。当前文档明确把 root-cause、causal inference 和 advanced analytics 列为范围外；非结构化/Graph/Ontology 等仍有 Preview 成分。",
      source: ["https://learn.microsoft.com/en-us/fabric/data-science/how-to-create-data-agent", "https://learn.microsoft.com/en-us/fabric/data-science/data-agent-add-datasources?tabs=gql", "https://learn.microsoft.com/en-us/fabric/data-science/data-agent-example-queries"]
    },
    alibaba: {
      pattern: "BI 语义数据集 + 多 Agent + 相邻 DMS", accuracy: 7.7, accuracyUncertainty: .7, ease: 7.4, easeUncertainty: .8,
      prep: "购买高级/专业版与 Smart Q 席位；创建数据源/数据集；设置字段类型、聚合、同义词、业务术语、问答知识与学习状态；外部 Skill 另配凭据。",
      vendorDoes: "负责问数、解读、报告、搭建、洞察 Agent 路由，多轮规划、SQL/图表生成、移动/订阅及 Skill/CLI；DMS 另供 MCP/工单。",
      customerDoes: "清洗数据集，修正默认字段与计算指标，维护业务知识并重新学习，分配数据集/看板权限；跨 Quick BI/DataWorks/DMS 自行治理接缝。",
      friction: "中文业务体验完整，但官方新手示例也显示默认字段/指标可答错，需要计算字段或知识调优；跨三条产品线的同一身份、语义与 Trace 未证明。",
      source: ["https://help.aliyun.com/zh/quick-bi/user-guide/smartq", "https://help.aliyun.com/zh/quick-bi/user-guide/prepare-data/", "https://help.aliyun.com/zh/quick-bi/getting-started/smartq-novice-guide"]
    },
    tencent: {
      pattern: "Agent-native 数据全生命周期平台", accuracy: 7.2, accuracyUncertainty: 1.0, ease: 8.0, easeUncertainty: .9,
      prep: "试用/购买并创建 Workspace；在全湖、联邦或直连 OLAP 路径中选型；接入源、TC Catalog/语义、RBAC+ACL、网络和 OBO；高风险 SQL 配置确认策略。",
      vendorDoes: "声明覆盖自然语言接源、工程、治理、分析、Studio/Git/工作流、47+ 数据源、监控诊断与 DatabaseClaw 风险控制。",
      customerDoes: "选择数据路径，配置网络/权限/语义/脱敏，确认高风险动作，验证 OBO、跨源时效、SLA 与新版本回归。",
      friction: "如果公开架构按文档兑现，首次回答路径很短且覆盖广；但产品于 2026-08 新发布，答案准确性、自愈和来源广度多为厂商声明，成熟度不确定性显著高于榜首。",
      source: ["https://cloud.tencent.com/document/product/1835/135578", "https://cloud.tencent.com/document/product/1835/135597", "https://cloud.tencent.com/document/product/1835/135574"]
    },
    oracle: {
      pattern: "单领域 Analytics Agent + DB 原生工具", accuracy: 7.5, accuracyUncertainty: .7, ease: 6.8, easeUncertainty: .8,
      prep: "创建并索引一个 OAC dataset，选择列/过滤器，添加指令、首条消息和最多 10 个 PDF/TXT 知识文件，再共享或加入 Workbook；Select AI/DB Tools 另配。",
      vendorDoes: "负责 OAC RAG/问数/可视化、数据集刷新，以及 Select AI Agent teams、SQL/RAG/email/Slack/web/custom/MCP 工具与数据库深层安全。",
      customerDoes: "把多表/文件先组织成一个 dataset，维护索引、列范围和强制过滤，验证关键答案；跨 OAC、Select AI、Database Tools 协调生命周期。",
      friction: "数据库授权深、连接源广，但 OAC Agent 的 one-dataset + 必须索引使准备成本高；官方还明确提醒 LLM 结果可能不准确，应验证关键事实。",
      source: ["https://docs.oracle.com/en/cloud/paas/analytics-cloud/acubi/create-oracle-analytics-ai-agent.html", "https://docs.oracle.com/en/cloud/paas/analytics-cloud/acubi/dataset-used-oracle-analytics-ai-agent.html", "https://docs.oracle.com/en/cloud/paas/analytics-cloud/acubi/indexing-dataset-oracle-analytics-ai-assistant.html"]
    },
    volcano: {
      pattern: "数据集语义 + 深度研究与报告", accuracy: 7.0, accuracyUncertainty: .8, ease: 6.5, easeUncertainty: .9,
      prep: "购买/授权、创建项目和连接、配置 SaaS IP 白名单、构建/清洗数据集、开启智能分析并等待 15 分钟以上向量化；超级管理员配置 embedding/query/analysis 模型。",
      vendorDoes: "负责 40+ 连接、直连/抽取、自动选数据集、SQL/Python/联网研究、引用与网页/文档报告、OpenAPI/JWT 嵌入。",
      customerDoes: "选择直连/抽取与刷新，处理跨连接 Join，维护语义/同义词/知识，配置模型和权限，验证研究结果与资源成本。",
      friction: "分析与报告深，但准备步骤和模型配置更多；直连模式不能跨数据连接关联，语义复制也不会自动带走全部模型阈值/基础配置。",
      source: ["https://www.volcengine.com/docs/85637/1783727?lang=zh", "https://www.volcengine.com/docs/85637/1588183", "https://www.volcengine.com/docs/85637/2275379"]
    },
    huawei: {
      pattern: "项目内 BI Agent + 相邻 AgentArts/Studio", accuracy: 6.7, accuracyUncertainty: .8, ease: 5.6, easeUncertainty: .9,
      prep: "企业版并申请公测/白名单；创建项目、同区域/企业项目内数据源、网络、数据集和助手；同步语义结构，配置场景、模板、关键词、实体、同义词与时间。",
      vendorDoes: "负责 Insight 问数/图表/见解、语义配置、评测管理与 BadCase；Studio 提供摄取/CDC，AgentArts 提供 Gateway/MCP/Trace/Eval（均为相邻产品能力）。",
      customerDoes: "准备干净、简单、适中规模的数据；提前计算复杂指标；因多表自动 Join 准确度低而尽量预拼宽表；维护虚拟列/同义词/重写规则并闭合跨产品身份。",
      friction: "官方文档直接承认当前模型对复杂指标能力弱、推荐预计算，且多表自动关联准确率低、建议预拼宽表；因此界面简单，但获得可信答案所需的用户准备负担最高之一。",
      source: ["https://support.huaweicloud.com/qs-dataartsinsight/dataartsinsight_02_0007.html", "https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_5118.html", "https://support.huaweicloud.com/usermanual-dataartsinsight/dataartsinsight_03_0101.html"]
    },
    baidu: {
      pattern: "本体/逻辑/动作一体化方向（低证据）", accuracy: 6.0, accuracyUncertainty: 1.4, ease: 5.5, easeUncertainty: 1.5,
      prep: "可确认 IAM/RBAC 与 Workspace 角色；官网宣称需组织本体、逻辑、Action 和多层上下文，但公开资料不足以重建真实首次任务。",
      vendorDoes: "官网方向包含结构化/非结构化上下文、专业工具、人机协同、权限/沙箱/资源隔离与审计。",
      customerDoes: "真实数据连接、语义建模、Agent 发布、授权、评测和运维步骤均需账号或更细官方文档补证，当前不能代填。",
      friction: "这里的低分主要是证据折扣：真实入口、连接器清单、API/MCP、OBO、评测和状态不清楚。公开证据不足不能解释成确认缺失，也不能按营销方向计为现成功能。",
      source: ["https://cloud.baidu.com/product/databuilder", "https://cloud.baidu.com/doc/DataBuilder/s/tm99rrn2e", "https://cloud.baidu.com/doc/DataBuilder/s/mm99rjtfl"]
    }
  };

  const sourceFamilies = [
    { id: "SRC01", name: "平台内湖仓与数仓", desc: "平台表、视图与语义模型", cells: {
      snowflake:["D","Snowflake tables/views/semantic views"], databricks:["D","Unity Catalog managed/external/foreign tables、views、metric views"], google:["D","BigQuery tables/views/Looker semantic sources"], aws:["D","Quick Sight datasets/topics and warehouses"], microsoft:["D","Lakehouse、Warehouse、semantic model"], alibaba:["D","Quick BI 数据集覆盖主流仓库/数据库"], tencent:["D","全湖、联邦、直连 OLAP 三类路径"], oracle:["D","OAC dataset/subject area and Oracle data"], volcano:["D","DataWind/Data Agent 数据集"], huawei:["D","DWS/DLI/Hive 等 Insight 数据源"], baidu:["L","官网方向确认结构化数据，细表能力尚待验证"]
    }},
    { id: "SRC02", name: "业务关系数据库", desc: "MySQL、PostgreSQL、SQL Server、Oracle 等", cells: {
      snowflake:["P","通常先摄取/复制或封装工具，不是 CoWork 原生跨库联邦清单"], databricks:["P","Lakehouse Federation 或 Lakeflow CDC 后成为 UC 对象"], google:["L","AlloyDB/Spanner/Cloud SQL data agents 仍含 Preview 路径"], aws:["D","Quick 支持 Aurora/RDS/MySQL/PostgreSQL/SQL Server 等直连/导入"], microsoft:["D","Fabric SQL DB/Mirrored DB 等可直接作为 Data Agent 源"], alibaba:["D","Quick BI 支持 MySQL/PostgreSQL/SQL Server/Oracle 等"], tencent:["D","官方架构覆盖关系库与直连/联邦"], oracle:["D","OAC 广泛 DB connector + Oracle DB 原生"], volcano:["D","40+ connection 中含多种 RDBMS"], huawei:["D","GaussDB/MySQL/PostgreSQL 等在 Insight 清单"], baidu:["U","未找到 Agent 粒度连接清单"]
    }},
    { id: "SRC03", name: "跨云与外部数据目录", desc: "开放表格式、其他云数据目录与第三方数仓", cells: {
      snowflake:["P","Iceberg/外部表/共享等平台路径，Agent 直接边界依对象"], databricks:["P","Lakehouse/Catalog Federation 治理外部源"], google:["D","BigQuery 可用 Iceberg、Databricks Unity、AWS Glue 等跨云资产"], aws:["D","Quick 文档列 Databricks 与 BigQuery 等数据源"], microsoft:["P","OneLake shortcuts/mirroring 等先形成 Fabric 对象"], alibaba:["L","跨云依具体 Quick BI connector/网络，非统一 Agent 联邦"], tencent:["L","官方声明多源联邦，当前成熟度需验证"], oracle:["D","OAC 清单含 Databricks/BigQuery/Snowflake/Redshift 等"], volcano:["D","连接清单含多种云仓/OLAP，依网络与模式"], huawei:["U","Insight 官方清单未证明跨云 Catalog 路径"], baidu:["U","公开证据不足"]
    }},
    { id: "SRC04", name: "本地表格文件", desc: "CSV/XLSX/JSON 等上传", cells: {
      snowflake:["D","CoWork 支持 CSV/JSON/XLSX 等直接上传，数量/大小有限"], databricks:["L","可经 Volume/表接入；不是任意本地文件零准备直问"], google:["P","通常先装载 BigQuery/object table"], aws:["D","Quick 支持 CSV/TSV/JSON/XLSX"], microsoft:["P","通常先进入 OneLake/Lakehouse/semantic model"], alibaba:["D","Quick BI/Skill 可上传 CSV/XLSX，大小受限"], tencent:["D","发布说明明确文件源"], oracle:["D","OAC dataset 可来自文件"], volcano:["D","连接清单含 Excel/CSV/在线表格"], huawei:["U","本次 Insight 官方支持清单未明确文件 Agent 路径"], baidu:["U","未找到细粒度公开清单"]
    }},
    { id: "SRC05", name: "对象存储与数据湖文件", desc: "S3、ADLS、GCS、OBS 等", cells: {
      snowflake:["P","需外部 stage/table/Search 等平台对象"], databricks:["P","External location/table/Volume 先受 UC 治理"], google:["D","BigQuery object tables/BigLake 可处理对象数据"], aws:["P","S3 可建数据集或 connected knowledge base"], microsoft:["P","通过 OneLake/shortcut/lakehouse 对象"], alibaba:["P","通过 Quick BI/数据平台连接或抽取"], tencent:["D","官方架构列对象存储/文件"], oracle:["P","通常先建 OAC connection/dataset"], volcano:["D","连接清单含对象存储/文档等路径"], huawei:["U","相邻 Studio 支持不能证明 Insight Agent 直用"], baidu:["U","公开证据不足"]
    }},
    { id: "SRC06", name: "文档、图片与多模态内容", desc: "PDF、Office、文本、图片、音视频", cells: {
      snowflake:["D","Cortex Search + direct uploads；部分音视频函数另有 Preview"], databricks:["L","Volume 文件 Beta；类型/10MB/500 文件/每问 5 个等限制"], google:["D","Object tables + 多模态函数，支持文档/图片/日志/视频分析"], aws:["D","Spaces/knowledge bases 支持广泛文档类型"], microsoft:["L","Azure AI Search unstructured source 为 Preview"], alibaba:["L","个人知识库/附件等随版本与 Seat 限制"], tencent:["D","官方架构/发布声明结构化与非结构化/多模态"], oracle:["L","OAC Agent 仅 PDF/TXT、最多 10 个、每个小于 5MB，PDF 图片不读"], volcano:["D","文档、网页、附件与研究模式"], huawei:["U","Insight 助手公开文档未证明通用文档源"], baidu:["L","官网方向声明结构化/非结构化上下文，细节尚待验证"]
    }},
    { id: "SRC07", name: "业务 SaaS", desc: "Salesforce/Jira/ServiceNow/ERP/CRM", cells: {
      snowflake:["T","Jira/Salesforce 等主要作为 MCP connector/tool；分析副本可另建"], databricks:["P","Lakeflow Connect 摄取；Jira 等在 Genie One 外部源中亦有 Beta"], google:["P","BigQuery 跨云/连接路径含 Salesforce 等，需先形成数据对象"], aws:["D","Quick 支持 Jira/ServiceNow/GitHub/Salesforce 等"], microsoft:["P","依 Microsoft Graph/Power Platform/Fabric ingestion 等具体路径"], alibaba:["D","Quick BI 数据源包含多类 SaaS/业务连接"], tencent:["P","官方称 47+ 源；逐 SaaS 清单和授权需核验"], oracle:["D","OAC 数据源清单含 Salesforce/Oracle Apps 等"], volcano:["D","连接清单含应用/SaaS/API"], huawei:["U","Insight 官方清单未见 SaaS 业务源"], baidu:["U","未找到公开连接器全集"]
    }},
    { id: "SRC08", name: "协作与知识应用", desc: "Drive/SharePoint/Slack/Confluence/Teams/Gmail", cells: {
      snowflake:["T","Slack 等可作 MCP action/connector；知识需 Search/上传路径"], databricks:["L","Genie One Beta 支持 Drive/Gmail/M365/Jira/Confluence/Glean/Slack，每用户 OAuth"], google:["P","可经 Google Workspace/Drive/Vertex/BigQuery 等具体集成，非 BigQuery Agent 单一清单"], aws:["D","connected knowledge base 支持 Confluence/Drive/OneDrive/SharePoint/Web"], microsoft:["D","Microsoft Graph 可作为 Data Agent 源，M365 分发强"], alibaba:["P","依 Quick BI/知识库/相邻连接能力"], tencent:["P","知识库/连接路径有方向，逐连接器权限需核验"], oracle:["D","OAC 清单含 Google Drive/Dropbox 等，Select AI 有 Slack/email 工具"], volcano:["D","连接清单含在线表格/文档/网页/社媒"], huawei:["U","公开 Insight 源清单未证明"], baidu:["U","公开证据不足"]
    }},
    { id: "SRC09", name: "流式、时序与增量同步", desc: "事件、日志、消息队列与持续变化数据", cells: {
      snowflake:["P","Snowpipe/Streaming/Kafka 等先进入平台对象"], databricks:["P","Lakeflow streaming/CDC/RabbitMQ 等先形成 UC 数据"], google:["P","BigQuery streaming/CDC/Datastream 后供 Agent 查询"], aws:["P","IoT/streaming/Athena/OpenSearch 等经数据产品路径"], microsoft:["D","Eventhouse/KQL source 可直接用于 Data Agent；CDC 可经 Fabric 平台"], alibaba:["P","DataWorks/实时计算等相邻路径先入数据集"], tencent:["D","官方架构列 MQ/实时流并发布实时集成"], oracle:["P","OCI/OAC/GoldenGate 等平台路径"], volcano:["P","实时/直连/抽取依具体连接"], huawei:["P","DataArts Studio 实时/CDC 是相邻产品；与 Insight 连续性未证明"], baidu:["U","公开证据不足"]
    }},
    { id: "SRC10", name: "API、网页与自定义连接", desc: "REST、网页抓取、UDF 与自定义工具", cells: {
      snowflake:["T","UDF/SP/MCP custom tools；不是自动成为分析表"], databricks:["T","UC functions/custom agents/MCP；数据仍需治理对象"], google:["T","UDF、CA API、MCP/ADK；自定义摄取另行配置"], aws:["T","Web crawler/action connectors/MCP/custom integrations"], microsoft:["L","Azure AI Search/Graph/Foundry/Copilot 等组合，Data Agent 单面有限"], alibaba:["D","Quick BI API 数据源可直连/抽取但有版本、10MB/列/行与跨源关联限制"], tencent:["D","发布说明含 API 源与自然语言建源"], oracle:["D","REST/OData 数据源 + custom tools"], volcano:["D","API/网页/自定义连接并支持 OpenAPI"], huawei:["D","DataArts Insight 官方支持 API 数据源"], baidu:["U","未找到 Agent API/连接器细节"]
    }},
    { id: "SRC11", name: "图数据与业务本体", desc: "图数据、本体模型与实体关系", cells: {
      snowflake:["U","未以 CoWork/Agent 原生图源确认"], databricks:["U","可在表上建关系，但本次未确认原生图 Agent 源"], google:["L","BigQuery Graph/Data Agent 路线含 Preview"], aws:["U","Quick 文档未确认图/本体为原生 Agent 源"], microsoft:["L","Graph 与 Ontology sources 为 Preview"], alibaba:["U","业务语义存在，但未确认原生图/本体源"], tencent:["L","TC Catalog/实体语义方向强，图源细节需验证"], oracle:["P","Oracle Graph 可经数据库/分析路径，但 OAC Agent 直接边界需验证"], volcano:["U","未找到原生图源证据"], huawei:["U","未找到 Insight Agent 图源证据"], baidu:["L","官网本体方向明确，真实数据源与查询流程尚待验证"]
    }},
    { id: "SRC12", name: "结构化与非结构化联合分析", desc: "在同一任务中联合 SQL 数据、文档与外部来源", cells: {
      snowflake:["D","CoWork/Agent 可组合 Analyst + Search + tools"], databricks:["L","Agent mode + Volume/外部源可组合，但多项为 Beta"], google:["D","BigQuery CA 可组合表、对象表、UDF 与知识上下文"], aws:["D","Agent/Space/Research 可组合 datasets、docs、KB、actions"], microsoft:["L","SQL/DAX/KQL 与 Azure AI Search/Graph 等组合仍有 Preview/源数量限制"], alibaba:["L","Smart Q/知识库/Skill 可组合，跨产品同任务边界需验证"], tencent:["D","官方架构声明结构化/非结构化与多 Agent 一体"], oracle:["L","OAC 一个 dataset + 知识文档可组合，范围/类型限制明显"], volcano:["D","研究模式组合数据集、知识、联网和附件"], huawei:["U","Insight 与 AgentArts/Studio 组合连续性未证明"], baidu:["L","官网方向声称多层上下文，真实执行尚待验证"]
    }}
  ];

  function esc(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[ch]);
  }
  function statusBadge(status) {
    const meta = statusMeta[status];
    return `<span class="cap-status" data-status="${status}" title="${esc(meta.label)}" aria-label="${esc(meta.label)}">${esc(meta.short)}</span>`;
  }
  function sourceBadge(mode, note) {
    const meta = sourceMeta[mode];
    return `<span class="source-mode" data-mode="${mode}" title="${esc(meta.label)}；${esc(note)}" aria-label="${esc(meta.label)}">${esc(meta.short)}</span>`;
  }
  function vendorOptions(includeAll = true) {
    return `${includeAll ? '<option value="all">全部厂商</option>' : ''}${vendorOrder.map(id => `<option value="${id}">${esc(vendorLabels[id])}</option>`).join("")}`;
  }
  function domainOptions() {
    return `<option value="all">全部 67 项</option>${domains.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join("")}`;
  }
  function coverage(vendorId, domainId) {
    const list = capabilities.filter(item => item.domain === domainId);
    const points = list.reduce((sum, item) => sum + statusMeta[profiles[vendorId][item.id]].weight, 0);
    const unknown = list.filter(item => profiles[vendorId][item.id] === "U").length;
    return { pct: Math.round(points / list.length * 100), unknown, total: list.length };
  }
  function sourceLegend() {
    return `<div class="cap-legend">${Object.entries(sourceMeta).map(([code, meta]) => `<span class="source-mode" data-mode="${code}" title="${esc(meta.label)}">${esc(meta.short)}</span><small>${esc(meta.label)}</small>`).join("")}</div>`;
  }
  function readinessCards() {
    return `<div class="readiness-grid">${vendorOrder.map(id => {
      const v = vendors[id];
      return `<article class="readiness-card"><div class="readiness-head"><div><strong>${esc(vendorLabels[id])}</strong><small>${esc(v.pattern)}</small></div><span class="readiness-score">${v.accuracy.toFixed(1)} / ${v.ease.toFixed(1)}</span></div><div class="mini-bars"><div class="mini-bar"><span>准确性保障</span><div class="mini-track"><div class="mini-fill" style="width:${v.accuracy * 10}%"></div></div><b>${v.accuracy.toFixed(1)}</b></div><div class="mini-bar"><span>答案易用度</span><div class="mini-track"><div class="mini-fill" style="width:${v.ease * 10}%"></div></div><b>${v.ease.toFixed(1)}</b></div></div><p>不确定度：保障能力 ±${v.accuracyUncertainty.toFixed(1)}；易用度 ±${v.easeUncertainty.toFixed(1)}。分值来自公开流程与架构证据，不是账号实测命中率。</p></article>`;
    }).join("")}</div>`;
  }
  function responsibilityCards() {
    return `<div class="responsibility-grid">${vendorOrder.map((id, index) => {
      const v = vendors[id];
      return `<details class="responsibility-card"${index < 2 ? " open" : ""}><summary><div><strong>${esc(vendorLabels[id])}</strong><span>${esc(v.pattern)}</span></div><b>保障 ${v.accuracy.toFixed(1)} · 易用 ${v.ease.toFixed(1)}</b></summary><div class="responsibility-body"><article><h4>首次使用前需要准备</h4><p>${esc(v.prep)}</p></article><article><h4>平台自动完成</h4><p>${esc(v.vendorDoes)}</p></article><article><h4>客户需要配置和维护</h4><p>${esc(v.customerDoes)}</p></article><article class="friction"><h4>主要使用成本与架构判断</h4><p>${esc(v.friction)} ${v.source.map((url, i) => `<a href="${esc(url)}" target="_blank" rel="noreferrer">官方证据 ${i + 1}</a>`).join(" · ")}</p></article></div></details>`;
    }).join("")}</div>`;
  }
  function flowDiagram() {
    const steps = [
      ["1 接入", "直连/同步/联邦/工具"], ["2 授权", "用户、服务与 Agent 身份"], ["3 语义", "指标/关联/术语/知识"],
      ["4 验证", "示例/可信查询/一致性测试"], ["5 发布", "Agent/入口/版本"], ["6 执行", "计划/查询/报告/操作"], ["7 运营", "链路/反馈/成本/回归"]
    ];
    return `<div class="cap-flow">${steps.map((s, i) => `${i ? '<span class="cap-flow-arrow">→</span>' : ''}<div class="cap-flow-step"><strong>${s[0]}</strong><span>${s[1]}</span></div>`).join("")}</div>`;
  }
  function sourceTable(rows = sourceFamilies) {
    return `<div class="cap-panel"><div class="cap-table-scroll"><table class="cap-table"><thead><tr><th>数据源类型</th><th>判断口径</th>${vendorOrder.map(id => `<th>${esc(vendorLabels[id])}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr><td><span class="cap-code">数据源 ${row.id.replace("SRC", "")}</span><span class="cap-name">${esc(row.name)}</span></td><td class="cap-definition">${esc(row.desc)}</td>${vendorOrder.map(id => { const [mode, note] = row.cells[id]; return `<td>${sourceBadge(mode, note)}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div></div>`;
  }
  function coverageTable() {
    return `<div class="cap-panel"><div class="cap-table-scroll"><table class="cap-table coverage-table"><thead><tr><th>能力域</th><th>比较内容</th>${vendorOrder.map(id => `<th>${esc(vendorLabels[id])}</th>`).join("")}</tr></thead><tbody>${domains.map((domain, index) => `<tr><td><span class="cap-code">能力域 ${index + 1}</span><span class="cap-name">${esc(domain.name)}</span></td><td class="cap-definition">${esc(domain.desc)}</td>${vendorOrder.map(id => { const c = coverage(id, domain.id); return `<td class="coverage-cell" title="状态权重：支持=1、限用=.65、组合=.4、待证/不支持=0；这是公开证据覆盖度，不是实测能力"><span class="coverage-number">${c.pct}</span><div class="coverage-track"><div class="coverage-fill" style="width:${c.pct}%"></div></div><span class="coverage-unknown">待证 ${c.unknown}/${c.total}</span></td>`; }).join("")}</tr>`).join("")}</tbody></table></div></div>`;
  }
  function capabilityRows(domainFilter, vendorFilter, statusFilter) {
    const shownVendors = vendorFilter === "all" ? vendorOrder : [vendorFilter];
    const rows = capabilities.filter(item => {
      if (domainFilter !== "all" && item.domain !== domainFilter) return false;
      if (statusFilter === "all") return true;
      return shownVendors.some(id => profiles[id][item.id] === statusFilter);
    });
    return { shownVendors, rows };
  }
  function renderCapabilityTable(domainFilter = "all", vendorFilter = "all", statusFilter = "all") {
    const head = document.getElementById("cap-table-head");
    const body = document.getElementById("cap-table-body");
    if (!head || !body) return;
    const { shownVendors, rows } = capabilityRows(domainFilter, vendorFilter, statusFilter);
    head.innerHTML = `<tr><th>能力项</th><th>判断标准</th>${shownVendors.map(id => `<th>${esc(vendorLabels[id])}</th>`).join("")}</tr>`;
    body.innerHTML = rows.length ? rows.map(item => `<tr><td><span class="cap-code">${item.id}</span><span class="cap-name">${esc(item.name)}</span></td><td class="cap-definition">${esc(item.definition)}</td>${shownVendors.map(id => `<td title="${esc(vendorLabels[id])} · ${esc(item.name)} · ${esc(statusMeta[profiles[id][item.id]].label)}">${statusBadge(profiles[id][item.id])}</td>`).join("")}</tr>`).join("") : `<tr><td class="cap-empty" colspan="${shownVendors.length + 2}">当前筛选没有匹配项。</td></tr>`;
    const count = document.getElementById("cap-filter-count");
    if (count) count.textContent = `${rows.length} 项 × ${shownVendors.length} 家`;
  }
  function downloadCsv() {
    const header = ["id", "domain", "capability", "acceptance_meaning", ...vendorOrder.map(id => vendorLabels[id])];
    const q = value => `"${String(value).replace(/"/g, '""')}"`;
    const rows = capabilities.map(item => [item.id, domains.find(d => d.id === item.domain).name, item.name, item.definition, ...vendorOrder.map(id => `${profiles[id][item.id]}:${statusMeta[profiles[id][item.id]].short}`)]);
    const csv = "\ufeff" + [header, ...rows].map(row => row.map(q).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "agent-capability-universe-2026-08-19.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }
  function renderFull(root) {
    root.classList.add("cap-module");
    root.innerHTML = `
      <div class="cap-lead"><article class="cap-callout"><h3>比较对象已从界面扩展为 67 项可核验能力</h3><p>每项能力只计一次，并把“支持、限用、组合、待证、不支持”分开。数据连接也按可直接分析、需先接入和仅作外部工具重新分类。</p><div class="cap-metrics"><div class="cap-metric"><strong>67</strong><span>去重后的能力项</span></div><div class="cap-metric"><strong>12</strong><span>数据源与接入方式</span></div><div class="cap-metric"><strong>11</strong><span>厂商同表比较</span></div><div class="cap-metric"><strong>7</strong><span>接入→运营完整流程</span></div></div></article><article class="cap-method"><h3>五种证据状态</h3><p>状态只反映截至 2026-08-19 的公开官方证据；未登录账号验证。“待证”是证据不足，不代表确认缺失。</p><div class="cap-legend">${Object.entries(statusMeta).map(([code]) => `${statusBadge(code)}<small>${esc(statusMeta[code].label)}</small>`).join("")}</div></article></div>
      <div class="cap-domain-grid">${domains.map((d, index) => `<article class="cap-domain-card"><strong>能力域 ${index + 1} · ${esc(d.name)}<span>${capabilities.filter(c => c.domain === d.id).length} 项</span></strong><p>${esc(d.desc)}</p></article>`).join("")}</div>
      <div class="cap-subhead"><h3>1. 细粒度能力全集与厂商支持矩阵</h3><p>点击筛选查看某一能力域、某一家厂商或某种证据状态。单元格是状态，不是简单的有或没有；下载按钮由同一份浏览器数据生成 CSV，避免报告和附件不一致。</p></div>
      <div class="cap-panel"><div class="cap-toolbar"><label>能力域 <select id="cap-domain-filter">${domainOptions()}</select></label><label>厂商 <select id="cap-vendor-filter">${vendorOptions()}</select></label><label>状态 <select id="cap-status-filter"><option value="all">全部状态</option>${Object.entries(statusMeta).map(([code, meta]) => `<option value="${code}">${esc(meta.short)}</option>`).join("")}</select></label><span id="cap-filter-count">67 项 × 11 家</span><button class="cap-button" id="cap-download" type="button">下载 67 项 CSV</button></div><div class="cap-table-scroll"><table class="cap-table"><thead id="cap-table-head"></thead><tbody id="cap-table-body"></tbody></table></div></div>
      <div class="cap-subhead" id="data-sources"><h3>2. 数据源与接入方式：同一个连接器名称，使用路径可能完全不同</h3><p><strong>直用</strong>表示 Agent 可直接分析；<strong>接入</strong>表示需先复制、联邦、建数据集或知识库；<strong>工具</strong>表示只能作为外部工具或操作调用。把三者相加会高估易用度并掩盖授权差异。悬停单元格可查看厂商路径说明。</p></div>${sourceLegend()}${sourceTable()}
      <div class="cap-subhead"><h3>3. 从流程和架构判断准确性保障与易用度</h3><p>答案准确性不只取决于模型：数据接入、最终用户权限、业务语义、可信逻辑、执行验证和回归运营必须形成闭环。</p></div>${flowDiagram()}<div class="score-criteria"><article><h4>准确性保障能力 / 10</h4><p>业务语义 20% + 可信逻辑 15% + 查询与结果验证 20% + 评测与回归 20% + 执行链路与证据 15% + 权限正确性 10%。这是保障能力评分，不是实际答对率。</p></article><article><h4>获得可信答案的易用度 / 10</h4><p>许可与账号 15% + 数据接入 20% + 语义准备负担 25% + 作者测试 15% + 消费分发 15% + 失败修复 10%。分数越高，得到“可相信的第一答”所需客户工作越少。</p></article></div>${readinessCards()}
      <div class="cap-note">不要把 0.2–0.5 分的小差解释成真实测试排名：本研究没有 11 家同题、同数据、同权限账号测试。Snowflake/Databricks 的高分来自公开质量保障较完整；AWS 的高易用来自入口与连接广度；华为的低易用来自官方明确要求预计算指标、预拼宽表等客户准备；百度的大区间主要来自公开证据不足。</div>
      <div class="cap-subhead"><h3>4. 平台做什么、客户需要做什么</h3><p>展开厂商卡片查看首次使用前的准备、平台自动化边界、客户持续责任和主要使用成本。这是“为什么同样一个聊天框，落地成本不同”的核心。</p></div>${responsibilityCards()}
      <div class="cap-link-row"><a href="../site/details/agent-entry-evidence-ledger.html">复核官方证据账本</a><a href="../site/details/agent-entry-governance-deep-dive.html">阅读文字版方法与结论</a><a href="./agent-entry-governance-visual-report.html#capability-gap">返回主报告摘要</a></div>`;
    const filters = ["cap-domain-filter", "cap-vendor-filter", "cap-status-filter"].map(id => document.getElementById(id));
    const apply = () => renderCapabilityTable(filters[0].value, filters[1].value, filters[2].value);
    filters.forEach(control => control.addEventListener("change", apply));
    document.getElementById("cap-download").addEventListener("click", downloadCsv);
    renderCapabilityTable();
  }
  function renderMain(root) {
    root.classList.add("cap-module");
    const keySources = sourceFamilies.filter(row => ["SRC01","SRC02","SRC06","SRC07","SRC09","SRC12"].includes(row.id));
    root.innerHTML = `
      <div class="cap-lead"><article class="cap-callout"><h3>界面不是差距主体：差距出现在回答之前与回答之后</h3><p>11 家都能做出“一个输入框”。真正不同的是数据如何接入、谁准备业务语义、最终用户权限能否到达执行点、复杂问题能否拆成可验证步骤，以及错误能否进入回归。</p><div class="cap-metrics"><div class="cap-metric"><strong>67</strong><span>细粒度能力全集</span></div><div class="cap-metric"><strong>8</strong><span>能力域</span></div><div class="cap-metric"><strong>12</strong><span>数据源类型</span></div><div class="cap-metric"><strong>5</strong><span>证据状态</span></div></div></article><article class="cap-method"><h3>主报告只呈现摘要</h3><p>下表是公开证据覆盖度（支持=1、限用=.65、组合=.4），不是产品实测分。“待证”数量单列，避免把资料少误判为没有能力。</p><div class="cap-legend">${Object.entries(statusMeta).map(([code]) => statusBadge(code)).join("")}</div></article></div>
      <div class="cap-main-insights"><article><strong>质量保障最完整</strong><p>Snowflake 与 Databricks 的领先不来自聊天框，而来自业务语义、可信逻辑、测试评测、版本、执行链路和治理对象的连续性。</p></article><article><strong>开始使用最省步骤</strong><p>AWS 的 Chat + Space + Research + Actions 与 Google 的 BigQuery 内置分析，使业务用户更快开始；但仍要分别核验质量回归深度。</p></article><article><strong>华为最关键问题</strong><p>官方要求复杂指标预计算、多表尽量预拼宽表；再叠加 Insight、Studio、AgentArts、数据库之间的接缝，获得可信答案的成本高于界面所呈现。</p></article></div>
      <div class="cap-subhead"><h3>八类能力的公开证据覆盖摘要</h3><p>100 代表该能力域每一项都有“支持”的官方证据；“限用”和“组合”折算，“待证”不能按“不支持”解读。完整 67×11 可筛选矩阵在厂商能力详册。</p></div>${coverageTable()}
      <div class="cap-subhead"><h3>六类关键数据源：直接可用、接入后可用，还是仅作工具？</h3><p>这张摘要解释为何“支持 40+ 数据源”不能直接换算成 Agent 易用度。悬停状态标签可查看具体路径。</p></div>${sourceLegend()}${sourceTable(keySources)}
      <div class="cap-subhead"><h3>准确性保障能力 / 获得可信答案的易用度</h3><p>前者看业务语义、验证、评测、执行链路和授权；后者看许可、接入、前置准备、测试、分发和修复成本。两者均为公开架构推断，不是统一测试集测得的实际准确率。</p></div>${readinessCards()}
      <div class="cap-link-row"><a href="./vendor-entry-atlas.html#capabilities">打开 67 项能力全集、12 类数据源与责任卡</a><a href="../site/details/agent-entry-evidence-ledger.html">复核证据账本</a></div>`;
  }

  const full = document.getElementById("capability-full");
  if (full) renderFull(full);
  const main = document.getElementById("capability-main-summary");
  if (main) renderMain(main);

  window.AgentCapabilityComparison = { domains, capabilities, profiles, vendors, sourceFamilies, statusMeta, sourceMeta };
})();
