# NotePipe — Obsidian 插件开发方案

## Context

### 问题
在终端 CLI 版本的 AI Agent 工具（如 Claude Code）中，用户从 Obsidian 引用笔记内容时需要：
1. 手动复制文件路径
2. 手动复制选中文本
3. 手动拼接成 `path:line` 格式
→ 操作繁琐，打断工作流

### 目标
开发 NotePipe Obsidian 插件，让用户在 Obsidian 中选中文本后，一键复制即自动附带文件路径 + 行号上下文，直接粘贴到终端即可被 AI 工具解析。

### 用户偏好
- **触发方式**：独立快捷键（默认 Ctrl+Shift+C / Cmd+Shift+C）+ 选中文本后出现浮层按钮
- **输出格式**：路径引用 + 内容（`path:line\n文本`）
- **范围**：全范围支持（编辑器编辑/阅读模式 + 文件列表 + 搜索结果等）
- **语言**：中文 / 英文双语支持，自动跟随 Obsidian 语言设置

---

## 跨平台兼容性

### 目标平台

NotePipe 面向 Obsidian 桌面端（macOS / Windows / Linux），兼顾移动端（iOS / Android）基础功能。

### 已天然跨平台的设计

NotePipe 作为 Obsidian 插件，运行于 Electron 沙箱内，以下设计天然跨平台：

| 层面 | 说明 |
|------|------|
| 运行环境 | Electron + Chromium 渲染引擎，OS 无关 |
| 编辑器 | CodeMirror 6，纯 JS 实现，与 OS 无关 |
| 剪贴板 | `navigator.clipboard.writeText()`，标准 Web API |
| 文件路径 | Obsidian API 产出 vault 相对路径，统一使用正斜杠 `/` |
| UI 渲染 | DOM + CSS，Obsidian 主题系统跨平台一致 |

### 需要主动处理的差异点

#### 快捷键冲突

默认快捷键 `Mod+Shift+C`（macOS → `Cmd+Shift+C`，Win/Linux → `Ctrl+Shift+C`）在不同平台存在已知冲突：

| 平台 | 冲突场景 |
|------|---------|
| Windows | Windows Terminal 默认使用 `Ctrl+Shift+C` 复制；部分应用占用 |
| Linux | GNOME Terminal / Tilix / Konsole 等用 `Ctrl+Shift+C` 复制，`Ctrl+C` 为 SIGINT |
| macOS | `Cmd+Shift+C` 相对安全，但 VS Code / iTerm2 中可能冲突 |

**应对策略**：
1. 设置页面提供快捷键自定义入口（利用 Obsidian 内置的 hotkey 配置面板，无需自行实现）
2. `enableHotkey` 默认为 `true`，若用户环境冲突可关闭并通过命令面板触发
3. 文档中列出各平台已知冲突及解决方案

#### 换行符差异

模板渲染产生的输出粘贴到终端时，不同平台终端对 `\n` / `\r\n` 的处理存在细微差异。Obsidian 的 `navigator.clipboard.writeText()` 写入的纯文本使用 `\n`，在粘贴到任何平台的终端时均能正确解析，因为所有主流终端模拟器（Windows Terminal、iTerm2、GNOME Terminal 等）均接受 `\n` 作为换行。**无需特殊处理**，但需在 README 中说明预期行为。

#### 构建工具链

`esbuild` 本身跨平台，但 npm scripts 中的 shell 命令在 Windows 上不兼容：

```jsonc
// package.json — 使用跨平台方案
{
  "scripts": {
    "dev": "node esbuild.config.mjs",           // 纯 Node，跨平台
    "build": "node esbuild.config.mjs production" // 避免使用 && / rm / cp 等 shell 命令
  }
}
```

**规则**：所有构建逻辑放入 `esbuild.config.mjs`（Node.js 脚本），不在 npm scripts 中使用 shell 操作符（`&&`、`|`、`rm`、`cp` 等）。需要文件操作时使用 Node.js 内置 `fs` 模块。

#### 文件系统大小写敏感性

