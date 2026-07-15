# State management

CodeMirror 6 状态管理介绍。

## 状态变更

在大多数应用中，通过赋值更新状态会丢失旧值。为支持撤销/重做，Obsidian 保留了所有变更的历史。

|   | State      |
|---|------------|
| 0 |            |
| 1 | Heading    |
| 2 | # Heading  |
| 3 | ## Heading |

在 TypeScript 中：

```ts
const changes: ChangeSpec[] = [];

changes.push({ from: 0, insert: 'Heading' });
changes.push({ from: 0, insert: '# ' });
changes.push({ from: 0, insert: '#' });
```

## 事务（Transactions）

_事务_ 是一组一起发生的状态变更。例如给选中文本加引号：

```ts
view.dispatch({
  changes: [
    { from: selectionStart, insert: `"` },
    { from: selectionEnd, insert: `"` }
  ]
});
```

事务确保两个变更在撤销历史中作为一步出现。
