# Editor

`Editor` 类暴露了读取和操作活动 Markdown 文档（编辑模式）的操作。

## 访问编辑器

在命令中使用 `editorCallback`。在其他地方通过活动视图访问：

```ts
const view = this.app.workspace.getActiveViewOfType(MarkdownView);

if (view) {
  const cursor = view.editor.getCursor();
  // ...
}
```

> ℹ️ Obsidian 使用 [CodeMirror](https://codemirror.net/) 作为底层文本编辑器。`Editor` 作为 CM6 和 CM5 之间的抽象层，确保插件在两个平台上都能工作。

## 在光标位置插入文本

```ts
import { Editor, moment, Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'insert-todays-date',
      name: 'Insert today\'s date',
      editorCallback: (editor: Editor) => {
        editor.replaceRange(
          moment().format('YYYY-MM-DD'),
          editor.getCursor()
        );
      },
    });
  }
}
```

## 替换当前选中内容

```ts
import { Editor, Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'convert-to-uppercase',
      name: 'Convert to uppercase',
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        editor.replaceSelection(selection.toUpperCase());
      },
    });
  }
}
```
