# 中文配音说明

更新：2026-08-18

## 交付结果

- 13 段录屏均已生成普通话有声版，输出位于 `../recordings/zh-voice/`。
- 站点默认播放有声版；`../recordings/` 根目录中的无声原版保持不变。
- 画面中的中文字幕继续保留，声音是补充轨道，不会遮挡或改动画面。
- 有声版是合成神经语音，不冒充真人录音。使用 `zh-CN-YunyangNeural` 普通话男声，合成速率为 `+8%`。

## 讲稿与时间轴

完整的 13 段视频、62 个语音片段、开始/结束时间和中文讲稿保存在 [zh-CN-narration.json](zh-CN-narration.json)。讲稿按已有字幕和画面转场重新编排，不是把一整段文字机械铺满全片；每个片段之间保留短暂停顿，方便观众看界面。

构建报告见 [build-report.json](build-report.json)。最长的必要语速调整是 `1.3317x`，低于脚本设置的 `1.35x` 质量门槛。

## 媒体规格与验证

- 视频：直接复制无声原版 H.264 码流，不重新编码；13/13 个视频流 MD5 均与原版一致。
- 音频：AAC-LC、48 kHz、双声道、目标码率 160 kbit/s，语言元数据为 `zho`。
- 时长：13/13 与原版一致，允许误差小于 0.08 秒。
- 响度：全片实测约 `-18.69` 至 `-17.84 LUFS`；峰值低于 `-4.0 dBTP`，给会议室和系统音量留有余量。
- 完整性：有声版 SHA-256 见 [SHA256SUMS](SHA256SUMS)。

验证报告见 [中文配音校验记录](../../site/details/voiceover-validation.html)。

## 重新生成

在项目根目录执行：

```bash
npm run build:zh-voiceovers
```

脚本会优先使用 `cache/` 中已经生成的逐段语音。缺失缓存时，会通过 `uvx edge-tts` 获取指定语音，因此需要可访问对应语音服务的网络环境。也可以只重建指定文件：

```bash
node scripts/build_zh_voiceovers.mjs --only=G1-genie-business-user-multi-use.mp4
```

若要改成女声、降低语速或使用真人录音，只需保持 `zh-CN-narration.json` 的时间窗口，并替换逐段音频；无须重录 Databricks 画面。
