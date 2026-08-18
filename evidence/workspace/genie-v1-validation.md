# Genie 专题展示与视频验证

日期：2026-08-17  
状态：PASS

## 页面

- 页面：`site/genie.html`；
- 截图：`evidence/workspace/genie-v1.png`；
- 本地链接：`site/index.html`、`docs/research/04-genie-implementation-and-usage.md` 均返回 HTTP 200；
- SVG：`genie-implementation-architecture.svg`、`genie-usage-modes.svg` 均完成加载，`naturalWidth=1600`；
- 隐私扫描：未发现邮箱或私有 Databricks Workspace Host。

## 三段长视频

| 文件 | 类型 | 浏览器实测时长 | readyState | SHA-256 |
|---|---|---:|---:|---|
| `G1-genie-business-user-multi-use.mp4` | 真实工作区 | 61.25s | 4 | `eade2ba0b51bdc7dba77818e2d9ecc0bb97d4e63930642f019ab08c557f33471` |
| `G2-genie-authoring-monitor-benchmark.mp4` | 真实工作区 | 82.75s | 4 | `b4f7bf896f8c0a87b695a2355bfb3adf5655002c773cb8e7729a514acb140fa7` |
| `G3-genie-embedded-vs-api-architecture.mp4` | 本地架构演示 | 71.00s | 4 | `170b368e23e3fa5e955559991c9d53056389cf87ff1ce10b16c1411bf39732c2` |

所有视频均为 H.264 MP4、无音轨、内嵌中文字幕。G1/G2 录制脚本替换邮箱和 UUID、模糊账号/头像控件；抽检退款结果、DBOps 报告、审批表、Sources、Monitor、Benchmark 历史画面均未发现邮箱。

## 真实评测状态

- 3 个 Agent-mode Benchmark 已在真实 Agent 中配置；
- 最终有效运行：2026-08-17 10:27:28；
- Accuracy：33%（1/3）；
- P1 区域题通过；
- 退款题事实正确但多返回行/列，严格判 `Extra Rows / Incomplete Output`；
- DBOps 可见回答完整，但评测器判 `Empty Result`，状态为人工复核；
- 未为展示效果放宽标准或改写失败结果。

## 最终资源状态

- Starter SQL Warehouse：`STOPPED / already_stopped`；
- 临时 Google 登录浏览器：已关闭；
- 临时浏览器 Profile：已移入系统回收站；
- 合成数据、Genie Agent、Examples 与 Benchmarks 保留，供后续演示。