| 平台 | 文件系统 | 大小写 |
|------|---------|--------|
| macOS | APFS（默认） | 不区分大小写 |
| Linux | ext4 / XFS | 区分大小写 |
| Windows | NTFS | 不区分大小写但保留大小写 |

Obsidian vault 内路径由 Obsidian API 统一管理，始终保留原始大小写。插件内部不做路径大小写转换，仅透传 Obsidian API 返回的路径。**无需额外处理**，但文件列表场景中如果涉及路径去重或比较，使用 `===` 精确匹配即可（同一 vault 内路径具有一致性）。

#### 移动端适配

| 功能 | 桌面端 | 移动端 |
|------|--------|--------|
| 编辑器复制 | ✅ | ✅ |
| 快捷键触发 | ✅ | ❌（无物理键盘） |
| 浮层按钮 | ✅ | ✅（需增大触控区域至 ≥44px） |
| 始终复制模式 | ✅ | ❌（禁用，避免移动端性能问题） |
| 绝对路径 | ✅ | ❌（移动端无 `FileSystemAdapter`，降级为 `vault-relative`） |
| 文件列表上下文 | ✅ | ⚠️（需适配触控选中行为） |

### 跨平台测试清单

在 Phase 6 打磨阶段，需至少完成以下冒烟测试：

| 测试场景 | macOS | Windows | Linux |
|---------|-------|---------|-------|
| 编辑模式 Ctrl/Cmd+Shift+C 复制 | ✅ | ✅ | ✅ |
| 阅读模式浮层按钮出现和复制 | ✅ | ✅ | ✅ |
| 模板渲染输出格式正确 | ✅ | ✅ | ✅ |
| 绝对路径可在终端中直接定位 | ✅ | ✅ | ✅ |
| 设置页面各选项持久化 | ✅ | ✅ | ✅ |

---

## 路径策略：绝对路径 vs 库相对路径

### 问题

AI Agent 终端（如 Claude Code）的工作目录（CWD）与 Obsidian vault 根路径完全独立。当前方案产出的 vault 相对路径（如 `notes/daily.md:5`）在终端中拼接 `$(pwd)/` 后将无法定位到实际文件。

**场景示例**：

```
Obsidian vault 根:  /Users/jiezhengj/Documents/MyVault/
Agent 终端 CWD:     /Users/jiezhengj/Documents/Project/NotePipe/

粘贴内容: notes/daily.md:5
终端解析: /Users/jiezhengj/Documents/Project/NotePipe/notes/daily.md  → 文件不存在
```

### 方案选择

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A: 绝对路径（默认）** | 利用 `FileSystemAdapter.getBasePath()` 获取 vault 绝对路径 | Agent 任意 CWD 均可定位；零配置 | 路径含用户名，跨机器不通用 |
| **B: 可配置根路径** | 用户在设置中填写终端 CWD，插件计算相对路径 | 跨机器可移植 | 需手动配置；终端切换目录后失效 |
| **C: vault-relative（保留）** | 仅输出库内相对路径 | 简洁；可粘贴到笔记/文档中引用 | 终端无法直接定位 |

**决策：方案 A 为默认值，方案 C 保留为可选项。**

理由：NotePipe 的核心场景是「Obsidian → AI Agent 终端」，绝对路径零配置、直接可用。跨机器通用性在这个场景中不重要（AI Agent 只在本地运行）。移动端自动降级为 `vault-relative`。

### 实现

```typescript
// context-resolver.ts — 路径格式化
import { FileSystemAdapter } from 'obsidian';

function formatPath(vaultRelativePath: string, pathStyle: PathStyle, app: App): string {
    if (pathStyle === 'absolute') {
        const adapter = app.vault.adapter;
        if (adapter instanceof FileSystemAdapter) {
            const basePath = adapter.getBasePath();
            // Windows: basePath 为 C:\Users\...，拼接时确保使用正斜杠
            return basePath.replace(/\\/g, '/') + '/' + vaultRelativePath;
        }
        // 移动端：降级为 vault-relative
        return vaultRelativePath;
    }
    return vaultRelativePath;
}
```

**Windows 路径规范化**：`FileSystemAdapter.getBasePath()` 在 Windows 上返回 `C:\Users\...` 格式，需统一转换为正斜杠 `/`，确保在终端和代码编辑器中均可点击跳转。主流 Windows 终端（Windows Terminal、PowerShell）均能识别正斜杠路径。

