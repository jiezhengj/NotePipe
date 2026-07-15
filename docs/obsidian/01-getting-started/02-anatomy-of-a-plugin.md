# Anatomy of a plugin

`Plugin` 类定义了插件的生命周期并暴露了所有插件可用的操作：

```ts
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    // 配置插件所需的资源
  }
  async onunload() {
    // 释放插件配置的资源
  }
}
```

## 插件生命周期

- **`onload()`** — 当用户开始使用插件时运行。这是配置插件大部分功能的地方。
- **`onunload()`** — 当插件被禁用时运行。插件使用的任何资源必须在此释放，以避免在插件禁用后影响 Obsidian 的性能。

## 查看控制台

1. 按 `Ctrl+Shift+I`（Windows/Linux）或 `Cmd+Option+I`（macOS）打开开发者工具
2. 点击 Console 标签

```ts
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    console.log('loading plugin')
  }
  async onunload() {
    console.log('unloading plugin')
  }
}
```
