# Plugin guidelines

## 通用规范

### 避免使用全局 app 实例

使用 `this.app` 而非全局 `app`（或 `window.app`）。全局对象仅用于调试，将来可能移除。

### 避免不必要的控制台日志

默认配置下，开发者控制台只应显示错误信息。

### 考虑用文件夹组织代码

多个 `.ts` 文件时，用文件夹组织便于审查和维护。

### 重命名占位符类名

将 `MyPlugin`、`MyPluginSettings`、`SampleSettingTab` 等重命名为反映插件实际名称的类名。

## 移动端

- Node.js 和 Electron API 在移动端不可用
- 正则表达式后顾断言仅 iOS 16.4+ 支持

## UI 文本

### 仅在多个分区时使用标题

避免添加顶级标题如 "General"、"Settings"。如果有一个分区包含通用设置，将它们放在顶部而不添加标题。

### 标题中避免 "settings"

- ✅ "Advanced" — ❌ "Advanced settings"

### 使用 Sentence case

- ✅ "Template folder location" — ❌ "Template Folder Location"

### 使用 `setHeading` 而非 `<h1>`、`<h2>`

```ts
new Setting(containerEl).setName('your heading title').setHeading();
```

## 安全

### 避免 `innerHTML`、`outerHTML` 和 `insertAdjacentHTML`

使用用户输入构建 DOM 元素存在安全风险。使用 DOM API 或 Obsidian 辅助函数（`createEl()`、`createDiv()`、`createSpan()`）。

## 资源管理

### 插件卸载时清理资源

使用 `registerEvent()` 或 `addCommand()` 自动清理资源：

```ts
this.registerEvent(this.app.vault.on('create', this.onCreate));
```

### 避免在 `onunload` 中分离 leaves

更新插件时，已打开的 leaves 会在原始位置重新初始化。

## 命令

- 避免设置默认快捷键
- 使用适当的回调类型（`callback` / `checkCallback` / `editorCallback` / `editorCheckCallback`）

## 工作区

### 避免直接访问 `workspace.activeLeaf`

使用 `getActiveViewOfType()` 代替：

```ts
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
if (view) { /* ... */ }
```

### 避免管理自定义视图引用

❌ `this.registerView(MY_VIEW_TYPE, () => this.view = new MyCustomView());`
✅ `this.registerView(MY_VIEW_TYPE, () => new MyCustomView());`

## Vault

### 优先使用 Editor API 而非 `Vault.modify` 修改活动文件

Editor 保留了光标位置、选中内容和折叠内容的信息。

### 优先使用 `Vault.process` 而非 `Vault.modify` 修改后台文件

`process` 是原子操作，避免与其他插件冲突。

### 优先使用 `FileManager.processFrontMatter` 修改 frontmatter

它运行原子操作，保证 YAML 布局一致。

### 优先使用 Vault API 而非 Adapter API

Vault API 有缓存层和序列化文件操作的优势。

### 避免遍历所有文件来按路径查找

使用 `getFileByPath`、`getFolderByPath` 或 `getAbstractFileByPath`。

### 使用 `normalizePath()` 清理用户定义的路径

```ts
import { normalizePath } from 'obsidian';
const pathToPlugin = normalizePath('//my-folder\file');
// => "my-folder/file"
```

## 编辑器

### 更改或重新配置编辑器扩展

使用 `updateOptions()` 更新所有编辑器：

```ts
class MyPlugin extends Plugin {
  private editorExtension: Extension[] = [];

  onload() {
    this.registerEditorExtension(this.editorExtension);
  }

  updateEditorExtension() {
    this.editorExtension.length = 0;
    let myNewExtension = this.createEditorExtension();
    this.editorExtension.push(myNewExtension);
    this.app.workspace.updateOptions();
  }
}
```

## 样式

### 禁止硬编码样式

❌ `el.style.color = 'white';`
✅ 使用 CSS 类和 Obsidian CSS 变量

```ts
const el = containerEl.createDiv({cls: 'warning-container'});
```

```css
.warning-container {
  color: var(--text-normal);
  background-color: var(--background-modifier-error);
}
```

## TypeScript

- 优先使用 `const` / `let` 而非 `var`
- 优先使用 `async/await` 而非 Promise

❌ Promise 链式：
```ts
function test(): Promise<string | null> {
  return requestUrl('https://example.com')
    .then(res => res.text)
    .catch(e => { console.log(e); return null; });
}
```

✅ async/await：
```ts
async function AsyncTest(): Promise<string | null> {
  try {
    let res = await requestUrl('https://example.com');
    return await res.text;
  } catch (e) {
    console.log(e);
    return null;
  }
}
```
