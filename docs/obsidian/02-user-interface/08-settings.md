# Settings

设置让用户可以自行配置插件的部分功能。

> ⚠️ **需要 Obsidian 1.13.0+**：声明式设置 API（`getSettingDefinitions()`）需要 Obsidian 1.13.0+。如需支持更早版本，使用传统 `display()` 方式。

## 基本模式

```ts
import { Plugin } from 'obsidian';
import { ExampleSettingTab } from './settings';

interface ExamplePluginSettings {
  sampleValue: string;
}

const DEFAULT_SETTINGS: Partial<ExamplePluginSettings> = {
  sampleValue: 'Lorem ipsum',
};

export default class ExamplePlugin extends Plugin {
  settings: ExamplePluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new ExampleSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

## 设置定义

```ts
import ExamplePlugin from './main';
import { App, PluginSettingTab } from 'obsidian';

export class ExampleSettingTab extends PluginSettingTab {
  plugin: ExamplePlugin;

  constructor(app: App, plugin: ExamplePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions() {
    return [
      {
        name: 'Default value',
        control: {
          type: 'text',
          key: 'sampleValue',
          placeholder: 'Lorem ipsum',
        },
      },
    ];
  }
}
```

每个 `control` 的 `key` 对应 `this.plugin.settings` 上的属性名。Obsidian 自动读取当前值、写入变更并调用 `saveData()`。

## 定义形状

`getSettingDefinitions()` 返回的每个条目可以是：

| 类型 | 说明 |
|------|------|
| 带 `control` 的设置 | 声明式绑定到一个设置键 |
| 带 `render` 的设置 | 完全控制 `Setting` 行，用于副作用或自定义 UI |
| 带 `action` 的设置 | 可点击行，常用于列表 |
| 无 control/render/action | 仅名称/描述行，用于标题或静态信息 |
| `SettingDefinitionGroup` | 带标题的嵌套定义列表 |
| `SettingDefinitionList` | 带添加/删除/排序的列表 |
| `SettingDefinitionPage` | 可导航的子页面 |

> ⚠️ `control`、`render` 和 `action` 互斥。
> ⚠️ `getSettingDefinitions()` 应保持轻量，不要执行文件读取或网络调用。

## 控件类型

| 类型 | 存储值 | 备注 |
|------|--------|------|
| `toggle` | `boolean` | |
| `text` | `string` | 可选 `placeholder` |
| `textarea` | `string` | 可选 `placeholder`, `rows` |
| `number` | `number` | 可选 `min`, `max`, `step`, `placeholder` |
| `slider` | `number` | `min`, `max`, `step` 均为必填 |
| `dropdown` | `string` | `options: { value: '显示名', … }` |
| `file` | `string` (路径) | 可选 `filter: (file: TFile) => boolean` |
| `folder` | `string` (路径) | 可选 `filter`, `includeRoot` |
| `color` | `string` (hex) | |

### 示例

**Toggle**:
```ts
{ name: 'Open in foreground', control: { type: 'toggle', key: 'openInForeground' } }
```

**Text**:
```ts
{ name: 'Folder name', control: { type: 'text', key: 'folder', placeholder: '/' } }
```

**Textarea**:
```ts
{ name: 'Notes', control: { type: 'textarea', key: 'notes', rows: 4 } }
```

**Number**:
```ts
{ name: 'Cache size (MB)', control: { type: 'number', key: 'cacheMb', min: 1, max: 500, defaultValue: 50 } }
```

**Slider**:
```ts
{ name: 'Volume', control: { type: 'slider', key: 'volume', min: 0, max: 100, step: 1 } }
```

**Dropdown**:
```ts
{
  name: 'Default mode',
  control: {
    type: 'dropdown',
    key: 'mode',
    defaultValue: 'edit',
    options: { edit: 'Editing', read: 'Reading' },
  },
}
```

**File**:
```ts
{
  name: 'Template file',
  control: { type: 'file', key: 'template', filter: (file) => file.extension === 'md' },
}
```

**Folder**:
```ts
{
  name: 'Output folder',
  control: { type: 'folder', key: 'outputDir', includeRoot: true },
}
```

**Color**:
```ts
{ name: 'Accent color', control: { type: 'color', key: 'accent' } }
```

## 暂无一等控件的模式

以下模式需要通过 `render` 回调实现：
- Moment 格式输入 — `addMomentFormat()`
- 进度条 — `addProgressBar()`
- 自定义建议器 — `addSearch()` + `AbstractInputSuggest` 子类
- 多按钮行 — 链式 `addButton()`
- 独立按钮 — 带 `action` 的定义

## 输入验证

每个 `control` 可选 `validate` 回调：

```ts
{
  name: 'File extension',
  control: {
    type: 'text',
    key: 'extension',
    validate: (value) =>
      /\s/.test(value) ? 'Extension cannot contain spaces.' : undefined,
  },
}
```

异步验证器也支持：返回 `Promise<string | void>`。

> ⚠️ `validate` 是 UI 层面的检查，不是数据不变量。存储的值可能已经无效（如旧版本保存的数据）。

## 条件可见性和禁用

- `visible` — 返回 `false` 时隐藏行
- `disabled` — 禁用交互但不隐藏

```ts
getSettingDefinitions() {
  return [
    {
      name: 'Enable advanced mode',
      control: { type: 'toggle', key: 'advanced' },
    },
    {
      name: 'Debug log level',
      desc: 'Only relevant when advanced mode is on.',
      visible: () => this.plugin.settings.advanced,
      control: {
        type: 'dropdown',
        key: 'logLevel',
        defaultValue: 'info',
        options: { info: 'Info', verbose: 'Verbose' },
      },
    },
  ];
}
```

## 自定义设置存储

如果插件不将设置存储在 `this.plugin.settings`，覆盖 `getControlValue` 和 `setControlValue`。

## 分组（Groups）

```ts
{
  type: 'group',
  heading: 'Advanced',
  items: [
    { name: 'Debug logging', control: { type: 'toggle', key: 'debug' } },
    { name: 'Cache size (MB)', control: { type: 'number', key: 'cacheMb', min: 1 } },
  ],
}
```

## 列表（Lists）

用于用户可以增删排序的设置行：

```ts
{
  type: 'list',
  heading: 'Watched folders',
  emptyState: 'No folders being watched yet.',
  addItem: {
    name: 'Add folder',
    action: () => this.openAddFolderModal(),
  },
  onReorder: async (oldIndex, newIndex) => {
    let folders = this.plugin.settings.folders;
    let [moved] = folders.splice(oldIndex, 1);
    folders.splice(newIndex, 0, moved);
    await this.plugin.saveData(this.plugin.settings);
  },
  onDelete: async (idx) => {
    this.plugin.settings.folders.splice(idx, 1);
    await this.plugin.saveData(this.plugin.settings);
    this.update();
  },
  items: this.plugin.settings.folders.map((path) => ({
    name: path,
    searchable: false,
  })),
}
```

## 子页面（Sub-pages）

声明式子页面：

```ts
{
  type: 'page',
  name: 'Advanced',
  desc: 'Power-user options.',
  items: [
    { name: 'Debug logging', control: { type: 'toggle', key: 'debug' } },
  ],
}
```

命令式子页面（继承 `SettingPage`）：

```ts
class StatusPage extends SettingPage {
  constructor(private plugin: MyPlugin) {
    super();
    this.title = 'Status';
  }

