/**
 * 模板变量替换引擎（纯函数，无 Obsidian 依赖）
 *
 * 支持的模板变量：
 *   {{path}}       — vault 相对路径（如 notes/daily.md）或绝对路径（取决于 pathStyle）
 *   {{fileName}}   — 文件名（无扩展名）
 *   {{startLine}}  — 起始行号（1-indexed）
 *   {{endLine}}    — 结束行号
 *   {{selection}}  — 选中文本内容
 *   {{lines}}      — 人类可读行范围（如 "Line 5" 或 "Lines 3-7"）
 *   {{folder}}     — 父文件夹路径
 */

export interface TemplateContext {
    path: string;
    fileName: string;
    startLine: number | null;
    endLine: number | null;
    selection: string | null;
    lines: string;
    folder: string;
}

/**
 * 从 vault 相对路径和可选行号构造模板上下文。
 */
export function buildTemplateContext(
    path: string,
    selection: string | null,
    startLine: number | null,
    endLine: number | null,
): TemplateContext {
    const parts = path.split('/');
    const fileNameWithExt = parts[parts.length - 1] ?? '';
    const fileName = fileNameWithExt.replace(/\.[^.]+$/, '');
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '';

    let lines: string;
    if (startLine === null) {
        lines = '';
    } else if (endLine === null || endLine === startLine) {
        lines = `Line ${startLine}`;
    } else {
        lines = `Lines ${startLine}-${endLine}`;
    }

    return { path, fileName, startLine, endLine, selection, lines, folder };
}

/**
 * 渲染模板字符串。
 * `\n` 字面量在渲染时转换为实际换行符。
 */
export function renderTemplate(template: string, context: TemplateContext): string {
    return template
        .replace(/\{\{path\}\}/g, context.path)
        .replace(/\{\{fileName\}\}/g, context.fileName)
        .replace(/\{\{startLine\}\}/g, context.startLine?.toString() ?? '')
        .replace(/\{\{endLine\}\}/g, context.endLine?.toString() ?? '')
        // 选中文本每行换行后加统一前缀，方便直接拼接
        .replace(/\{\{selection\}\}/g, context.selection ? context.selection.replace(/\n/g, '\n> ') : '')
        .replace(/\{\{lines\}\}/g, context.lines)
        .replace(/\{\{folder\}\}/g, context.folder)
        .replace(/\\n/g, '\n');
}

/**
 * 对超大选区进行截断处理。
 * @param selection 原始选区文本
 * @param maxBytes 最大字节数，默认 100KB
 * @returns 截断后的文本（超出时追加 truncationHint）
 */
export function truncateSelection(
    selection: string,
    maxBytes: number = 100 * 1024,
    truncationHint: string = '... (truncated)',
): string {
    // 快速路径：多数情况下选区较小
    if (selection.length < maxBytes) return selection;

    // 逐字符截断以正确处理多字节 Unicode
    let bytes = 0;
    let charCount = 0;
    for (const char of selection) {
        const charBytes = new TextEncoder().encode(char).length;
        if (bytes + charBytes > maxBytes) break;
        bytes += charBytes;
        charCount++;
    }
    return selection.slice(0, charCount) + truncationHint;
}
