# Ribbon actions

侧边栏（Ribbon）是 Obsidian 界面左侧的栏，用于托管插件定义的操作。

添加 Ribbon 操作：

```ts
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.addRibbonIcon('dice', 'Print to console', () => {
      console.log('Hello, you!');
    });
  }
}
```

第一个参数指定图标。图标相关信息参考 [[05-icons|Icons]]。

> ⚠️ 用户可以移除你的图标或隐藏 Ribbon。建议同时提供命令入口。不推荐插件自行添加 Ribbon 项的开关。
