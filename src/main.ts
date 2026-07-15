/**
 * NotePipe — Obsidian 插件主入口
 *
 * 功能：
 *   - 一键复制选中文本，自动附带文件路径 + 行号上下文
 *   - 支持编辑模式、阅读模式、文件列表、搜索结果
 *   - 浮层按钮（CM6 widget + DOM overlay）
 *   - 可配置模板和路径格式
 *   - 中英文双语
 */

import { Notice, Plugin, MarkdownView, MarkdownFileInfo } from 'obsidian';
import { loadLocale, t } from './i18n';
import { NotePipeSettings, DEFAULT_SETTINGS, NotePipeSettingTab } from './settings';
import {
    resolveContext,
    formatPath,
    resolveFileExplorerContext,
} from './context-resolver';
import {
    buildTemplateContext,
    renderTemplate,
    truncateSelection,
} from './template-engine';
import { FloatingButtonManager } from './floating-button';
import {
    copyInterceptorExtension,
    registerGlobalCopyInterceptor,
    unregisterGlobalCopyInterceptor,
} from './copy-interceptor';

export default class NotePipePlugin extends Plugin {
    settings!: NotePipeSettings;
    floatingButton!: FloatingButtonManager;

    // -----------------------------------------------------------------------
    // 生命周期
    // -----------------------------------------------------------------------

    async onload(): Promise<void> {
        await this.loadSettings();

        // 国际化：在注册命令/UI 之前加载语言
        loadLocale();

        this.addSettingTab(new NotePipeSettingTab(this.app, this));

        // 注册命令（编辑模式）
        this.addCommand({
            id: 'copy-with-context',
            name: t('command.copyWithContext'),
            editorCallback: (editor, view) => this.copyWithContext(editor, view),
        });

        // 注册命令（全局 — 阅读模式 / 文件列表等）
        this.addCommand({
            id: 'copy-with-context-global',
            name: t('command.copyWithContextGlobal'),
            callback: () => this.copyGlobalContext(),
        });

        // 浮层按钮：统一 DOM selectionchange 监听（编辑+阅读模式）
        if (this.settings.showFloatingButton) {
            this.floatingButton = new FloatingButtonManager(this);
            this.floatingButton.activate();
        }

        // 始终复制模式（实验性）
        if (this.settings.enableAlwaysCopy) {
            this.registerEditorExtension(copyInterceptorExtension(this));
            registerGlobalCopyInterceptor(this);
        }
    }

    onunload(): void {
        if (this.floatingButton) {
            this.floatingButton.deactivate();
        }
        // 清理始终复制模式
        unregisterGlobalCopyInterceptor();
    }

    // -----------------------------------------------------------------------
    // 设置持久化
    // -----------------------------------------------------------------------

    async loadSettings(): Promise<void> {
        const data = await this.loadData() as Partial<NotePipeSettings>;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    // -----------------------------------------------------------------------
    // 核心复制逻辑
    // -----------------------------------------------------------------------

    /**
     * 编辑模式复制（命令面板 / 快捷键触发）。
     */
    async copyWithContext(
        editor: import('obsidian').Editor,
        view: MarkdownView | MarkdownFileInfo,
    ): Promise<void> {
        const context = await resolveContext(this.app, editor, view);
        if (!context) {
            new Notice(t('notice.noContext'));
            return;
        }

        // 文件列表场景特殊处理
        if (context.source === 'file-explorer' && context.files) {
            await this.copyFileList(context.files);
            return;
        }

        await this.copyResolvedContext(context);
    }

    /**
     * 全局复制（阅读模式 / 文件列表 / 编辑模式浮层按钮点击等场景）。
     */
    async copyGlobalContext(): Promise<void> {
        // 优先检测文件列表
        const fileListContext = resolveFileExplorerContext();
        if (fileListContext) {
            await this.copyFileList(fileListContext.files!);
            return;
        }

        // 检测编辑模式（浮层按钮点击时无 editor 参数，需手动获取）
        const activeView =
            this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView && activeView.getMode() === 'source' && activeView.editor) {
            const selection = activeView.editor.getSelection();
            if (selection.trim().length > 0) {
                const context = await resolveContext(
                    this.app,
                    activeView.editor,
                    activeView,
                );
                if (context) {
                    await this.copyResolvedContext(context);
                    return;
                }
            }
        }

        // 其次走标准上下文解析（阅读模式等）
        const context = await resolveContext(this.app);
        if (!context) {
            new Notice(t('notice.noContext'));
            return;
        }

        await this.copyResolvedContext(context);
    }

    /**
     * 将 ResolvedContext 渲染并写入剪贴板。
     */
    private async copyResolvedContext(context: import('./context-resolver').ResolvedContext): Promise<void> {
        // 判断单行 / 多行
        const isMultiLine =
            context.startLine !== null &&
            context.endLine !== null &&
            context.endLine > context.startLine;

        const template = isMultiLine
            ? this.settings.multiLineTemplate
            : this.settings.singleLineTemplate;

        // 路径格式化
        const displayPath = formatPath(
            context.path,
            this.settings.pathStyle,
            this.app,
        );

        // 选区截断（超大选区保护）
        const safeSelection = context.selection
            ? truncateSelection(context.selection, 100 * 1024, t('notice.truncated'))
            : context.selection;

        const templateCtx = buildTemplateContext(
            displayPath,
            safeSelection,
            context.startLine,
            context.endLine,
        );

        const formatted = renderTemplate(template, templateCtx);

        try {
            await navigator.clipboard.writeText(formatted);
            new Notice(t('notice.copied'));
        } catch {
            new Notice(t('notice.clipboardUnavailable'));
        }
    }

    /**
     * 文件列表场景：复制多文件路径。
     */
    private async copyFileList(files: string[]): Promise<void> {
        const lines = files.map((f) =>
            formatPath(f, this.settings.pathStyle, this.app),
        );
        const text = lines.join('\n') + '\n';

        try {
            await navigator.clipboard.writeText(text);
            new Notice(t('notice.copied'));
        } catch {
            new Notice(t('notice.clipboardUnavailable'));
        }
    }
}