### 设置项扩展

```typescript
pathStyle: 'absolute' | 'vault-relative';
// 默认: 'absolute'
```

设置页面新增说明：绝对路径模式下，粘贴内容中的路径可直接在终端中定位；库相对路径适合跨机器引用或粘贴到笔记中。

---

## 国际化 (i18n)

### 语言检测策略

不自行实现语言切换，直接读取 Obsidian 的语言设置：

```typescript
// src/i18n/index.ts
function getObsidianLanguage(): 'en' | 'zh' {
    // Obsidian 将语言偏好存储在 localStorage
    const lang = localStorage.getItem('language') || 'en';
    // Obsidian 中文设置值为 'zh'
    return lang.startsWith('zh') ? 'zh' : 'en';
}
```

- Obsidian 在 `Settings → About → Language` 中设置语言，值持久化在 `localStorage.language`
- 插件加载时读取一次，运行期间不动态切换（如需切换语言，用户重启 Obsidian 后生效）
- 未知语言统一降级为英文

### 架构

```
src/i18n/
├── index.ts        # t() 函数、语言检测、locale 加载
└── locales/
    ├── en.ts       # 英文字符串
    └── zh.ts       # 中文字符串
```

**零依赖**：不引入第三方 i18n 库。使用简单的 `Record<string, string>` 字典 + `t(key, ...args)` 函数。

### 字符串字典结构

```typescript
// src/i18n/locales/en.ts
export default {
    // 命令
    'command.copyWithContext': 'Copy with context',
    'command.copyWithContextGlobal': 'Copy with context (global)',

    // 通知
    'notice.noContext': 'No context available',
    'notice.noActiveFile': 'No active file',
    'notice.noTextSelected': 'No text selected',
    'notice.copied': 'Copied with context',
    'notice.clipboardUnavailable': 'Clipboard unavailable',
    'notice.truncated': '... (truncated)',

    // 浮层按钮
    'floating.label': 'Copy context',
    'floating.tooltip': 'Copy with file path and line number',

    // 设置
    'settings.templates': 'Templates',
    'settings.templatesDesc': 'Use variables to customize the output format.',
    'settings.singleLine': 'Single-line template',
    'settings.singleLineDesc': 'Used when selection spans a single line.',
    'settings.multiLine': 'Multi-line template',
    'settings.multiLineDesc': 'Used when selection spans multiple lines.',
    'settings.variableReference': 'Available variables',
    'settings.path': 'Path',
    'settings.pathStyle': 'Path format',
    'settings.pathStyleDesc': 'Absolute: full path, ready for terminal use. Vault-relative: portable across machines.',
    'settings.pathAbsolute': 'Absolute',
    'settings.pathVaultRelative': 'Vault-relative',
    'settings.triggers': 'Triggers',
    'settings.showFloatingButton': 'Show floating button',
    'settings.showFloatingButtonDesc': 'Show a floating copy button when text is selected.',
    'settings.enableHotkey': 'Enable hotkey',
    'settings.enableHotkeyDesc': 'Enable Ctrl+Shift+C / Cmd+Shift+C shortcut.',
    'settings.advanced': 'Advanced',
    'settings.alwaysCopy': 'Always copy mode (experimental)',
    'settings.alwaysCopyDesc': 'Automatically copy with context on every text selection. May cause performance issues.',
    'settings.alwaysCopyWarning': '⚠️ Experimental: may conflict with clipboard managers.',
};
```

