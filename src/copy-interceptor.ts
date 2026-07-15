/**
 * 始终复制模式（实验性）
 *
 * 编辑模式：通过 CodeMirror 6 Extension 监听选区变化，自动复制。
 * 阅读模式：通过 DOM selectionchange 事件监听，自动复制。
 * 移动端：禁用此模式。
 */

import { PluginValue, EditorView, ViewUpdate, ViewPlugin } from '@codemirror/view';
import { MarkdownView, Platform } from 'obsidian';
import type NotePipePlugin from './main';

// ---------------------------------------------------------------------------
// 编辑模式 CM6 Extension
// ---------------------------------------------------------------------------

/**
 * 选区变化防抖：在指定时间内多次选区变化只触发一次复制。
 */
function debounce(fn: () => void, delay: number): () => void {
    let timer: number | null = null;
    return () => {
        if (timer !== null) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            timer = null;
            fn();
        }, delay);
    };
}

class CopyInterceptorPlugin implements PluginValue {
    private plugin: NotePipePlugin;
    private debouncedCopy: () => void;

    constructor(view: EditorView, plugin: NotePipePlugin) {
        this.plugin = plugin;

        // 300ms 防抖：避免拖动选区时频繁触发
        this.debouncedCopy = debounce(() => {
            const selection = view.state.selection.main;
            if (selection.empty) return;

            const selectedText = view.state.sliceDoc(
                selection.from,
                selection.to,
            );
            if (selectedText.trim().length === 0) return;

            void this.plugin.copyGlobalContext();
        }, 300);
    }

    update(update: ViewUpdate): void {
        // 仅在选区变化时触发（忽略文档内容变化）
        if (update.selectionSet) {
            this.debouncedCopy();
        }
    }

    destroy(): void {}
}

/**
 * 创建编辑模式的始终复制 CodeMirror 6 Extension。
 */
export function copyInterceptorExtension(plugin: NotePipePlugin) {
    return ViewPlugin.define(
        (view) => new CopyInterceptorPlugin(view, plugin),
    );
}

// ---------------------------------------------------------------------------
// 阅读模式 DOM 拦截
// ---------------------------------------------------------------------------

let globalSelectionHandler: (() => void) | null = null;

/**
 * 注册全局 selectionchange 监听（阅读模式）。
 */
export function registerGlobalCopyInterceptor(plugin: NotePipePlugin): void {
    if (Platform.isMobile) return;

    const debouncedCopy = debounce(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const text = selection.toString();
        if (text.trim().length === 0) return;

        // 仅在阅读模式下触发（编辑模式由 CM6 extension 处理）
        const activeView =
            plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView || activeView.getMode() !== 'preview') {
            return;
        }

        void plugin.copyGlobalContext();
    }, 300);

    globalSelectionHandler = () => {
        // 通过 requestAnimationFrame 延迟，确保 selection 已稳定
        window.requestAnimationFrame(() => debouncedCopy());
    };

    document.addEventListener(
        'selectionchange',
        globalSelectionHandler,
    );
}

/**
 * 取消全局 selectionchange 监听。
 */
export function unregisterGlobalCopyInterceptor(): void {
    if (globalSelectionHandler) {
        document.removeEventListener(
            'selectionchange',
            globalSelectionHandler,
        );
        globalSelectionHandler = null;
    }
}
