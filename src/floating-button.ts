/**
 * 浮层按钮管理器
 *
 * 统一通过 DOM selectionchange 事件检测选区，position:fixed 浮层定位。
 * 编辑模式和阅读模式共用同一按钮，不影响文本流。
 * 移动端适配：触控区域 ≥44px（CSS 中处理）。
 */

import { MarkdownView } from 'obsidian';
import type NotePipePlugin from './main';
import { t } from './i18n';

// ---------------------------------------------------------------------------
// 共享浮层按钮
// ---------------------------------------------------------------------------

class SharedFloatingButton {
    private el: HTMLElement | null = null;
    private hideTimer: ReturnType<typeof setTimeout> | null = null;

    show(top: number, left: number, onClick: () => void): void {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }

        if (!this.el) {
            this.el = this.createEl();
        }

        // 更新点击回调（阅读模式每次选区不同，需刷新回调）
        this.el.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
            this.hide();
        };

        this.el.style.top = `${Math.max(4, top)}px`;
        this.el.style.left = `${Math.max(4, left)}px`;
        this.el.classList.add('visible');
    }

    hide(): void {
        // 延迟隐藏，避免在快速连续选区间闪烁
        this.hideTimer = setTimeout(() => {
            if (this.el) {
                this.el.classList.remove('visible');
            }
        }, 100);
    }

    remove(): void {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }
        if (this.el) {
            this.el.remove();
            this.el = null;
        }
    }

    private createEl(): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'notepipe-floating-btn';
        btn.title = t('floating.tooltip');
        btn.setAttribute('aria-label', t('floating.tooltip'));

        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>`;

        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.body.appendChild(btn);
        return btn;
    }
}

// ---------------------------------------------------------------------------
// 浮层按钮管理器
// ---------------------------------------------------------------------------

export class FloatingButtonManager {
    private plugin: NotePipePlugin;
    private button: SharedFloatingButton;
    private boundHandler: () => void;
    private boundScrollHandler: () => void;

    constructor(plugin: NotePipePlugin) {
        this.plugin = plugin;
        this.button = new SharedFloatingButton();
        this.boundHandler = this.onSelectionChange.bind(this);
        this.boundScrollHandler = () => this.button.hide();
    }

    activate(): void {
        document.addEventListener('selectionchange', this.boundHandler);
        document.addEventListener('scroll', this.boundScrollHandler, { capture: true });
    }

    deactivate(): void {
        document.removeEventListener('selectionchange', this.boundHandler);
        document.removeEventListener('scroll', this.boundScrollHandler, { capture: true });
        this.button.remove();
    }

    // -------------------------------------------------------------------
    // 选区变化：编辑模式 + 阅读模式统一处理
    // -------------------------------------------------------------------

    private onSelectionChange(): void {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            this.button.hide();
            return;
        }

        if (selection.rangeCount === 0) {
            this.button.hide();
            return;
        }

        const range = selection.getRangeAt(0);

        // 判断场景：编辑模式 or 阅读模式
        const activeView =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            this.button.hide();
            return;
        }

        const mode = activeView.getMode();
        const viewContainer =
            mode === 'preview'
                ? activeView.previewMode?.containerEl
                : activeView.containerEl;

        if (!viewContainer || !viewContainer.contains(range.commonAncestorContainer)) {
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

    forceUpdate(): void {
        this.button.hide();
    }
}