```typescript
// src/i18n/locales/zh.ts
export default {
    'command.copyWithContext': '复制并附带上下文',
    'command.copyWithContextGlobal': '复制并附带上下文（全局）',

    'notice.noContext': '无可用上下文',
    'notice.noActiveFile': '无活动文件',
    'notice.noTextSelected': '未选中文本',
    'notice.copied': '已复制（附带上下文）',
    'notice.clipboardUnavailable': '剪贴板不可用',
    'notice.truncated': '...（已截断）',

    'floating.label': '复制上下文',
    'floating.tooltip': '复制文件路径和行号',

    'settings.templates': '模板',
    'settings.templatesDesc': '使用变量自定义输出格式。',
    'settings.singleLine': '单行模板',
    'settings.singleLineDesc': '选中单行文本时使用。',
    'settings.multiLine': '多行模板',
    'settings.multiLineDesc': '选中多行文本时使用。',
    'settings.variableReference': '可用变量',
    'settings.path': '路径',
    'settings.pathStyle': '路径格式',
    'settings.pathStyleDesc': '绝对路径：完整路径，可直接在终端定位。库相对路径：跨机器可移植。',
    'settings.pathAbsolute': '绝对路径',
    'settings.pathVaultRelative': '库相对路径',
    'settings.triggers': '触发方式',
    'settings.showFloatingButton': '显示浮层按钮',
    'settings.showFloatingButtonDesc': '选中文本时显示浮层复制按钮。',
    'settings.enableHotkey': '启用快捷键',
    'settings.enableHotkeyDesc': '启用 Ctrl+Shift+C / Cmd+Shift+C 快捷键。',
    'settings.advanced': '高级',
    'settings.alwaysCopy': '始终复制模式（实验性）',
    'settings.alwaysCopyDesc': '每次选中文本时自动附带上下文复制。可能导致性能问题。',
    'settings.alwaysCopyWarning': '⚠️ 实验性功能：可能与剪贴板管理器冲突。',
};
```

### t() 函数

```typescript
// src/i18n/index.ts
import en from './locales/en';
import zh from './locales/zh';

const locales: Record<string, Record<string, string>> = { en, zh };

let currentLang: 'en' | 'zh' = 'en';

export function loadLocale(): void {
    const lang = (typeof localStorage !== 'undefined'
        ? localStorage.getItem('language')
        : null) || 'en';
    currentLang = lang.startsWith('zh') ? 'zh' : 'en';
}

export function t(key: string, ...args: string[]): string {
    const template = locales[currentLang]?.[key] ?? locales['en'][key] ?? key;
    return args.reduce((s, arg, i) => s.replace(`{${i}}`, arg), template);
}

export function getCurrentLanguage(): 'en' | 'zh' {
    return currentLang;
}
```

### 各模块接入方式

所有面向用户的字符串均通过 `t()` 获取：

```typescript
// main.ts — 命令注册
this.addCommand({
    id: 'copy-with-context',
    name: t('command.copyWithContext'),
    editorCallback: (editor, view) => this.copyWithContext(editor, view),
});

// main.ts — 通知
new Notice(t('notice.copied'));

// floating-button.ts — 浮层按钮
btn.title = t('floating.tooltip');
btn.setAttribute('aria-label', t('floating.tooltip'));
```

模板变量 **不翻译**（`{{path}}`、`{{selection}}` 等），保持英文标识符以确保模板字符串的可移植性。

### 语言切换流程

```
插件 onload()
  → loadLocale()
    → 读取 localStorage.language
    → 'zh' / 'zh-cn' / 'zh-tw' → currentLang = 'zh'
    → 其他 → currentLang = 'en'
  → 所有 t() 调用自动使用当前语言
```

无需在设置页面提供语言切换选项——直接跟随 Obsidian 全局设置，零配置。

---

## 文件结构

```
NotePipe/
├── src/
│   ├── main.ts                  # 插件入口：生命周期、命令、模式编排、浮层按钮
│   ├── settings.ts              # 设置接口、DEFAULT_SETTINGS、设置标签页
│   ├── template-engine.ts       # 模板变量替换引擎（纯函数，无 Obsidian 依赖）
│   ├── context-resolver.ts      # 多场景上下文解析器（编辑器/文件列表/搜索等）
│   ├── floating-button.ts       # 选中文本浮层按钮（编辑 + 阅读模式）
│   ├── copy-interceptor.ts      # CM6 扩展 + DOM 监听（"始终复制"模式）
│   └── i18n/
│       ├── index.ts             # t() 函数、loadLocale()、语言检测
│       └── locales/
│           ├── en.ts            # 英文字符串字典
│           └── zh.ts            # 中文字符串字典
├── styles.css                   # 浮层按钮样式
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
└── versions.json
```

