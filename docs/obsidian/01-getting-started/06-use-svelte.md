# Use Svelte in your plugin

Svelte 是一个轻量级框架，通过编译器预处理代码并输出优化的原生 JavaScript，无需虚拟 DOM。

## 配置插件

1. 添加 Svelte 依赖：

```bash
npm install --save-dev svelte svelte-preprocess esbuild-svelte svelte-check
```

> ℹ️ Svelte 需要 TypeScript 5.0+：
> ```bash
> npm install typescript@~5.0.0
> ```

2. 扩展 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": [
    "**/*.ts",
    "**/*.svelte"
  ]
}
```

3. 在 `esbuild.config.mjs` 中添加：

```js
import esbuildSvelte from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';

const context = await esbuild.context({
  plugins: [
    esbuildSvelte({
      compilerOptions: { css: 'injected' },
      preprocess: sveltePreprocess(),
    }),
  ],
  // ...
});
```

4. 添加 `svelte-check` 脚本到 `package.json`：

```json
{
  "scripts": {
    "svelte-check": "svelte-check --tsconfig tsconfig.json"
  }
}
```

## 创建 Svelte 组件

```svelte title="Counter.svelte"
<script lang="ts">
  interface Props {
    startCount: number;
  }

  let { startCount }: Props = $props();
  let count = $state(startCount);

  export function increment() {
    count += 1;
  }
</script>

<div class="number">
  <span>My number is {count}!</span>
</div>

<style>
  .number {
    color: red;
  }
</style>
```

## 挂载 Svelte 组件

```ts
import Counter from './Counter.svelte';
import { mount, unmount } from 'svelte';

export class ExampleView extends ItemView {
  counter: ReturnType<typeof Counter> | undefined;

  async onOpen() {
    this.counter = mount(Counter, {
      target: this.contentEl,
      props: { startCount: 5 }
    });
    this.counter.increment();
  }

  async onClose() {
    if (this.counter) {
      unmount(this.counter);
    }
  }
}
```
