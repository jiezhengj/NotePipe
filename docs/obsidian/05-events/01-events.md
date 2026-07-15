# Events

Obsidian 中的许多接口让你订阅应用程序中的事件，例如用户修改文件。

## 注册事件

任何已注册的事件处理程序都需要在插件卸载时取消。最安全的方式是使用 `registerEvent()`：

```ts
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.registerEvent(this.app.vault.on('create', () => {
      console.log('a new file has entered the arena')
    }));
  }
}
```

## 定时事件

使用 `window.setInterval()` 配合 `registerInterval()` 来安全地运行定时任务：

```ts
import { moment, Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  statusBar: HTMLElement;

  async onload() {
    this.statusBar = this.addStatusBarItem();
    this.updateStatusBar();

    this.registerInterval(
      window.setInterval(() => this.updateStatusBar(), 1000)
    );
  }

  updateStatusBar() {
    this.statusBar.setText(moment().format('H:mm:ss'));
  }
}
```

> 💡 [Moment](https://momentjs.com/) 是 Obsidian 内部的日期时间库，可以直接从 Obsidian API 导入：`import { moment } from 'obsidian';`