---

## 核心架构

### 1. 上下文解析器 `context-resolver.ts`

插件需要处理 **4 种场景**，每种场景的上下文获取策略不同：

| 场景 | 选区来源 | 路径来源 | 行号来源 |
|------|---------|---------|---------|
| 编辑器（编辑模式） | `editor.getSelection()` | `getActiveFile().path` | `editor.getCursor()` |
| 编辑器（阅读模式） | `window.getSelection()` | `getActiveFile().path` | 在文件内容中搜索选区文本 |
| 文件列表 | 选中的文件条目 | `file.path`（可多文件） | 无（仅路径） |
| 搜索结果 | 选中的搜索结果项 | 搜索结果的 `file.path` | 搜索结果的匹配位置 |

统一返回接口：

```typescript
interface ResolvedContext {
    source: 'editor-edit' | 'editor-preview' | 'file-explorer' | 'search-results' | 'unknown';
    path: string;              // vault-relative path
    selection: string | null;  // 选中的文本内容
    startLine: number | null;  // 1-indexed, null 表示无行号
    endLine: number | null;
    files?: string[];          // 文件列表场景多文件支持
}
```

**路径格式化**：统一由 `formatPath()` 处理绝对路径 / 库相对路径切换：

```typescript
import { FileSystemAdapter } from 'obsidian';

function formatPath(vaultRelativePath: string, pathStyle: PathStyle, app: App): string {
    if (pathStyle === 'absolute') {
        const adapter = app.vault.adapter;
        if (adapter instanceof FileSystemAdapter) {
            const basePath = adapter.getBasePath();
            // Windows: 统一转换为正斜杠
            return basePath.replace(/\\/g, '/') + '/' + vaultRelativePath;
        }
        // 移动端：降级为 vault-relative
        return vaultRelativePath;
    }
    return vaultRelativePath;
}
```

**文件列表场景**：选中多个文件时，输出格式为每行一个文件路径 + 空行分隔：
```
folder/file1.md
folder/file2.md

// 或带文件元数据
```

**搜索结果场景**：获取搜索匹配的具体行号和上下文。

### 2. 模板引擎 `template-engine.ts`

支持的模板变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{path}}` | vault 相对路径 | `notes/daily.md` |
| `{{fileName}}` | 文件名（无扩展名） | `daily` |
| `{{startLine}}` | 起始行号（1-indexed） | `5` |
| `{{endLine}}` | 结束行号 | `12` |
| `{{selection}}` | 选中文本 | 原始内容 |
| `{{lines}}` | 人类可读行范围 | `Line 5` 或 `Lines 3-7` |
| `{{folder}}` | 父文件夹路径 | `notes` |

默认模板：

```typescript
// 单行
singleLineTemplate: '{{path}}:{{startLine}}\n{{selection}}'
// 多行
multiLineTemplate: '{{path}}:{{startLine}}-{{endLine}}\n{{selection}}'
```

`\n` 字面量在渲染时转换为实际换行符。

### 3. 浮层按钮 `floating-button.ts`

**行为**：用户在编辑模式或阅读模式下选中文本后，在选区附近出现一个小浮层按钮。

**实现方案**：

- **编辑模式**：通过 CodeMirror 6 的 `ViewPlugin` 监听选区变化，使用 CM6 的 tooltip 机制或 `EditorView.coordsAtPos()` 定位
- **阅读模式**：通过 DOM 的 `mouseup` 事件检测选区，用 `Selection.getRangeAt(0).getBoundingClientRect()` 定位

**浮层设计**：
- 样式：小型圆角按钮，半透明背景，与 Obsidian 主题融合
- 图标：使用 Lucide `clipboard-copy` 或自定义图标
- 位置：选区结束位置下方/上方（避免遮挡）
- 消失：点击按钮后消失，或点击空白区域后消失
- 动画：淡入淡出

**关键实现**：使用 CodeMirror 6 ViewPlugin 在编辑模式中注入浮层：

```typescript
// 编辑模式浮层
class FloatingButtonPlugin implements PluginValue {
    decorations: DecorationSet;
    
