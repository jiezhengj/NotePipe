# Decorations

Decorations 让你控制编辑器扩展中内容的绘制或样式。

## 四种装饰类型

| 类型 | 用途 |
|------|------|
| **Mark decorations** | 为现有元素添加样式 |
| **Widget decorations** | 在文档中插入元素 |
| **Replace decorations** | 用其他元素隐藏/替换文档部分 |
| **Line decorations** | 为行添加样式 |

## View plugin 还是 State field？

- **View plugin**：可以根据视口内容确定装饰时使用
- **State field**：需要管理视口外的装饰，或修改会影响视口内容时使用
- 两种方式都可行时，View plugin 性能更好

## Widget 示例

```ts
import { EditorView, WidgetType } from '@codemirror/view';

export class EmojiWidget extends WidgetType {
  toDOM(view: EditorView): HTMLElement {
    const div = document.createElement('span');
    div.innerText = '👉';
    return div;
  }
}
```

使用 Replace decoration：

```ts
const decoration = Decoration.replace({
  widget: new EmojiWidget()
});
```

## State field 提供装饰

```ts
export const emojiListField = StateField.define<DecorationSet>({
  create(state): DecorationSet {
    return Decoration.none;
  },
  update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();

    syntaxTree(transaction.state).iterate({
      enter(node) {
        if (node.type.name.startsWith('list')) {
          const listCharFrom = node.from - 2;
          builder.add(
            listCharFrom,
            listCharFrom + 1,
            Decoration.replace({
              widget: new EmojiWidget(),
            })
          );
        }
      },
    });

    return builder.finish();
  },
  provide(field: StateField<DecorationSet>): Extension {
    return EditorView.decorations.from(field);
  },
});
```

## View plugin 提供装饰

```ts
class EmojiListPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    for (let { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter(node) {
          if (node.type.name.startsWith('list')) {
            const listCharFrom = node.from - 2;
            builder.add(
              listCharFrom,
              listCharFrom + 1,
              Decoration.replace({ widget: new EmojiWidget() })
            );
          }
        },
      });
    }
    return builder.finish();
  }

  destroy() {}
}

const pluginSpec: PluginSpec<EmojiListPlugin> = {
  decorations: (value: EmojiListPlugin) => value.decorations,
};

export const emojiListPlugin = ViewPlugin.fromClass(EmojiListPlugin, pluginSpec);
```

`PluginSpec` 中的 `decorations` 属性指定了 view plugin 如何向编辑器提供装饰。使用 `view.visibleRanges` 可以限制语法树遍历范围以优化性能。
