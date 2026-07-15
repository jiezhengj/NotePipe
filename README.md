# NotePipe

> 一键将 Obsidian 选中文本复制为 `path:line` 格式，直接粘贴到 AI Agent 终端。
> One-click copy from Obsidian — paste directly into AI agent terminals with file path and line number context.

---

## 预览 / Preview

选中文本 → 点击浮层按钮 → 粘贴到终端
Select text → click the floating button → paste into terminal

<p align="center">
  <img src="docs/NotePipe01.png" width="60%" alt="在 Obsidian 中选中文本后出现浮层复制按钮" />
  <br/>
  <em>在 Obsidian 中选中文本，浮层按钮出现在选区右上角</em>
</p>

<p align="center">
  <img src="docs/NotePipe02.png" width="60%" alt="粘贴到终端后的 Markdown 引用块格式" />
  <br/>
  <em>粘贴到终端：Markdown 引用块格式，路径 + 行号 + 内容，与人类输入明确区分</em>
</p>

---

## 这是什么？ / What is this?

在 Claude Code 等终端 AI Agent 工具中引用 Obsidian 笔记时，通常需要：

1. 复制文件路径
2. 复制选中文本
3. 手动拼接成 `path:line` 格式

**NotePipe** 将这三步合并为一键操作。

> When referencing Obsidian notes in CLI AI agents (Claude Code, etc.), you normally need to manually copy the file path, copy the selected text, and stitch them together. NotePipe does it all in one keystroke.

## 功能 / Features

| | |
|---|---|
| 🔗 **一键复制上下文** | 选中文本后 `Ctrl+Shift+C` / `Cmd+Shift+C`，自动附带路径和行号 |
| 🎯 **浮层按钮** | 选中文本后在选区右上角出现复制按钮 |
| 📝 **多场景支持** | 编辑模式、阅读模式、文件列表 |
| 📂 **绝对路径** | 默认输出绝对路径，终端中可直接定位文件 |
| 🧩 **可配置模板** | 自定义输出格式，支持 7 个模板变量 |
| 🌐 **中英文双语** | 自动跟随 Obsidian 语言设置 |

## 安装 / Install

### 社区插件市场 / Community Plugin

> 搜索 "NotePipe" → Install → Enable

### 手动安装 / Manual

```bash
cd /your-vault/.obsidian/plugins/
git clone https://github.com/jiezhengj/NotePipe.git
cd NotePipe
npm install
npm run build
```

然后在 Obsidian 中启用插件。

## 使用 / Usage

### 基本操作 / Quick Start

| 场景 / Scenario | 操作 / Action | 输出 / Output |
|---|---|---|
| 编辑模式选中文本 | `Cmd/Ctrl+Shift+C` | `> /path/note.md:5`<br>`> 选中文本` |
| 阅读模式选中文本 | 点击浮层按钮 | `> /path/note.md:3-7`<br>`> 多行选中内容` |
| 文件列表选中文件 | 命令面板 → Copy | `> /path/note1.md` |

### 模板变量 / Template Variables

在设置中自定义格式 / Customize in settings:

| 变量 / Variable | 说明 / Description |
|---|---|
| `{{path}}` | 文件路径 / File path |
| `{{fileName}}` | 文件名（无扩展名）/ Filename without extension |
| `{{startLine}}` | 起始行号 / Start line number |
| `{{endLine}}` | 结束行号 / End line number |
| `{{selection}}` | 选中文本 / Selected text |
| `{{lines}}` | 行范围 / Line range ("Line 5" / "Lines 3-7") |
| `{{folder}}` | 父文件夹 / Parent folder |

### 路径模式 / Path Mode

| 模式 / Mode | 示例 / Example | 适用场景 |
|---|---|---|
| **absolute**（默认） | `/Users/xxx/vault/note.md:5` | 终端中直接定位文件 |
| **vault-relative** | `notes/daily.md:5` | 跨机器引用 |

## 快捷键冲突 / Hotkey Conflicts

| 平台 / Platform | 冲突 / Conflict | 解决 / Solution |
|---|---|---|
| Windows | Terminal 占用 `Ctrl+Shift+C` | Obsidian Settings → Hotkeys 自定义 |
| Linux | GNOME/Konsole 占用 `Ctrl+Shift+C` | 同上，或使用命令面板 |
| macOS | 一般无冲突 | 如有冲突同样可自定义 |

## 开发 / Development

```bash
git clone https://github.com/jiezhengj/NotePipe.git
cd NotePipe
npm install
npm run dev    # 开发模式 / watch mode
npm run build  # 生产构建 / production build
```

### 项目结构 / Project Structure

```
src/
├── main.ts                  # 插件入口 / Plugin entry
├── settings.ts              # 设置接口与页面 / Settings
├── template-engine.ts       # 模板引擎 / Template engine
├── context-resolver.ts      # 上下文解析 / Context resolver
├── floating-button.ts       # 浮层按钮 / Floating button
├── copy-interceptor.ts      # 始终复制模式 / Always-copy mode
└── i18n/
    ├── index.ts             # t() 翻译函数 / Translation
    └── locales/
        ├── en.ts            # 英文 / English
        └── zh.ts            # 中文 / Chinese
```

## License

MIT
