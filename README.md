# Spotify Custom Rewind

一个 Manifest V3 Chrome 扩展：让你决定 Spotify Web Player 的回退按钮每次回退多少秒。

适用于 `https://open.spotify.com/`，包括例如 [此 episode](https://open.spotify.com/episode/2sIgfLvsfb5vtiYVcguYNs)。扩展不收集数据、不联网；设置使用 Chrome 同步存储保存。

## 功能

- 可选择常用的 **1、5、10、15 或 30 秒**回退间隔。
- 也可以输入 **1–600 秒**之间的任意整数。
- 设置立即生效，无需刷新 Spotify 页面。
- 使用自定义的绿色回退图标，而非浏览器默认扩展图标。

## 安装（开发者模式）

1. 克隆或下载本仓库。
2. 在 Chrome 打开 `chrome://extensions`。
3. 打开右上角的 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择本仓库目录。
5. 打开或刷新 Spotify Web Player。
6. 点击浏览器工具栏中的扩展图标，选择预设秒数或输入自定义秒数并保存。

之后 Spotify 播放器中的回退按钮会按所选秒数回退。

## 工作方式

内容脚本在捕获阶段识别 Spotify 的回退控件，阻止其默认的 15 秒处理逻辑，并将当前 `audio`/`video` 媒体元素的播放位置向前调整所选秒数。设置保存于 `chrome.storage.sync`，并在所有打开的 Spotify 标签页中同步更新。

## 限制

- Spotify 若大幅改动其播放器内部 DOM 或不再暴露标准媒体元素，扩展可能需要更新。
- 控件名称的文本回退匹配目前针对 Spotify 的英文无障碍标签；`data-testid` 匹配不受语言影响。
