# NotePipe

> 一键从 Obsidian 复制文本，自动附带文件路径和行号上下文，直接粘贴到 AI Agent 终端。

## 为什么需要 NotePipe？

使用 Claude Code 等终端 AI Agent 工具时，经常需要引用 Obsidian 笔记中的内容。手动操作需要：

1. 复制文件路径
2. 复制选中文本
3. 手动拼接成 `path:line` 格式

NotePipe 将这三步合并为一键操作。

## 功能

- **一键复制上下文**：选中文本后 `Ctrl+Shift+C` / `Cmd+Shift+C`，自动生成 `path:line` 格式引用
- **浮层按钮**：选中文本后在选区附近出现复制按钮
- **多场景支持**：编辑模式、阅读模式、文件列表
- **绝对路径**：默认输出绝对路径，终端中可直接定位文件
- **可配置模板**：自定义输出格式（`{{path}}`, `{{selection}}`, `{{startLine}}` 等变量）
- **中英文双语**：自动跟随 Obsidian 语言设置

## 安装

### 通过 Obsidian 社区插件市场

1. 打开 Obsidian → Settings → Community plugins
2. 搜索 "NotePipe"
3. 点击 Install → Enable

### 手动安装

```bash
cd /your-vault/.obsidian/plugins/
git clone https://github.com/jiezhengj/NotePipe.git
cd NotePipe
npm install
npm run build
```

然后在 Obsidian 中启用插件。

## 使用

### 基本操作

| 场景 | 操作 | 输出示例 |
|------|------|---------|
| 编辑模式选中文本 | `Ctrl/Cmd+Shift+C` | `/path/to/vault/note.md:5\n选中文本` |
| 阅读模式选中文本 | 点击浮层按钮 | `/path/to/vault/note.md:3-7\n多行文本` |
| 文件列表选中文件 | `Ctrl/Cmd+Shift+P` → Copy with context | `/path/to/vault/note1.md` |

### 模板变量

在设置中自定义输出格式：

| 变量 | 说明 |
|------|------|
| `{{path}}` | 文件路径（绝对路径或 vault 相对路径） |
| `{{fileName}}` | 文件名（无扩展名） |
| `{{startLine}}` | 起始行号 |
| `{{endLine}}` | 结束行号 |
| `{{selection}}` | 选中文本 |
| `{{lines}}` | 人类可读行范围（"Line 5" / "Lines 3-7"） |
| `{{folder}}` | 父文件夹路径 |

### 路径模式

- **绝对路径**（默认）：`/Users/xxx/vault/note.md:5` — 终端中可直接定位
- **库相对路径**：`note.md:5` — 适合跨机器或粘贴到笔记中

## 快捷键冲突

| 平台 | 已知冲突 | 解决方案 |
|------|---------|---------|
| Windows | Windows Terminal 默认 `Ctrl+Shift+C` 为复制 | 在 Obsidian Settings → Hotkeys 中自定义 |
| Linux | GNOME Terminal / Konsole 等占用 `Ctrl+Shift+C` | 同上，或使用命令面板触发 |
| macOS | `Cmd+Shift+C` 通常无冲突 | 如有冲突同样可自定义 |

## 开发

```bash
git clone https://github.com/jiezhengj/NotePipe.git
cd NotePipe
npm install
npm run dev    # 开发模式（watch）
npm run build  # 生产构建
```

### 项目结构

```
src/
├── main.ts                  # 插件入口
├── settings.ts              # 设置接口和设置页面
├── template-engine.ts       # 模板引擎（纯函数）
├── context-resolver.ts      # 多场景上下文解析器
├── floating-button.ts       # 浮层按钮（CM6 widget + DOM overlay）
├── copy-interceptor.ts      # 始终复制模式
└── i18n/
    ├── index.ts             # t() 翻译函数
    └── locales/
        ├── en.ts            # 英文
        └── zh.ts            # 中文
```

## License

MIT
