# Commands

命令是用户可以从命令面板或通过快捷键调用的操作。

## 注册命令

```ts
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'print-greeting-to-console',
      name: 'Print greeting to console',
      callback: () => {
        console.log('Hey, you!');
      },
    });
  }
}
```

## 条件命令

使用 `checkCallback` 代替 `callback`。回调会执行两次：
- `checking = true`：执行预检查
- `checking = false`：执行实际操作

```ts
this.addCommand({
  id: 'example-command',
  name: 'Example command',
  checkCallback: (checking: boolean) => {
    const value = getRequiredValue();
    if (value) {
      if (!checking) doCommand(value);
      return true;
    }
    return false;
  },
});
```

## 编辑器命令

使用 `editorCallback` 访问活动编辑器：

```ts
this.addCommand({
  id: 'example-command',
  name: 'Example command',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    const sel = editor.getSelection();
    console.log(`You have selected: ${sel}`);
  },
});
```

> ℹ️ 编辑器命令仅在活动编辑器可用时显示在命令面板中。

编辑器条件命令使用 `editorCheckCallback`。

## 快捷键

```ts
this.addCommand({
  id: 'example-command',
  name: 'Example command',
  hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'a' }],
  callback: () => {
    console.log('Hey, you!');
  },
});
```

> ⚠️ 避免为公开插件设置默认快捷键，可能与用户或其他插件冲突。
> ℹ️ `Mod` 键在 Windows/Linux 上为 `Ctrl`，macOS 上为 `Cmd`。
