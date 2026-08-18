# 华为云 RDS 受治理智能层专题校验

校验日期：2026-08-18
结果：`PASS`
范围：公开资料研究、静态 HTML/SVG、中文有声架构录屏和本地浏览器集成；不包含华为云生产租户实调

## 交付物

- `docs/research/06-huawei-cloud-rds-mysql-postgresql-governed-agent.md`：完整研究、客户故事、能力地图、90 天 Gate、KPI、团队、Epic、风险与官方来源；
- `site/huawei-rds-agent.html` / `site/huawei-rds-agent.css`：面向领导和同事的精简专题页；
- `site/details/huawei-rds-agent-guide.html`：由 Markdown 生成的 UTF-8 完整手册；
- `site/assets/diagrams/huawei-rds-agent-target-architecture.svg`：目标架构；
- `site/assets/diagrams/huawei-rds-agent-90-day-roadmap.svg`：90 天六 Gate 路线；
- `videos/recordings/H1-huawei-rds-governed-agent.mp4`：127.16 秒无声原版；
- `videos/recordings/zh-voice/H1-huawei-rds-governed-agent.mp4`：127.16 秒普通话有声版。

## 内容边界检查

| 检查 | 结果 |
|---|---|
| 华为云官方事实与架构建议分开 | PASS；页面首屏和研究稿均声明“方向建议、非现网产品声明” |
| 客户故事身份 | PASS；“海岚零售”明确标注为合成案例，不冒充客户背书 |
| 建议 KPI 身份 | PASS；90 天、正确率、延迟、业务改善均标记为建议目标，不冒充实测 |
| 生产实调边界 | PASS；明确未连接华为云 RDS 租户，未验证区域、版本、性能、成本或 SLA |
| 写动作边界 | PASS；分析面只读，退款、Kill、改参数、扩容和切主进入独立 Action Gateway |
| 双引擎差异 | PASS；MySQL / PostgreSQL 使用独立方言包、权限适配和 Golden Questions |

## 静态与浏览器检查

执行：

```bash
npm run render:details
xmllint --noout site/assets/diagrams/huawei-rds-agent-*.svg
node scripts/validate_site.mjs http://127.0.0.1:8765/site/huawei-rds-agent.html evidence/workspace/huawei-rds-agent-final.png
node scripts/validate_site.mjs http://127.0.0.1:8765/site/details/huawei-rds-agent-guide.html evidence/workspace/huawei-rds-agent-guide-final.png
```

结果：

- 专题页与完整手册 HTTP 200；
- 两张 SVG 均为合法 XML，浏览器自然宽度均为 1600；
- 专题页 2 个本地目标链接全部为 200；
- H1 有声视频 `readyState=4`、时长 127.16 秒、无媒体错误；
- 1440px 页面无横向溢出；390px 手机页面 `scrollWidth=clientWidth=390`；
- 页面正文未发现原始 `**` Markdown 标记；
- 页面正文未发现用户邮箱或私有 Databricks 工作区主机名。

## H1 中文音轨检查

执行：

```bash
npm run build:zh-voiceovers
npm run validate:zh-voiceovers
cd videos/voiceover && sha256sum -c SHA256SUMS
```

结果：

- 14/14 个有声文件通过；总计 73 个按画面分镜的中文解说片段；
- H1：H.264 1440×900 / 25 fps；AAC-LC 48 kHz 双声道；音轨语言 `zho`；
- H1 有声版与无声原版压缩视频流 MD5 一致；
- 全集响度范围 `-18.69` 至 `-17.84 LUFS`；最大必要语速调整 `1.3317x`，低于 `1.35x` Gate；
- H1 无声原版 SHA-256：`d81b30dc262132e7fa75b16cf5913dda1cd81c4a0a3b12fdb73b91923166a6f1`；
- H1 有声版 SHA-256：`723b071fdf4ec2419dc2032a796fe0359da15c6b3b74f0277a92302bdd2865bf`。

## 仍未验证

- 任何华为云账号、RDS 实例、DAS/DRS/DataArts/Agent 平台的目标区域与实际权益；
- RDS MySQL/PostgreSQL 真实 Schema、权限、流量、查询计划、复制延迟和审计开销；
- DRS 目标拓扑的版本支持、端到端水位、Schema 演进和成本；
- 真实客户问题、50 个 Golden Questions、建议 KPI 和 90 天交付周期；
- 最终会议室扬声器的主观听感。

正式试点必须从 G0/G1 重新核准版本、区域、权限、网络、计费和负载，不能用本次静态演示替代生产验收。
