# Status bar

在状态栏中创建新块：

```ts
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    const item = this.addStatusBarItem();
    item.createEl('span', { text: 'Hello from the status bar 👋' });
  }
}
```

> ⚠️ Obsidian 移动端**不支持**自定义状态栏项。

## 多个状态栏项

```ts
const fruits = this.addStatusBarItem();
fruits.createEl('span', { text: '🍎' });
fruits.createEl('span', { text: '🍌' });

const veggies = this.addStatusBarItem();
veggies.createEl('span', { text: '🥦' });
veggies.createEl('span', { text: '🥬' });
```

Obsidian 默认在每个状态栏项之间添加间距。如果需要更精确的间距控制，将多个 HTML 元素组合到一个状态栏项中。
