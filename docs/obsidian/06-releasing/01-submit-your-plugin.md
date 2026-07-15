# Submit your plugin

将插件提交到 [community.obsidian.md](https://community.obsidian.md)，审核通过后用户可直接在 Obsidian 内安装。

你只需要提交初始版本，后续更新用户可直接从 GitHub Release 获取。

## 前置条件

- [GitHub](https://github.com/signup) 账户
- [Obsidian](https://obsidian.md) 账户

## 开始前准备

确保仓库根目录有以下文件：

- `README.md` — 描述插件用途和使用方法
- `LICENSE` — 确定许可条款
- `manifest.json` — 描述插件

确保遵循 Developer policies 和 Submission requirements。

## 步骤 1：发布插件到 GitHub

（如果从模板仓库创建，可跳过此步）

## 步骤 2：创建 Release

1. 在 `manifest.json` 中更新 `version`（遵循语义化版本规范，格式 `x.y.z`）
2. [创建 GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release)，Tag 版本必须与 `manifest.json` 中的版本匹配
3. 上传以下文件作为附件：
   - `main.js`
   - `manifest.json`
   - `styles.css`（可选）

## 步骤 3：提交到社区目录

1. 前往 [community.obsidian.md](https://community.obsidian.md) 使用 Obsidian 账户登录
2. 关联 GitHub 账户
3. 侧边栏选择 **Plugins** → **New plugin**
4. 输入 GitHub 仓库 URL
5. 审阅并同意 Developer policies
6. 选择 **Submit**

> ℹ️ 目录处理仓库默认分支 HEAD 上的 `manifest.json`。`id` 必须在所有已发布插件中唯一，且不能包含 `obsidian`。

## 步骤 4：处理审核反馈

提交后插件会自动审核。根据反馈更新仓库并发布新 Release。

审核通过后可到以下渠道发布公告：
- 论坛 [Share & showcase](https://forum.obsidian.md/c/share-showcase/9)
- Discord `#updates` 频道（需要 `developer` 角色）