    constructor(view: EditorView) {
        this.decorations = this.buildButton(view);
    }
    
    update(update: ViewUpdate) {
        if (update.selectionSet || update.docChanged) {
            this.decorations = this.buildButton(update.view);
        }
    }
    
    buildButton(view: EditorView): DecorationSet {
        const selection = view.state.selection.main;
        if (selection.empty) return Decoration.none;
        
        // 在选区末尾创建 widget
        const widget = Decoration.widget({
            widget: new CopyButtonWidget(view, selection),
            side: -1  // 放在选区后面
        });
        
        return Decoration.set([widget.range(selection.to)]);
    }
}
```

**阅读模式浮层**：通过 DOM 事件监听 `mouseup`：

```typescript
this.registerDomEvent(document, 'mouseup', (event: MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
        this.hideFloatingButton();
        return;
    }
    
    // 检查选区是否在 Markdown 预览视图内
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || view.getMode() !== 'preview') return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    this.showFloatingButton(rect);
});
```

### 4. 设置 `settings.ts`

```typescript
interface NotePipeSettings {
    // 模板
    singleLineTemplate: string;
    multiLineTemplate: string;
    
    // 路径格式
    pathStyle: 'absolute' | 'vault-relative';
    
    // 触发选项
    showFloatingButton: boolean;    // 是否显示浮层按钮
    enableHotkey: boolean;          // 是否启用快捷键
    
    // 始终复制模式（实验性）
    enableAlwaysCopy: boolean;
}
```

设置页面布局（声明式 API）：

- **Templates** 分组：
  - `textarea` — 单行模板
  - `textarea` — 多行模板
  - 变量参考只读说明
- **Path** 分组：
  - `dropdown` — 路径格式（`absolute` 默认 / `vault-relative`）
  - 说明文字：绝对路径可直接在终端定位；库相对路径适合跨机器引用或粘贴到笔记中
- **Triggers** 分组：
  - `toggle` — 显示浮层按钮
  - `toggle` — 启用快捷键
- **Advanced** 分组：
  - `toggle` — 始终复制模式（实验性，含警告说明）

### 5. 主入口 `main.ts`

```typescript
export default class NotePipePlugin extends Plugin {
    settings: NotePipeSettings;
    floatingButton: FloatingButtonManager;
    
    async onload() {
        await this.loadSettings();
        
        // 国际化：在注册命令/UI 之前加载语言
        loadLocale();
        
        this.addSettingTab(new NotePipeSettingTab(this.app, this));
        
        // 注册命令（编辑模式 + 通用模式两条）
        this.addCommand({
            id: 'copy-with-context',
            name: t('command.copyWithContext'),
            editorCallback: (editor, view) => this.copyWithContext(editor, view),
            hotkeys: this.settings.enableHotkey 
                ? [{ modifiers: ['Mod', 'Shift'], key: 'c' }] 
                : undefined,
        });
        
        // 阅读模式也注册一个 callback 命令
        this.addCommand({
            id: 'copy-with-context-global',
            name: t('command.copyWithContextGlobal'),
            callback: () => this.copyGlobalContext(),
        });
        
        // 浮层按钮
        if (this.settings.showFloatingButton) {
            this.floatingButton = new FloatingButtonManager(this);
            this.floatingButton.activate();
        }
        
        // 始终复制模式
        if (this.settings.enableAlwaysCopy) {
            this.registerEditorExtension(copyInterceptorExtension(this));
            this.registerGlobalCopyInterceptor();
        }
    }
    
