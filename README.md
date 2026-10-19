# Spotify 1-Second Rewind

一个 Manifest V3 Chrome 扩展：将 Spotify Web Player 里的**回退 15 秒**按钮改为**回退 1 秒**。

适用于 `https://open.spotify.com/`，包括例如 [此 episode](https://open.spotify.com/episode/2sIgfLvsfb5vtiYVcguYNs)。扩展不收集数据、不联网，也不需要任何权限；只在 Spotify 网页播放器中运行。

## 安装（开发者模式）

1. 克隆或下载本仓库。
2. 在 Chrome 打开 `chrome://extensions`。
3. 打开右上角的 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择本仓库目录。
5. 打开或刷新 Spotify Web Player，播放节目后点击回退按钮。

按钮每次会回退 1 秒，而非 Spotify 原本的 15 秒。扩展也会将可访问性标签/提示文字中的 “15 seconds” 更新为 “1 second”（若 Spotify 当前界面提供该英文文案）。

## 工作方式

内容脚本在捕获阶段识别 Spotify 的回退控件，阻止其默认的 15 秒处理逻辑，并将当前 `audio`/`video` 媒体元素的播放位置向前调整 1 秒。它优先使用 Spotify 稳定的 `data-testid` 属性，因此页面重渲染和 SPA 导航不需要重新加载扩展。

## 限制

- Spotify 若大幅改动其播放器内部 DOM 或不再暴露标准媒体元素，扩展可能需要更新。
- 控件名称的文本回退匹配目前针对 Spotify 的英文无障碍标签；`data-testid` 匹配不受语言影响。
