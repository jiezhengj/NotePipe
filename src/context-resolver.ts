/**
 * 多场景上下文解析器
 *
 * 支持 4 种场景：
 *   1. 编辑器（编辑模式）  — editor.getSelection() + editor.getCursor()
 *   2. 编辑器（阅读模式）  — window.getSelection() + 文件内容搜索
 *   3. 文件列表            — DOM 查询选中条目
 *   4. 搜索结果            — 搜索视图内部状态
 *
 * 路径格式化逻辑也在此模块中，统一处理绝对路径 / vault-relative 切换。
 */

import { App, Editor, MarkdownView, MarkdownFileInfo, TFile, FileSystemAdapter } from 'obsidian';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContextSource =
    | 'editor-edit'
    | 'editor-preview'
    | 'file-explorer'
    | 'search-results'
    | 'unknown';

export type PathStyle = 'absolute' | 'vault-relative';

export interface ResolvedContext {
    source: ContextSource;
    /** vault-relative path */
    path: string;
    /** 选中的文本内容 */
    selection: string | null;
    /** 1-indexed, null 表示无行号 */
    startLine: number | null;
    endLine: number | null;
    /** 文件列表场景：多文件路径 */
    files?: string[];
}

// ---------------------------------------------------------------------------
// 路径格式化
// ---------------------------------------------------------------------------

/**
 * 根据 pathStyle 将 vault 相对路径格式化为目标格式。
 * - `absolute`: 拼接 FileSystemAdapter.getBasePath()，Windows 反斜杠统一转正斜杠。
 * - `vault-relative`: 直接返回原路径。
 * - 移动端（无 FileSystemAdapter）：降级为 vault-relative。
 */
export function formatPath(
    vaultRelativePath: string,
    pathStyle: PathStyle,
    app: App,
): string {
    if (pathStyle === 'absolute') {
        const adapter = app.vault.adapter;
        if (adapter instanceof FileSystemAdapter) {
            const basePath = adapter.getBasePath();
            // Windows: C:\Users\... → C:/Users/...
            return basePath.replace(/\\/g, '/') + '/' + vaultRelativePath;
        }
        // 移动端降级
        return vaultRelativePath;
    }
    return vaultRelativePath;
}

// ---------------------------------------------------------------------------
// 上下文解析
// ---------------------------------------------------------------------------

/**
 * 编辑器（编辑模式）上下文解析。
 */
export function resolveEditorContext(
    editor: Editor,
    file: TFile,
): ResolvedContext {
    const selection = editor.getSelection();
    const from = editor.getCursor('from');
    const to = editor.getCursor('to');

    const isEmpty = selection.trim().length === 0;

    return {
        source: 'editor-edit',
        path: file.path,
        selection: selection || null,
        startLine: isEmpty ? null : from.line + 1,
        endLine: isEmpty ? null : to.line + 1,
    };
}

/**
 * 编辑器（阅读模式）上下文解析。
 * 通过 window.getSelection() 获取选区，在文件内容中搜索选区文本以确定行号。
 */
export async function resolvePreviewContext(
    app: App,
    file: TFile,
): Promise<ResolvedContext | null> {
    const domSelection = window.getSelection()?.toString();
    if (!domSelection) return null;

    const content = await app.vault.cachedRead(file);
    const index = content.indexOf(domSelection);

    let startLine: number | null = null;
    let endLine: number | null = null;

    if (index !== -1) {
        const before = content.substring(0, index);
        startLine = before.split('\n').length;
        endLine = startLine + domSelection.split('\n').length - 1;
    }

    return {
        source: 'editor-preview',
        path: file.path,
        selection: domSelection,
        startLine,
        endLine,
    };
}

/**
 * 文件列表上下文解析。
 * 通过 DOM 查询文件列表中选中的条目。
 */
export function resolveFileExplorerContext(): ResolvedContext | null {
    const selectedItems = document.querySelectorAll(
        '.nav-file.is-selected, .nav-folder.is-selected',
    );
    if (selectedItems.length === 0) return null;

    const files: string[] = [];
    selectedItems.forEach((item) => {
        const titleEl = item.querySelector(
            '.nav-file-title-content, .nav-folder-title-content',
        );
        if (titleEl) {
            const path =
                titleEl.getAttribute('data-path') ||
                titleEl.textContent ||
                '';
            if (path) files.push(path);
        }
    });

    return {
        source: 'file-explorer',
        path: '',
        selection: null,
        startLine: null,
        endLine: null,
        files,
    };
}

// ---------------------------------------------------------------------------
// 统一入口
// ---------------------------------------------------------------------------

/**
 * 统一上下文解析入口。
 * 优先级：编辑器 > 文件列表 > 搜索结果。
 * 当 editor 和 view 都提供时（命令触发的编辑模式），优先解析编辑器上下文。
 */
export async function resolveContext(
    app: App,
    editor?: Editor,
    view?: MarkdownView | MarkdownFileInfo,
): Promise<ResolvedContext | null> {
    // 1. 编辑模式（有 editor 和 view 参数时）
    if (editor && view && view.file) {
        const sel = editor.getSelection();
        // 有选区 → 直接返回编辑模式上下文
        if (sel.trim().length > 0) {
            return resolveEditorContext(editor, view.file);
        }
        // 无选区 → 回退到光标所在行上下文
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        return {
            source: 'editor-edit',
            path: view.file.path,
            selection: line,
            startLine: cursor.line + 1,
            endLine: cursor.line + 1,
        };
    }

    // 2. 阅读模式（无 editor，通过 window.getSelection 检测）
    const activeView = app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.getMode() === 'preview' && activeView.file) {
        const domSelection = window.getSelection()?.toString();
        if (domSelection && domSelection.trim().length > 0) {
            return resolvePreviewContext(app, activeView.file);
        }
    }

    // 3. 文件列表
    const fileExplorerContext = resolveFileExplorerContext();
    if (fileExplorerContext) return fileExplorerContext;

    // 4. 有活动文件但无选区：复制文件路径
    const activeFile = app.workspace.getActiveFile();
    if (activeFile) {
        return {
            source: 'unknown',
            path: activeFile.path,
            selection: null,
            startLine: null,
            endLine: null,
        };
    }

    return null;
}