    async copyWithContext(editor?: Editor, view?: MarkdownView): Promise<void> {
        // 1. 解析上下文
        const context = resolveContext(this.app, editor, view);
        if (!context) { new Notice(t('notice.noContext')); return; }
        
        // 2. 选择模板
        const isMultiLine = (context.endLine ?? context.startLine ?? 0) > (context.startLine ?? 0);
        
        // 文件列表场景有特殊处理
        if (context.source === 'file-explorer' && context.files) {
            await this.copyFileList(context.files);
            return;
        }
        
        const template = isMultiLine
            ? this.settings.multiLineTemplate
            : this.settings.singleLineTemplate;
        
        // 3. 渲染
        const formatted = renderTemplate(template, context);
        
        // 4. 写入剪贴板
        await navigator.clipboard.writeText(formatted);
        new Notice(t('notice.copied'));
    }
}
```

---

## 上下文解析器详细设计

### 编辑器（编辑模式）
```typescript
function resolveEditorContext(editor: Editor, file: TFile): ResolvedContext {
    const selection = editor.getSelection();
    const from = editor.getCursor('from');
    const to = editor.getCursor('to');
    
    return {
        source: 'editor-edit',
        path: file.path,
        selection: selection || null,
        startLine: from.line + 1,
        endLine: to.line + 1,
    };
}
```

### 编辑器（阅读模式）
```typescript
async function resolvePreviewContext(file: TFile): Promise<ResolvedContext | null> {
    const selection = window.getSelection()?.toString();
    if (!selection) return null;
    
    const content = await app.vault.cachedRead(file);
    const index = content.indexOf(selection);
    
    let startLine = null, endLine = null;
    if (index !== -1) {
        const before = content.substring(0, index);
        startLine = before.split('\n').length;
        endLine = startLine + selection.split('\n').length - 1;
    }
    
    return {
        source: 'editor-preview',
        path: file.path,
        selection,
        startLine,
        endLine,
    };
}
```

### 文件列表
```typescript
function resolveFileExplorerContext(): ResolvedContext | null {
    // 通过 DOM 查询文件列表中选中的条目
    const selectedItems = document.querySelectorAll('.nav-file.is-selected, .nav-folder.is-selected');
    if (selectedItems.length === 0) return null;
    
    const files: string[] = [];
    selectedItems.forEach(item => {
        const titleEl = item.querySelector('.nav-file-title-content, .nav-folder-title-content');
        if (titleEl) {
            const path = titleEl.getAttribute('data-path') || titleEl.textContent || '';
            if (path) files.push(path);
        }
    });
    
    return {
        source: 'file-explorer',
        path: '',  // 多文件时无单一路径
        selection: null,
        startLine: null,
        endLine: null,
        files,
    };
}
```

> ⚠️ 文件列表场景依赖 DOM 查询，Obsidian 内部 DOM 结构可能随版本变化。需要设置保守的 `minAppVersion` 并考虑备选方案（如通过注册文件菜单事件而非直接查询 DOM）。

### 搜索结果
```typescript
function resolveSearchContext(): ResolvedContext | null {
    // 从搜索视图获取当前匹配项
    const searchLeaf = app.workspace.getLeavesOfType('search')[0];
    if (!searchLeaf) return null;
    
    // 通过 search view 的内部状态获取当前匹配
    // Obsidian 的 search leaf 提供了 getViewState() 
    // 需要探索具体的 API 获取搜索结果
    // ...
}
```

> ⚠️ 搜索结果场景的 API 访问较为复杂，应作为 Phase 2 实现。

---

## 浮层按钮详细设计

### 编辑模式浮层 (CodeMirror 6 ViewPlugin)

```typescript
class CopyButtonWidget extends WidgetType {
    constructor(private view: EditorView, private selection: EditorSelection) {
        super();
    }
    
    toDOM(): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'notepipe-copy-btn';
        btn.innerHTML = '<svg>...</svg>'; // clipboard-copy 图标
        btn.title = 'Copy with context';
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // 通过自定义事件通知插件
            this.view.dispatch({
                effects: triggerCopyEffect.of(null)
            });
        });
        return btn;
    }
}
```

### 阅读模式浮层 (DOM Positioned Overlay)

```typescript
class FloatingButtonManager {
    private buttonEl: HTMLElement | null = null;
    
    showAtPosition(rect: DOMRect) {
        if (!this.buttonEl) {
            this.buttonEl = document.createElement('button');
            this.buttonEl.className = 'notepipe-floating-btn';
            this.buttonEl.innerHTML = '📋 Copy context';
            this.buttonEl.addEventListener('click', () => {
                this.plugin.copyGlobalContext();
                this.hide();
            });
            document.body.appendChild(this.buttonEl);
        }
        
        // 定位于选区末尾下方
        this.buttonEl.style.top = `${rect.bottom + 8}px`;
        this.buttonEl.style.left = `${rect.right - 40}px`;
        this.buttonEl.style.display = 'block';
    }
    
