# Right-to-left (RTL)

Obsidian 支持阿拉伯语、希伯来语、波斯语等 RTL 语言。

## 两个上下文中出现 RTL

- **应用界面**：根据设置中选的语言自动反转，`.mod-rtl` 类添加到 `body` 元素
- **笔记内容**：可以混合 LTR 和 RTL，编辑器自动检测每行语言方向

## CSS 逻辑属性

始终使用逻辑属性而非方向属性：

| 方向属性 | 逻辑属性 |
|----------|----------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |
| `left` | `inset-inline-start` |
| `right` | `inset-inline-end` |

逻辑值：

| 方向值 | 逻辑值 |
|--------|--------|
| `float: left` | `float: inline-start` |
| `float: right` | `float: inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |

## Obsidian CSS 帮助类和规则

### 全局选择器

```css
.mod-rtl .plugin-class {
  direction: rtl;
}
```

### 编辑器选择器

- `.markdown-source-view` 上的 `dir="rtl"` 属性
- 逐行 `.cm-line` 上的 `dir` 属性

### 图标自动镜像

Obsidian 在 RTL 模式下自动反转图标方向。防止特定图标被反转：

```css
.mod-rtl svg.svg-icon.left-icon {
  transform: unset;
}
```

### 方向变量

CSS 变量 `--direction` 可用于水平计算：
- LTR：`1`
- RTL：`-1`
