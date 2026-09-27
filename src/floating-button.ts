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
import { clampFloatingButtonPosition } from './floating-position';

// ---------------------------------------------------------------------------
// 共享浮层按钮
// ---------------------------------------------------------------------------

class SharedFloatingButton {
    private el: HTMLElement | null = null;
    private hideTimer: number | null = null;
    private ownerDocument: Document = document;
    private ownerWindow: Window = window;

    show(
        top: number,
        left: number,
        onClick: () => void,
        ownerDocument: Document,
    ): void {
        if (ownerDocument !== this.ownerDocument) {
            this.remove();
            this.ownerDocument = ownerDocument;
            this.ownerWindow = ownerDocument.defaultView ?? window;
        }

        if (this.hideTimer) {
            this.ownerWindow.clearTimeout(this.hideTimer);
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

        const rect = this.el.getBoundingClientRect();
        const position = clampFloatingButtonPosition(
            top,
            left,
            rect.width || this.el.offsetWidth || 32,
            rect.height || this.el.offsetHeight || 32,
            this.ownerWindow.innerWidth,
            this.ownerWindow.innerHeight,
        );
        this.el.style.top = `${position.top}px`;
        this.el.style.left = `${position.left}px`;
        this.el.classList.add('visible');
    }

    hide(): void {
        // 延迟隐藏，避免在快速连续选区间闪烁
        this.hideTimer = this.ownerWindow.setTimeout(() => {
            if (this.el) {
                this.el.classList.remove('visible');
            }
        }, 100);
    }

    remove(): void {
        if (this.hideTimer) {
            this.ownerWindow.clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        if (this.el) {
            this.el.remove();
            this.el = null;
        }
    }

    private createEl(): HTMLElement {
        const tooltip = t('floating.tooltip');
        const btn = this.ownerDocument.body.createEl('button', {
            cls: 'notepipe-floating-btn',
            title: tooltip,
            attr: { 'aria-label': tooltip },
        });

        // Use Obsidian's DOM helpers so the button works in popout documents.
        const svg = btn.createSvg('svg', {
            attr: {
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
            },
        });

        svg.createSvg('rect', {
            attr: {
                x: '9',
                y: '9',
                width: '13',
                height: '13',
                rx: '2',
                ry: '2',
            },
        });

        svg.createSvg('path', {
            attr: {
                d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
            },
        });

        btn.addEventListener('mousedown', (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
        });

        return btn;
    }
}

// ---------------------------------------------------------------------------
// 浮层按钮管理器
// ---------------------------------------------------------------------------

export class FloatingButtonManager {
    private plugin: NotePipePlugin;
    private button: SharedFloatingButton;
    private boundHandler: (event: Event) => void;
    private boundScrollHandler: () => void;
    private observedDocuments = new Set<Document>();

    constructor(plugin: NotePipePlugin) {
        this.plugin = plugin;
        this.button = new SharedFloatingButton();
        this.boundHandler = this.onSelectionChange.bind(this);
        this.boundScrollHandler = () => this.button.hide();
    }

    activate(): void {
        this.observeDocument(document);
        this.plugin.app.workspace.iterateAllLeaves((leaf) => {
            this.observeDocument(leaf.view.containerEl.ownerDocument);
        });
        this.plugin.registerEvent(
            this.plugin.app.workspace.on('layout-change', () => {
                this.plugin.app.workspace.iterateAllLeaves((leaf) => {
                    this.observeDocument(leaf.view.containerEl.ownerDocument);
                });
            }),
        );
    }

    deactivate(): void {
        for (const observedDocument of this.observedDocuments) {
            observedDocument.removeEventListener('selectionchange', this.boundHandler);
            observedDocument.removeEventListener('scroll', this.boundScrollHandler, { capture: true });
        }
        this.observedDocuments.clear();
        this.button.remove();
    }

    private observeDocument(ownerDocument: Document): void {
        if (this.observedDocuments.has(ownerDocument)) return;

        ownerDocument.addEventListener('selectionchange', this.boundHandler);
        ownerDocument.addEventListener('scroll', this.boundScrollHandler, { capture: true });
        this.observedDocuments.add(ownerDocument);
    }

    // -------------------------------------------------------------------
    // 选区变化：编辑模式 + 阅读模式统一处理
    // -------------------------------------------------------------------

    private onSelectionChange(event: Event): void {
        const eventDocument = event.currentTarget as Document | null;
        const selectionDocument = eventDocument?.nodeType === 9 ? eventDocument : document;
        const selection = selectionDocument.getSelection();
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
        const ownerDocument = range.commonAncestorContainer.ownerDocument ?? selectionDocument;

        this.button.show(
            top,
            left,
            () => {
                void this.plugin.copyGlobalContext();
            },
            ownerDocument,
        );
    }

    forceUpdate(): void {
        this.button.hide();
    }
}
