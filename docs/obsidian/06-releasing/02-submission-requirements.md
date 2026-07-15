# Submission requirements for plugins

## `fundingUrl`

仅用于链接到接受财务支持的服务的 URL。如果不接受捐赠，从 manifest 中删除此字段。

## 设置合适的 `minAppVersion`

设置为插件兼容的最低 Obsidian 版本。如不确定，使用最新稳定版本号。

## 保持描述简短

- 遵循 Obsidian 风格指南
- 最多 250 个字符
- 以句号 `.` 结尾
- 避免使用 emoji 或特殊字符
- 正确大写首字母（如 "Obsidian"、"Markdown"、"PDF"）
- 避免以 "This is a plugin" 开头

## Node.js 和 Electron API 仅限桌面端

如果插件使用了 Node.js/Electron API，**必须**在 `manifest.json` 中设置 `isDesktopOnly: true`。

> 💡 许多 Node.js 功能有 Web API 替代：
> - `SubtleCrypto` 替代 `crypto`
> - `navigator.clipboard` 替代 clipboard 功能

## 命令 ID 中不要包含插件 ID

Obsidian 会自动为命令 ID 添加插件 ID 前缀。

## 删除所有示例代码

示例插件中的代码仅用于帮助你开始，提交前必须清除。
