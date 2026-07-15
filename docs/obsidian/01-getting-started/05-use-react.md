# Use React in your plugin

## 配置插件

1. 添加 React 依赖：

```bash
npm install react react-dom
```

2. 添加类型定义：

```bash
npm install --save-dev @types/react @types/react-dom
```

3. 在 `tsconfig.json` 中启用 JSX：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

## 创建 React 组件

```tsx title="ReactView.tsx"
export const ReactView = () => {
  return <h4>Hello, React!</h4>;
};
```

## 挂载 React 组件

```tsx
import { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import { ReactView } from './ReactView';

const VIEW_TYPE_EXAMPLE = 'example-view';

class ExampleView extends ItemView {
  root: Root | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return 'Example view';
  }

  async onOpen() {
    this.root = createRoot(this.contentEl);
    this.root.render(
      <StrictMode>
        <ReactView />,
      </StrictMode>,
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}
```

## 创建 App 上下文

```tsx title="context.ts"
import { createContext } from 'react';
import { App } from 'obsidian';

export const AppContext = createContext<App | undefined>(undefined);
```

```tsx title="view.tsx"
this.root = createRoot(this.contentEl);
this.root.render(
  <AppContext.Provider value={this.app}>
    <ReactView />
  </AppContext.Provider>
);
```

```tsx title="hooks.ts"
import { useContext } from 'react';
import { AppContext } from './context';

export const useApp = (): App | undefined => {
  return useContext(AppContext);
};
```

```tsx title="ReactView.tsx"
import { useApp } from './hooks';

export const ReactView = () => {
  const { vault } = useApp();

  return <h4>{vault.getName()}</h4>;
};
```
