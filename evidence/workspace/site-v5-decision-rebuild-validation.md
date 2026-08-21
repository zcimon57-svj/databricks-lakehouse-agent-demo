# 数据智能决策站点 V5 重构校验

日期：2026-08-20
状态：**PASS（本地源站与 GitHub Pages 筛选包）**

## 1. 本次重构范围

- 主页从 Databricks 功能演示改为“Databricks 实测 + 11 家厂商市场基线 + 华为产品归属验证”的领导决策首页；
- 华为专题从固定的 MySQL/PG 双引擎、五个新增服务和 90 天建设路线，改为 Databricks 对标范围、三个领域权威、共享控制面、六个产品模块、PG-first 业务故事、四种归属选项与 G1–G6；
- 新增 V2 决策 Brief，原 Databricks Brief 与 H1/旧 SVG/90 天手册保留为 Phase 1 历史材料；
- 新增三张 SVG：五平面任务闭环、华为共享控制面总架构、华为六模块内部架构图集；
- 将独立研究的 Markdown 生成 UTF-8 详情 HTML，并把主要展示页的 `.md` 跳转改写到对应 HTML；CSV 只在明确标为下载或机器可读时保留；
- GitHub Pages 筛选包新增完整 `independent_exploration_2026-08-19/`，保证可视报告、图片、CSS、JS 和跨页链接可在线访问。

## 2. 结构与生成校验

执行：

```bash
npm run render:details
xmllint --noout \
  site/assets/diagrams/data-intelligence-task-loop.svg \
  site/assets/diagrams/huawei-shared-control-plane.svg \
  site/assets/diagrams/huawei-module-architectures.svg
git diff --check
```

结果：

- 18 份 Markdown 源生成详情 HTML；
- 三张新增 SVG 均通过 XML 解析；
- 无尾随空格或补丁格式错误；
- 详情模板的“返回顶部”锚点在首轮发现缺失后已修复，第二轮通过。

## 3. 浏览器与响应式校验

执行：

```bash
npm run validate:decision-site -- \
  http://127.0.0.1:8765 \
  /tmp/data-intelligence-site-validation-v2
```

覆盖 11 个关键入口：

1. 决策首页；
2. 华为产品决策专题；
3. Genie 专题；
4. 云数据库专题；
5. V2 决策 Brief；
6. 独立综合结论；
7. Unknown 与验证合同；
8. Agent 入口与治理可视报告；
9. 11 家厂商入口图谱；
10. 华为追赶方案可视页；
11. 华为产品 UI 原型。

每个入口分别使用 `1440×900` 和 `390×844` 视口，共 22 个页面/视口组合。第二轮结果 `failed=false`：

- HTTP 状态均为 200；
- `document.characterSet` 均为 UTF-8；
- 无乱码替代字符 `�`；
- 无页面级横向溢出；
- 无缺失锚点；
- 无缺失或宽度为 0 的图片；
- 无站内 4xx/5xx；
- 无 Console Error 或 Page Error。

## 4. 视频与主页专项校验

主页：

- 12 个非锚点站内链接均为 200；
- 五平面 SVG 加载宽度 1600；
- G1、G2、G3、C3、C4、H1 六段精选视频均可读取元数据，时长分别为 61.25、82.75、71、15.5、16、127.16 秒；
- 页面文本未命中邮箱或私有 Databricks 工作区主机模式。

华为专题：

- 12 个非锚点站内链接均为 200；
- 总架构和六模块内部架构两张 SVG 均加载宽度 1600；
- H1 可读取中文有声视频元数据，并在页面上明确标为 Phase 1 历史方案；
- 页面文本未命中邮箱或私有 Databricks 工作区主机模式。

全部中文配音再次校验：

```bash
npm run validate:zh-voiceovers
```

结果：`PASS`，14 段视频、73 个解说片段全部通过；响度范围 `-18.69` 至 `-17.84 LUFS`。

## 5. GitHub Pages 筛选包校验

按 `.github/workflows/pages.yml` 的文件选择规则在 `/tmp` 组装静态包，并从独立 HTTP 端口重新打开主页和华为专题：

- 决策首页、华为专题、Genie、数据库专题、详情 HTML、独立可视报告与 UI 原型均可访问；
- 三张新增 SVG 和独立研究图片/CSS/JS 位于发布包；
- 超长的“华为追赶产品计划”详情页加载 10 张 UI 原型图，证据账本详情页的站内链接也均为 200；
- 六段主页视频及 H1 历史视频均能读取元数据；
- 两个主页面的全部站内链接均为 200；
- 筛选包不包含本地浏览器状态、依赖目录或登录凭据。

## 6. 能力全集与华为主页入口增强

在 V5 主体重构后补做入口可发现性校验：

- 决策首页头部页签、首屏按钮、研究证据卡、市场资源栏和页脚均可直达 `vendor-entry-atlas.html#capabilities`；
- 独立可视报告的头部页签、02B 分流按钮、02C 摘要提示、最终判断区和页脚均新增能力全集入口；
- 能力详册自身在粘性头部、Hero 快捷入口、结论区和页脚保留回跳，并把标题明确为“67 项能力全集”；
- 华为专题在头部、Hero、对标范围下钻卡和证据区提供能力全集入口；
- 决策首页头部和 Hero 分列“华为差距 / 华为方案”，正文新增 DataArts、AgentArts、RDS/DAS、共享控制面四块方案摘要，并分别下钻对标清单、目标架构和六个落地模块；
- 能力比较组件残留的证据账本与深度报告 `.md` 链接已改为渲染后的 UTF-8 HTML。

重新执行 `npm run validate:decision-site`，22 个页面/视口组合再次得到 `failed=false`。专项深链检查结果：

- `site/index.html#huawei-plan`：目标块桌面视口 `y=22.1`，可见；
- `vendor-entry-atlas.html#capabilities`：目标块桌面视口 `y=77.8`，位于粘性导航下方且可见；
- 主页移动端 `390px`、华为方案深链移动端 `390px` 均无横向溢出；
- 人工查看桌面/移动端截图，头部页签、Hero 按钮、能力矩阵首屏和华为方案摘要无截断或重叠。

## 7. 仍然成立的边界

- 本次没有登录华为云目标账号做 DataArts、AgentArts、RDS/DAS 跨产品实测；
- 公开资料、评分、目标架构、模块图、追赶计划与 UI 原型不能替代 G1–G6；
- 本次未连接或修改任何生产数据库；
- 本地验证通过不等于本轮变更已经 commit、push 或完成 GitHub Pages 线上部署。
