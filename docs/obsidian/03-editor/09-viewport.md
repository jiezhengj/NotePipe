# Viewport

Obsidian 编辑器支持数百万行的大型文档，因为它只渲染可见部分（及周边一小部分）。

视口（Viewport）是编辑器中一个移动的"窗口"，只渲染窗口内的内容，忽略窗口外的内容。

每当用户滚动文档或文档本身发生变化时，视口就会过时并需要重新计算。

## 视口和编辑器扩展

如果想要构建依赖视口的编辑器扩展，使用 **View plugins**，它们可以访问视口信息。

> 参考 CodeMirror 6 文档：[Viewport](https://codemirror.net/docs/guide/#viewport)
