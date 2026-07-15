# Context menus

## 创建右键菜单

```ts
import { Menu, Notice, Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.addRibbonIcon('dice', 'Open menu', (event) => {
      const menu = new Menu();

      menu.addItem((item) =>
        item
          .setTitle('Copy')
          .setIcon('documents')
          .onClick(() => {
            new Notice('Copied');
          })
      );

      menu.addItem((item) =>
        item
          .setTitle('Paste')
          .setIcon('paste')
          .onClick(() => {
            new Notice('Pasted');
          })
      );

      menu.showAtMouseEvent(event);
    });
  }
}
```

- `showAtMouseEvent()` 在鼠标点击位置打开菜单
- `menu.showAtPosition({ x: 20, y: 20 })` 在相对于 Obsidian 窗口左上角的位置打开

## 文件菜单和编辑器菜单

通过订阅 `file-menu` 和 `editor-menu` 工作区事件添加菜单项：

```ts
this.registerEvent(
  this.app.workspace.on('file-menu', (menu, file) => {
    menu.addItem((item) => {
      item
        .setTitle('Print file path 👈')
        .setIcon('document')
        .onClick(async () => {
          new Notice(file.path);
        });
    });
  })
);

this.registerEvent(
  this.app.workspace.on("editor-menu", (menu, editor, view) => {
    menu.addItem((item) => {
      item
        .setTitle('Print file path 👈')
        .setIcon('document')
        .onClick(async () => {
          new Notice(view.file.path);
        });
    });
  })
);
```