    hide() {
        if (this.buttonEl) {
            this.buttonEl.style.display = 'none';
        }
    }
}
```

---

## 边界情况

| 场景 | 处理 |
|------|------|
| 无活动文件 | `Notice(t('notice.noActiveFile'))`，放弃 |
| 编辑模式无选区 | 复制当前光标行上下文 |
| 阅读模式无选区 | `Notice(t('notice.noTextSelected'))`，放弃 |
| 选区文本在文件中找不到（阅读模式） | 行号用 `?` 替代 |
| 超大选区 (>100KB) | 截断并添加 `t('notice.truncated')` |
| 同时有编辑器和文件列表选区 | 优先编辑器 |
| 剪贴板 API 不可用 | `Notice(t('notice.clipboardUnavailable'))` |
| 语言设置缺失/非 zh/en | 降级为英文，不报错 |
| 移动端 | 浮层按钮正常工作（触控区域 ≥44px）；始终复制模式禁用 |
| 移动端绝对路径 | `FileSystemAdapter` 不可用，自动降级为 `vault-relative` |
| Windows 路径 | `getBasePath()` 返回 `C:\...`，统一 `replace(/\\/g, '/')` 转换 |
| 快捷键冲突（Win/Linux Ctrl+Shift+C） | 用户可通过 Obsidian 内置 Hotkey 面板自定义；也可关闭 `enableHotkey` 仅用命令面板 |
| 多 Vault | Vault API 返回 vault 相对路径，自动正确处理 |
| 浮层与主题冲突 | 使用 CSS 变量继承主题颜色 |
| 构建脚本 Windows 兼容 | 所有逻辑放入 `esbuild.config.mjs`（Node.js），npm scripts 中不使用 shell 命令 |

---

## 实施顺序

### Phase 1：项目脚手架
创建 `manifest.json`、`package.json`、`tsconfig.json`、`esbuild.config.mjs`、空 `styles.css`、`versions.json`

- `package.json` 的 `scripts` 中所有逻辑通过 `node esbuild.config.mjs` 调用，避免使用 `&&`、`rm`、`cp` 等 shell 命令，确保 Windows 兼容
- `esbuild.config.mjs` 中使用 `fs` 模块处理文件复制（如 `main.js` → 构建输出）

### Phase 2：核心模块
- `i18n/index.ts` + `locales/en.ts` + `locales/zh.ts` — 国际化框架和字符串字典
- `template-engine.ts` — 纯函数模板引擎
- `context-resolver.ts` — 编辑器编辑模式 + 阅读模式上下文解析（含 `formatPath()`）
- `settings.ts` — 设置接口和标签页

### Phase 3：插件主体
- `main.ts` — 插件类、命令注册、核心 `copyWithContext()` 方法

### Phase 4：浮层按钮
- `floating-button.ts` — 编辑模式 CodeMirror 6 widget + 阅读模式 DOM overlay
- `styles.css` — 浮层按钮样式

### Phase 5：高级功能
- 文件列表和搜索结果上下文支持
- `copy-interceptor.ts` — 始终复制模式
- 设置页面模板预览

### Phase 6：打磨
- 边界情况处理
- 端到端测试
- 跨平台冒烟测试（macOS / Windows / Linux 各至少一次完整流程验证）
- README 文档（含各平台已知快捷键冲突说明）

---

## 验证方式

1. **编辑模式测试**：在 Obsidian 开发 vault 中打开笔记，选中多行文本，Ctrl+Shift+C，粘贴到终端验证格式
2. **阅读模式测试**：切换到阅读模式，选中文本，使用命令面板触发，验证浮层按钮出现和功能
3. **浮层按钮测试**：选中文本后在选区附近确认浮层出现，点击按钮验证复制结果
4. **设置测试**：修改模板后验证输出格式变化
5. **端到端**：从 Obsidian 复制上下文 → 粘贴到 Claude Code 终端 → 验证 AI 能正确解析 `path:line` 引用
