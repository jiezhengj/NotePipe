# Build a plugin

## 学习目标

- 配置 Obsidian 插件开发环境
- 从源码编译插件
- 修改代码后重新加载插件

## 前置条件

- 本地安装 Git
- Node.js 本地开发环境
- 代码编辑器（如 VS Code）

> ⚠️ 切勿在主 vault 中开发插件，应始终使用独立的 vault 专门用于开发。

## 步骤 1：下载示例插件

```bash
cd path/to/vault
mkdir .obsidian/plugins
cd .obsidian/plugins
git clone https://github.com/obsidianmd/obsidian-sample-plugin.git
```

## 步骤 2：构建插件

```bash
cd obsidian-sample-plugin
npm install
npm run dev
```

`npm run dev` 会持续运行，当源码发生修改时自动重建。编译完成后，目录中会生成 `main.js` 文件。

## 步骤 3：启用插件

1. 在 Obsidian 中打开 **Settings**
2. 侧边菜单选择 **Community plugins**
3. 点击 **Turn on community plugins**
4. 在 **Installed plugins** 中，打开 **Sample Plugin** 的开关

## 步骤 4：更新插件清单

修改 `manifest.json` 以重命名插件：

1. 将 `id` 改为唯一标识，如 `"hello-world"`
2. 将 `name` 改为易读名称，如 `"Hello world"`
3. 将插件文件夹名称改为与 `id` 一致
4. **重启 Obsidian**（修改 `manifest.json` 后必须重启）

## 步骤 5：修改源码

```ts
import { Notice, Plugin } from 'obsidian';

export default class HelloWorldPlugin extends Plugin {
  onload() {
    this.addRibbonIcon('dice', 'Greet', () => {
      new Notice('Hello, world!');
    });
  }
}
```

修改源码后必须重新加载插件（禁用再启用，或使用命令面板 **Reload app without saving**）。

> 💡 安装 [Hot-Reload](https://github.com/pjeby/hot-reload) 插件可在开发时自动重载。

## 核心循环

```
修改源码 → 编译 → 重新加载 → 测试
```

- 源码修改后：命令面板 **Reload app without saving**
- `manifest.json` 修改后：**必须完整重启 Obsidian**
