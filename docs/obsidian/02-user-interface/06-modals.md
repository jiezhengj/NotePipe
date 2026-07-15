# Modals

## 基本模态框

```ts
import { App, Modal } from 'obsidian';

export class ExampleModal extends Modal {
  constructor(app: App) {
    super(app);
    this.setContent('Look at me, I\'m a modal! 👀');
  }
}
```

打开模态框：

```ts
new ExampleModal(this.app).open();
```

## 接收用户输入

```ts
import { App, Modal, Setting } from 'obsidian';

export class ExampleModal extends Modal {
  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.setTitle('What\'s your name?');

    let name = '';
    new Setting(this.contentEl)
      .setName('Name')
      .addText((text) =>
        text.onChange((value) => {
          name = value;
        }));

    new Setting(this.contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('Submit')
          .setCta()
          .onClick(() => {
            this.close();
            onSubmit(name);
          }));
  }
}
```

调用：

```ts
new ExampleModal(this.app, (result) => {
  new Notice(`Hello, ${result}!`);
}).open();
```

## SuggestModal：从建议列表中选择

```ts
import { App, Notice, SuggestModal } from 'obsidian';

interface Book {
  title: string;
  author: string;
}

const ALL_BOOKS = [
  { title: 'How to Take Smart Notes', author: 'Sönke Ahrens' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman' },
  { title: 'Deep Work', author: 'Cal Newport' },
];

export class ExampleModal extends SuggestModal<Book> {
  getSuggestions(query: string): Book[] {
    return ALL_BOOKS.filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(book: Book, el: HTMLElement) {
    el.createEl('div', { text: book.title });
    el.createEl('small', { text: book.author });
  }

  onChooseSuggestion(book: Book, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${book.title}`);
  }
}
```

## FuzzySuggestModal：模糊匹配

```ts
import { FuzzySuggestModal, Notice } from "obsidian";

export class ExampleSuggestModal extends FuzzySuggestModal<Book> {
  getItems(): Book[] {
    return ALL_BOOKS;
  }

  getItemText(book: Book): string {
    return book.title;
  }

  onChooseItem(book: Book, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${book.title}`);
  }
}
```

### 自定义模糊搜索渲染

```ts
import { FuzzyMatch, FuzzySuggestModal, Notice, renderResults } from "obsidian";

export class ExampleSuggestModal extends FuzzySuggestModal<Book> {
  getItemText(item: Book): string {
    return item.title + " " + item.author;
  }

  getItems(): Book[] {
    return ALL_BOOKS;
  }

  renderSuggestion(match: FuzzyMatch<Book>, el: HTMLElement) {
    const titleEl = el.createDiv();
    renderResults(titleEl, match.item.title, match.match);

    const authorEl = el.createEl('small');
    const offset = -(match.item.title.length + 1);
    renderResults(authorEl, match.item.author, match.match, offset);
  }

  onChooseItem(book: Book, evt: MouseEvent | KeyboardEvent): void {
    new Notice(`Selected ${book.title}`);
  }
}
```
