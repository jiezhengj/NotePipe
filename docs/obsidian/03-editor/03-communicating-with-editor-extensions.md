# Communicating with editor extensions

构建编辑器扩展后，你可能需要从编辑器外部与之通信，例如通过命令或 Ribbon 操作。

## 访问 CodeMirror 6 编辑器

```ts
import { EditorView } from '@codemirror/view';

// @ts-expect-error, not typed
const editorView = view.editor.cm as EditorView;
```

## View plugin 通信

```ts
this.addCommand({
  id: 'example-editor-command',
  name: 'Example editor command',
  editorCallback: (editor, view) => {
    // @ts-expect-error, not typed
    const editorView = view.editor.cm as EditorView;
    const plugin = editorView.plugin(examplePlugin);
    if (plugin) {
      plugin.addPointerToSelection(editorView);
    }
  },
});
```

## State field 通信

直接在编辑器视图上 dispatch 状态效果：

```ts
editorView.dispatch({
  effects: [
    // ...
  ],
});
```
