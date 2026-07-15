# Vault

每个 Obsidian 中的笔记集合称为 Vault。Vault 由文件夹及其子文件夹组成。

> ℹ️ Vault API 仅允许访问应用中可见的文件。通过 Adapter API 可以访问隐藏文件夹中的文件。

## 列出文件

```ts
const files = this.app.vault.getMarkdownFiles()

for (let i = 0; i < files.length; i++) {
  console.log(files[i].path);
}
```

> 💡 列出所有文件（不仅是 Markdown）使用 `getFiles()`。

## 读取文件

两种读取方法：

| 方法 | 用途 |
|------|------|
| `cachedRead()` | 仅展示内容给用户，避免多次读取磁盘 |
| `read()` | 读取、修改后写回磁盘，避免覆盖过期数据 |

```ts
async averageFileLength(): Promise<number> {
  const { vault } = this.app;

  const fileContents: string[] = await Promise.all(
    vault.getMarkdownFiles().map((file) => vault.cachedRead(file))
  );

  let totalLength = 0;
  fileContents.forEach((content) => {
    totalLength += content.length;
  });

  return totalLength / fileContents.length;
}
```

## 修改文件

**写入文本**：
```ts
function writeCurrentDate(vault: Vault, file: TFile): Promise<void> {
  return vault.modify(file, `Today is ${new Intl.DateTimeFormat().format(new Date())}.`);
}
```

**基于当前内容修改**（推荐）：
```ts
function emojify(vault: Vault, file: TFile): Promise<string> {
  return vault.process(file, (data) => {
    return data.replace(':)', '🙂');
  })
}
```

`Vault.process()` 是对 `read()` 和 `modify()` 的抽象，保证文件在读取和写入之间不被修改。始终优先使用 `Vault.process()`。

## 异步修改

`Vault.process()` 仅支持同步修改。如需异步修改：
1. 使用 `cachedRead()` 读取
2. 执行异步操作
3. 使用 `Vault.process()` 更新
4. 检查 `process()` 回调中的 `data` 与 `cachedRead()` 返回的是否一致

## 删除文件

| 方法 | 说明 |
|------|------|
| `delete()` | 直接删除，无法恢复 |
| `trash()` | 移至回收站（系统回收站或 Vault 根目录的 `.trash` 文件夹） |

## 判断文件还是文件夹

```ts
const folderOrFile = this.app.vault.getAbstractFileByPath('folderOrFile');

if (folderOrFile instanceof TFile) {
  console.log('It\'s a file!');
} else if (folderOrFile instanceof TFolder) {
  console.log('It\'s a folder!');
}
```
