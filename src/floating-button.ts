/**
 * 浮层按钮管理器
 *
 * 编辑模式：CodeMirror 6 ViewPlugin 检测选区 → 用 coordsAtPos() 获取屏幕坐标 → 显示固定定位浮层。
 * 阅读模式：DOM mouseup 事件检测选区 → Selection.getBoundingClientRect() 定位。
 * 两种模式共用同一个 position:fixed 的 DOM 按钮，不影响文本流。
 * 移动端适配：触控区域 ≥44px（CSS 中处理）。
 */

import {
    PluginValue,
    EditorView,
    ViewUpdate,
    ViewPlugin,
} from '@codemirror/view';
import { MarkdownView } from 'obsidian';
import type NotePipePlugin from './main';
import { t } from './i18n';

// ---------------------------------------------------------------------------
// 共享浮层按钮（position: fixed，两种模式共用）
// ---------------------------------------------------------------------------

class SharedFloatingButton {
    private el: HTMLElement | null = null;

    show(top: number, left: number, onClick: () => void): void {
        if (!this.el) {
            this.el = this.createEl(onClick);
        }

        this.el.style.top = `${top}px`;
        this.el.style.left = `${left}px`;
        this.el.classList.add('visible');
    }

    hide(): void {
        if (this.el) {
            this.el.classList.remove('visible');
        }
    }

    remove(): void {
        if (this.el) {
            this.el.remove();
            this.el = null;
        }
    }

    private createEl(onClick: () => void): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'notepipe-floating-btn';
        btn.title = t('floating.tooltip');
        btn.setAttribute('aria-label', t('floating.tooltip'));

        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>`;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
            this.hide();
        });

        // mousedown 时阻止默认行为，防止编辑器失焦
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.body.appendChild(btn);
        return btn;
    }
}

// ---------------------------------------------------------------------------
// 编辑模式：CM6 ViewPlugin（仅检测选区，不创建 widget）
// ---------------------------------------------------------------------------

/**
 * 基于 CM6 坐标计算浮层位置。
 * 按钮出现在选区末尾的右上方，不遮挡后续文字。
 */
function selectionEndCoords(view: EditorView): { top: number; left: number } | null {
    const pos = view.state.selection.main.to;
    const coords = view.coordsAtPos(pos);
    if (!coords) return null;
    // 放在选区末尾右上方
    return {
        top: coords.top - 32,
        left: coords.right + 4,
    };
}

class EditorSelectionWatcher implements PluginValue {
    private button: SharedFloatingButton;
    private onClick: () => void;

    constructor(view: EditorView, button: SharedFloatingButton, onClick: () => void) {
        this.button = button;
        this.onClick = onClick;
        this.updateButton(view);
    }

    update(update: ViewUpdate): void {
        if (update.selectionSet || update.docChanged) {
            this.updateButton(update.view);
        }
    }

    private updateButton(view: EditorView): void {
        const sel = view.state.selection.main;
        if (sel.empty) {
            this.button.hide();
            return;
        }
        const coords = selectionEndCoords(view);
        if (!coords) {
            this.button.hide();
            return;
        }
        this.button.show(coords.top, coords.left, this.onClick);
    }

    destroy(): void {
        this.button.hide();
    }
}

/**
 * 创建编辑模式浮层按钮的 CM6 Extension。
 * 不产生任何 decorations，仅监听选区变化并驱动固定定位浮层。
 */
export function createFloatingButtonExtension(
    button: SharedFloatingButton,
    onClick: () => void,
) {
    return ViewPlugin.define(
        (view) => new EditorSelectionWatcher(view, button, onClick),
    );
}

// ---------------------------------------------------------------------------
// 浮层按钮管理器（生命周期 + 阅读模式）
// ---------------------------------------------------------------------------

export class FloatingButtonManager {
    private plugin: NotePipePlugin;
    private button: SharedFloatingButton;
    private boundMouseUpHandler: (event: MouseEvent) => void;
    private boundScrollHandler: () => void;

    constructor(plugin: NotePipePlugin) {
        this.plugin = plugin;
        this.button = new SharedFloatingButton();
        this.boundMouseUpHandler = this.onMouseUp.bind(this);
        this.boundScrollHandler = () => this.button.hide();
    }

    /** 获取共享按钮实例（供 CM6 extension 使用） */
    getSharedButton(): SharedFloatingButton {
        return this.button;
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
        this.button.hide();
        this.button.remove();
    }

    // -------------------------------------------------------------------
    // 阅读模式事件处理
    // -------------------------------------------------------------------

    private onMouseUp(_event: MouseEvent): void {
        // 延迟执行，确保 selection 已更新
        requestAnimationFrame(() => this.handleSelection());
    }

    private handleSelection(): void {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            this.button.hide();
            return;
        }

        const activeView =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || activeView.getMode() !== 'preview') {
            this.button.hide();
            return;
        }

        if (selection.rangeCount === 0) {
            this.button.hide();
            return;
        }

        const range = selection.getRangeAt(0);
        const viewContainer =
            activeView.previewMode?.containerEl ??
            activeView.containerEl;

        if (!viewContainer.contains(range.commonAncestorContainer)) {
            this.button.hide();
            return;
        }

        const rect = range.getBoundingClientRect();
        // 放在选区末尾右上方
        const top = rect.top - 32;
        const left = rect.right + 4;

        this.button.show(top, left, () => {
            this.plugin.copyGlobalContext();
        });
    }

    // -------------------------------------------------------------------
    // 强制刷新
    // -------------------------------------------------------------------

    forceUpdate(): void {
        this.button.hide();
    }
}
