# Icons

## 浏览可用图标

浏览 [lucide.dev](https://lucide.dev/) 查看所有可用图标及其名称。

> ⚠️ 目前仅支持 v0.446.0 及以下版本的图标。

## 使用图标

使用 `setIcon()` 工具函数将图标添加到 HTML 元素：

```ts
import { Plugin, setIcon } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    const item = this.addStatusBarItem();
    setIcon(item, 'info');
  }
}
```

更改图标大小：

```css
div {
  --icon-size: var(--icon-size-m);
}
```

## 添加自定义图标

```ts
import { addIcon, Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    addIcon('circle', `<circle cx="50" cy="50" r="50" fill="currentColor" />`);

    this.addRibbonIcon('circle', 'Click me', () => {
      console.log('Hello, you!');
    });
  }
}
```

`addIcon` 参数：
1. 图标的唯一名称
2. SVG 内容（不含外层 `<svg>` 标签）

> ⚠️ 图标需要适配 `0 0 100 100` 的 viewBox。

## 图标设计指南

遵循 [Lucide 设计指南](https://lucide.dev/guide/design/icon-design-guide)：

- 在 24×24 像素画布上设计
- 画布内至少保留 1 像素内边距
- 描边宽度 2 像素
- 使用圆角连接和圆角端点
- 使用居中描边
- 形状（如矩形）边框半径 2 像素
- 不同元素之间保持 2 像素间距
