# HTML elements

Obsidian API 中的多个组件暴露 _容器元素（container elements）_，它们是 `HTMLElement` 对象，可用于在 Obsidian 中创建自定义界面。

## 使用 `createEl()` 创建元素

```ts
containerEl.createEl('h1', { text: 'Heading 1' });
```

`createEl()` 返回对新元素的引用：

```ts
const book = containerEl.createEl('div');
book.createEl('div', { text: 'How to Take Smart Notes' });
book.createEl('small', { text: 'Sönke Ahrens' });
```

## 样式设置

在插件根目录添加 `styles.css` 文件：

```css title="styles.css"
.book {
  border: 1px solid var(--background-modifier-border);
  padding: 10px;
}

.book__title {
  font-weight: 600;
}

.book__author {
  color: var(--text-muted);
}
```

> 💡 使用 Obsidian 的 CSS 变量（如 `--background-modifier-border`、`--text-muted`）可以让插件在不同主题下都显示良好。

通过 `cls` 属性将样式绑定到元素：

```ts
const book = containerEl.createEl('div', { cls: 'book' });
book.createEl('div', { text: 'How to Take Smart Notes', cls: 'book__title' });
book.createEl('small', { text: 'Sönke Ahrens', cls: 'book__author' });
```

## 条件样式

```ts
element.toggleClass('danger', status === 'error');
```
