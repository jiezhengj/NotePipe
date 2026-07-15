# Workspace

工作区（Workspace）是应用程序窗口内可见内容的配置。它实现为树形数据结构，每个节点称为工作区项（WorkspaceItem）。

## 两种工作区项

- **WorkspaceParent（父项）**：可以包含子项
  - **Split（分割）**：沿垂直/水平方向排列子项
  - **Tabs（标签页）**：一次只显示一个子项
- **WorkspaceLeaf（叶子）**：不能包含任何工作区项，对应特定视图

## 工作区结构

工作区有三个特殊 Split 项：_left_、_right_、_root_。

```
Workspace
├── Left split
├── Root split（默认垂直方向）
└── Right split
```

## 检查工作区

```ts
this.app.workspace.iterateAllLeaves((leaf) => {
  console.log(leaf.getViewState().type);
});
```

## Leaf 生命周期

- 在 root split 中新增 Leaf：`getLeaf(true)`
- 在侧边栏新增 Leaf：`getLeftLeaf()` / `getRightLeaf()`
- 指定父项中创建：`createLeafInParent()`
- 移除 Leaf：`detach()`
- 移除特定类型所有 Leaf：`detachLeavesOfType()`

> ⚠️ 插件添加的 Leaf 在插件禁用后仍保留。插件负责清理自己添加的 Leaf。

## Leaf 分组

创建链接视图（Linked Views）：

```ts
leaves.forEach((leaf) => leaf.setGroup('group1'));
```
