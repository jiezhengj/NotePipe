# Editor extensions

编辑器扩展让你自定义 Obsidian 中的编辑体验。Obsidian 使用 CodeMirror 6 (CM6) 驱动 Markdown 编辑器。

> 一个 Obsidian _编辑器扩展_ 就是一个 _CodeMirror 6 扩展_。

## 我需要编辑器扩展吗？

- 如果想改变**阅读视图**中 Markdown 转 HTML 的方式 → 使用 **Markdown post processor**
- 如果想改变**实时预览**中文档的外观 → 需要 **编辑器扩展**

## 注册编辑器扩展

```ts
onload() {
  this.registerEditorExtension([examplePlugin, exampleField]);
}
```

两种常见扩展类型：
- **View plugins** — 视口层扩展
- **State fields** — 状态层扩展
