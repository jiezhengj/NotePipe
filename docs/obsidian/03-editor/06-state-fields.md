# State fields

State field 是一种编辑器扩展，让你管理自定义编辑器状态。

## 定义状态效果（State Effects）

```ts
const addEffect = StateEffect.define<number>();
const subtractEffect = StateEffect.define<number>();
const resetEffect = StateEffect.define();
```

尖括号 `<>` 中的类型定义效果输入类型。`resetEffect` 不需要输入。

## 定义状态字段（State Field）

```ts
export const calculatorField = StateField.define<number>({
  create(state: EditorState): number {
    return 0;
  },
  update(oldState: number, transaction: Transaction): number {
    let newState = oldState;

    for (let effect of transaction.effects) {
      if (effect.is(addEffect)) {
        newState += effect.value;
      } else if (effect.is(subtractEffect)) {
        newState -= effect.value;
      } else if (effect.is(resetEffect)) {
        newState = 0;
      }
    }

    return newState;
  },
});
```

- `create` — 返回初始值
- `update` — 包含应用效果的逻辑
- `effect.is()` — 在应用前检查效果类型

## 派发状态效果

```ts
view.dispatch({
  effects: [addEffect.of(num)],
});
```

## 辅助函数

```ts
export function add(view: EditorView, num: number) {
  view.dispatch({
    effects: [addEffect.of(num)],
  });
}

export function subtract(view: EditorView, num: number) {
  view.dispatch({
    effects: [subtractEffect.of(num)],
  });
}

export function reset(view: EditorView) {
  view.dispatch({
    effects: [resetEffect.of(null)],
  });
}
```
