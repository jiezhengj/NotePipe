/**
 * 浮层按钮管理器
 *
 * 编辑模式：通过 CodeMirror 6 ViewPlugin 在选区末尾注入按钮 widget。
 * 阅读模式：通过 DOM mouseup 事件监听，在选区附近放置浮层。
 * 移动端适配：触控区域 ≥44px（CSS 中处理）。
 */

import {
    PluginValue,
    EditorView,
    ViewUpdate,
    ViewPlugin,
    Decoration,
    DecorationSet,
    WidgetType,
} from '@codemirror/view';
import { MarkdownView, Platform } from 'obsidian';
import type NotePipePlugin from './main';
import { t } from './i18n';

// ---------------------------------------------------------------------------
// CodeMirror 6 Widget（编辑模式）
// ---------------------------------------------------------------------------

/** 触发复制的 CM6 StateEffect（预留，可用于外部驱动） */
// import { StateEffect } from '@codemirror/state';
// export const triggerCopyEffect = StateEffect.define();

class CopyButtonWidget extends WidgetType {
    private plugin: NotePipePlugin;

    constructor(plugin: NotePipePlugin) {
        super();
        this.plugin = plugin;
    }

    toDOM(): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'notepipe-copy-btn';
        btn.title = t('floating.tooltip');
        btn.setAttribute('aria-label', t('floating.tooltip'));

        // clipboard-copy 图标 (Lucide 风格 SVG)
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>`;

        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.plugin.copyGlobalContext();
        });

        return btn;
    }
}

class FloatingButtonPlugin implements PluginValue {
    decorations: DecorationSet;
    private plugin: NotePipePlugin;

    constructor(view: EditorView, plugin: NotePipePlugin) {
        this.plugin = plugin;
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate): void {
        if (update.selectionSet || update.docChanged) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    private buildDecorations(view: EditorView): DecorationSet {
        const selection = view.state.selection.main;
        // 空选区 → 不显示按钮
        if (selection.empty) return Decoration.none;

        const widget = Decoration.widget({
            widget: new CopyButtonWidget(this.plugin),
            side: -1, // 放在选区末尾之后
        });

        return Decoration.set([widget.range(selection.to)]);
    }

    destroy(): void {}
}

/** 创建 CodeMirror 6 ViewPlugin 的工厂函数 */
export function createFloatingButtonExtension(plugin: NotePipePlugin) {
    return ViewPlugin.define(
        (view) => new FloatingButtonPlugin(view, plugin),
    );
}

// ---------------------------------------------------------------------------
// DOM 浮层管理器（阅读模式）
// ---------------------------------------------------------------------------

export class FloatingButtonManager {
    private plugin: NotePipePlugin;
    private buttonEl: HTMLElement | null = null;
    private boundMouseUpHandler: (event: MouseEvent) => void;
    private boundScrollHandler: () => void;

    constructor(plugin: NotePipePlugin) {
        this.plugin = plugin;
        this.boundMouseUpHandler = this.onMouseUp.bind(this);
        this.boundScrollHandler = () => this.hide();
    }

    activate(): void {
        // 阅读模式：DOM mouseup 监听
        document.addEventListener('mouseup', this.boundMouseUpHandler);
        // 滚动时隐藏浮层
        document.addEventListener('scroll', this.boundScrollHandler, { capture: true });
    }

    deactivate(): void {
        document.removeEventListener('mouseup', this.boundMouseUpHandler);
        document.removeEventListener('scroll', this.boundScrollHandler, { capture: true });
        this.hide();
        this.removeButtonElement();
    }

    // -------------------------------------------------------------------
    // 事件处理
    // -------------------------------------------------------------------

    private onMouseUp(event: MouseEvent): void {
        // 延迟执行，确保 selection 已更新
        requestAnimationFrame(() => this.handleSelection(event));
    }

    private handleSelection(_event: MouseEvent): void {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            this.hide();
            return;
        }

        // 检查选区是否在 Markdown 预览视图内
        const activeView =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || activeView.getMode() !== 'preview') {
            this.hide();
            return;
        }

        // 检查选区是否在 activeView 的 DOM 内
        if (selection.rangeCount === 0) {
            this.hide();
            return;
        }

        const range = selection.getRangeAt(0);
        const viewContainer =
            activeView.previewMode?.containerEl ??
            activeView.containerEl;

        if (!viewContainer.contains(range.commonAncestorContainer)) {
            this.hide();
            return;
        }

        const rect = range.getBoundingClientRect();
        this.show(rect);
    }

    // -------------------------------------------------------------------
    // 浮层显示/隐藏
    // -------------------------------------------------------------------

    private show(rect: DOMRect): void {
        if (!this.buttonEl) {
            this.buttonEl = this.createButtonElement();
        }

        // 定位于选区末尾下方
        const top = rect.bottom + 8;
        const left = Math.max(8, rect.right - 40);

        this.buttonEl.style.top = `${top}px`;
        this.buttonEl.style.left = `${left}px`;
        this.buttonEl.classList.add('visible');
    }

    hide(): void {
        if (this.buttonEl) {
            this.buttonEl.classList.remove('visible');
        }
    }

    private createButtonElement(): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'notepipe-floating-btn';
        btn.title = t('floating.tooltip');
        btn.setAttribute('aria-label', t('floating.tooltip'));

        // clipboard-copy 图标
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>`;

        btn.addEventListener('click', () => {
            this.plugin.copyGlobalContext();
            this.hide();
        });

        document.body.appendChild(btn);
        return btn;
    }

    private removeButtonElement(): void {
        if (this.buttonEl) {
            this.buttonEl.remove();
            this.buttonEl = null;
        }
    }

    // -------------------------------------------------------------------
    // 强制刷新（供外部调用，如主题切换后）
    // -------------------------------------------------------------------

    forceUpdate(): void {
        this.hide();
    }
}
