# Mobile development

## 在桌面端模拟移动设备

1. 打开 **Developer Tools**
2. 选择 **Console** 标签
3. 输入以下命令：

```ts
this.app.emulateMobile(true);
```

禁用移动模拟：

```ts
this.app.emulateMobile(false);
```

> 💡 切换移动模拟：`this.app.emulateMobile(!this.app.isMobile);`

## 在真实移动设备上检查 WebView

### Android

在 Android 开发者设置中启用 USB 调试。然后在桌面端浏览器中访问 `chrome://inspect/`。

详见：https://developer.chrome.com/docs/devtools/remote-debugging

### iOS

需要 iOS 16.4+ 和 macOS 电脑。

详见：https://webkit.org/web-inspector/enabling-web-inspector/

## 平台特定功能

```ts
import { Platform } from 'obsidian';

if (Platform.isIosApp) {
  // ...
}

if (Platform.isAndroidApp) {
  // ...
}
```

## 在移动设备上禁用插件

如果插件需要 Node.js 或 Electron API，在 `manifest.json` 中设置 `isDesktopOnly` 为 `true`。

## 常见问题

- **Node 和 Electron API**：在移动设备上不可用，调用会导致插件崩溃。
- **正则表达式后顾断言**：仅 iOS 16.4+ 支持。参考 [Can I Use](https://caniuse.com/js-regexp-lookbehind) 了解详情。
