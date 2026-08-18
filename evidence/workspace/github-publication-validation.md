# GitHub 公开发布与 Pages 校验

校验日期：2026-08-18  
结论：`PASS`

## 发布目标

- 公开仓库：`https://github.com/zcimon57-svj/databricks-lakehouse-agent-demo`
- 默认分支：`main`
- 首次公开提交：`cd87f47120114a045f994a4a0de5890aec2fb387`
- 在线预览：`https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/`
- Pages 构建方式：GitHub Actions
- HTTPS：强制启用
- 首次成功部署工作流：`32139581379`

## 公开前审计

| 项目 | 结果 |
|---|---|
| 首次提交 Git 跟踪文件 | 259 个，约 50 MB |
| 超过 GitHub 100 MB 的文件 | 0 |
| GitHub Token / AWS Key / Google Key | 0 |
| 私钥 / Bearer Token | 0 |
| 用户 Gmail | 0 |
| 私有 Databricks Host | 0 |
| 已知工作区与组织 ID | 0 |
| 合成邮箱 | 300 个，全部为 `example.invalid` |
| 被排除的本地目录 | `node_modules/`、`.tools/`、`_site/` |
| Git 提交邮箱 | GitHub `users.noreply.github.com` 地址 |

审计只声明上述已执行规则的结果，不等同于通用的数据防泄漏认证。工作区录屏另有 DOM 脱敏、截图抽检和页面正文隐私扫描。

## Pages 构建

工作流 `.github/workflows/pages.yml` 使用：

- `actions/checkout@v7`
- `actions/configure-pages@v6`
- `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v5`

Pages 发布包只组装根入口、`site/`、`videos/recordings/` 以及配音讲稿、构建报告和 SHA-256，不发布依赖、CLI 工具或本地临时状态。

首次推送时，新仓库尚未启用 Pages，因此 `Configure Pages` 正确地失败并返回 Not Found。随后通过 GitHub Pages API 将 `build_type` 设置为 `workflow`，重新执行同一工作流后成功；没有绕过权限或修改仓库可见性。

## 公网 HTTP 与浏览器结果

| 校验项 | 结果 |
|---|---|
| Pages 根地址 | HTTP 200 |
| 主演示 HTML | HTTP 200，`text/html; charset=utf-8` |
| G1 MP4 Range 请求 | HTTP 206，`video/mp4` |
| 主页面本地链接 | 5/5 为 HTTP 200 |
| SVG | 2/2 解码成功，宽度 1600 |
| 首页嵌入有声视频 | 10/10，`readyState=4`、时长正确、无媒体错误 |
| 录屏索引 | 13 个有声和 13 个无声原版全部 HTTP 200 |
| 配音证据 | JSON、构建报告、SHA256SUMS 和验证 HTML 全部 HTTP 200 |
| 页面隐私扫描 | 未发现邮箱或私有 Databricks Host |

在线 G1 播放探针实际推进到 2.10 秒，解码 44,279 字节音频和 125,498 字节视频，媒体错误为 0；因此不是只有音轨元数据或空音轨。

## 证据文件

- `evidence/workspace/public-pages-online.png`
- `evidence/workspace/public-pages-recordings-online.png`
- `evidence/workspace/public-pages-voiceover-online.png`

这些截图来自 GitHub Pages 公网地址，不是本地 HTTP Server。

## 边界

- 公开发布没有重新登录 Databricks，也没有触发工作区、SQL Warehouse 或数据库写操作；
- Pages 成功只证明静态演示可在线访问，不更新 2026-08-18 之后的产品功能和账号权益；
- 仓库未附加开源许可证；公开可见性本身不自动授予复制、修改或再分发许可。
