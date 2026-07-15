# Views

视图决定 Obsidian 如何显示内容。文件浏览器、图谱视图和 Markdown 视图都是视图的示例。你也可以创建自定义视图。

## 创建自定义视图

```ts
import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class ExampleView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return 'Example view';
  }

  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.createEl('h4', { text: 'Example view' });
  }

  async onClose() {
    // 清理资源
  }
}
```

- `getViewType()` — 返回视图的唯一标识符
- `getDisplayText()` — 返回人类可读的视图名称
- `onOpen()` — 视图在 Leaf 中打开时调用，负责构建视图内容
- `onClose()` — 视图关闭时调用，负责清理资源

## 注册和使用视图

```ts
import { Plugin, WorkspaceLeaf } from 'obsidian';
import { ExampleView, VIEW_TYPE_EXAMPLE } from './view';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.registerView(
      VIEW_TYPE_EXAMPLE,
      (leaf) => new ExampleView(leaf)
    );

    this.addRibbonIcon('dice', 'Activate view', () => {
      this.activateView();
    });
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
    }

    workspace.revealLeaf(leaf);
  }
}
```

> ⚠️ 绝对不要在你的插件中管理视图的引用。Obsidian 可能多次调用视图工厂函数。使用 `getLeavesOfType()` 访问视图实例。

```ts
this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE).forEach((leaf) => {
  if (leaf.view instanceof ExampleView) {
    // 访问你的视图实例
  }
});
```