  display() {
    this.containerEl.empty();
    let stats = this.plugin.computeStats();
    this.containerEl.createEl('h3', { text: `${stats.totalEntries} entries` });
  }
}
```

## Render 回调

用于副效应或自定义 UI：

```ts
{
  name: 'Enable feature X',
  render: (setting) => {
    setting.addToggle((toggle) => toggle
      .setValue(this.plugin.settings.featureX)
      .onChange(async (value) => {
        this.plugin.settings.featureX = value;
        await this.plugin.saveData(this.plugin.settings);
      }));
  },
}
```

> ⚠️ `render` 不会自动保存。需手动调用 `await this.plugin.saveData()`。

## 样式指南

- UI 文本使用 **Sentence case**
- 不在标签顶部添加 "General" 或插件名标题
- 仅多个分区时才添加标题
- 标题不包含 "settings" 一词
- 修改即保存，不用提交按钮
- 每行一个控件
- 避免在主标签中使用 textarea
- 描述保持简短

## 传统 `display()` 方式（Obsidian < 1.13.0）

```ts
export class ExampleSettingTab extends PluginSettingTab {
  plugin: ExamplePlugin;

  constructor(app: App, plugin: ExamplePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Default value')
      .addText((text) =>
        text
          .setPlaceholder('Lorem ipsum')
          .setValue(this.plugin.settings.sampleValue)
          .onChange(async (value) => {
            this.plugin.settings.sampleValue = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
```

### 额外的传统组件

**标题**：`new Setting(containerEl).setName('Defaults').setHeading();`

**搜索建议**：实现 `AbstractInputSuggest` 类

**Moment 格式**：`addMomentFormat()`

**按钮**：`addButton()` / `addExtraButton()`

**进度条**：`addProgressBar((bar) => bar.setValue(50));`
