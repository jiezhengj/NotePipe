# View plugins

View plugin 是一种编辑器扩展，让你可以访问编辑器视口（Viewport）。它在视口重新计算 _之后_ 运行，因此不能做任何影响视口的更改（如插入块或换行）。

> 💡 需要影响编辑器垂直布局时，使用 State field。

## 创建 View plugin

```ts
import {
  ViewUpdate,
  PluginValue,
  EditorView,
  ViewPlugin,
} from '@codemirror/view';

class ExamplePlugin implements PluginValue {
  constructor(view: EditorView) {
    // 初始化
  }

  update(update: ViewUpdate) {
    // 当有新变更时更新
  }

  destroy() {
    // 清理
  }
}

export const examplePlugin = ViewPlugin.fromClass(ExamplePlugin);
```

三个方法控制生命周期：
- `constructor()` — 初始化
- `update()` — 在变更时更新（用户输入、选中文本等）
- `destroy()` — 清理
