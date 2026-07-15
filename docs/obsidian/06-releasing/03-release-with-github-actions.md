# Release your plugin with GitHub Actions

自动创建 Release 的配置步骤：

1. 在仓库根目录创建 `.github/workflows/release.yml`：

```yml
name: Release Obsidian plugin

on:
  push:
    tags:
      - "*"

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"

      - name: Build plugin
        run: |
          npm install
          npm run build

      - name: Create release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          tag="${GITHUB_REF#refs/tags/}"

          gh release create "$tag" \
            --title="$tag" \
            --draft \
            main.js manifest.json styles.css
```

2. 提交工作流：

```bash
git add .github/workflows/release.yml
git commit -m "Add release workflow"
git push origin main
```

3. 在 GitHub 仓库 Settings → Actions → General → Workflow permissions 中设置 **Read and write permissions**。

4. 创建 tag：

```bash
git tag -a 1.0.1 -m "1.0.1"
git push origin 1.0.1
```

5. 在 GitHub 的 **Actions** 标签查看工作流运行状态。

6. 工作流完成后，在 **Releases** 中找到 draft release，添加发布说明后点击 **Publish release**。
