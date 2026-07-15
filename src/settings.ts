/**
 * 设置接口、默认值、设置标签页。
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import type NotePipePlugin from './main';
import { t } from './i18n';
import type { PathStyle } from './context-resolver';

// ---------------------------------------------------------------------------
// 设置接口
// ---------------------------------------------------------------------------

export interface NotePipeSettings {
    // 模板
    singleLineTemplate: string;
    multiLineTemplate: string;

    // 路径格式
    pathStyle: PathStyle;

    // 触发选项
    showFloatingButton: boolean;
    enableHotkey: boolean;

    // 始终复制模式（实验性）
    enableAlwaysCopy: boolean;
}

export const DEFAULT_SETTINGS: NotePipeSettings = {
    singleLineTemplate: '> {{path}}:{{startLine}}\n> {{selection}}',
    multiLineTemplate: '> {{path}}:{{startLine}}-{{endLine}}\n> {{selection}}',
    pathStyle: 'absolute',
    showFloatingButton: true,
    enableHotkey: true,
    enableAlwaysCopy: false,
};

// ---------------------------------------------------------------------------
// 设置标签页
// ---------------------------------------------------------------------------

export class NotePipeSettingTab extends PluginSettingTab {
    plugin: NotePipePlugin;

    constructor(app: App, plugin: NotePipePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // ── Templates ────────────────────────────────────────────────
        new Setting(containerEl).setName(t('settings.templates')).setHeading();
        containerEl.createEl('p', {
            text: t('settings.templatesDesc'),
            cls: 'setting-item-description',
        });

        new Setting(containerEl)
            .setName(t('settings.singleLine'))
            .setDesc(t('settings.singleLineDesc'))
            .addTextArea((textarea) => {
                textarea
                    .setValue(this.plugin.settings.singleLineTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.singleLineTemplate = value;
                        await this.plugin.saveSettings();
                    });
                textarea.inputEl.rows = 2;
                textarea.inputEl.style.width = '100%';
            });

        new Setting(containerEl)
            .setName(t('settings.multiLine'))
            .setDesc(t('settings.multiLineDesc'))
            .addTextArea((textarea) => {
                textarea
                    .setValue(this.plugin.settings.multiLineTemplate)
                    .onChange(async (value) => {
                        this.plugin.settings.multiLineTemplate = value;
                        await this.plugin.saveSettings();
                    });
                textarea.inputEl.rows = 2;
                textarea.inputEl.style.width = '100%';
            });

        // 变量参考
        const varRef = containerEl.createDiv({ cls: 'setting-item-description' });
        varRef.createEl('strong', { text: t('settings.variableReference') });
        const vars = [
            '{{path}}', '{{fileName}}', '{{startLine}}', '{{endLine}}',
            '{{selection}}', '{{lines}}', '{{folder}}',
        ];
        varRef.createEl('br');
        varRef.createEl('code', { text: vars.join('  ') });

        // ── Path 分组 ───────────────────────────────────────────────
        new Setting(containerEl).setName(t('settings.path')).setHeading();

        new Setting(containerEl)
            .setName(t('settings.pathStyle'))
            .setDesc(t('settings.pathStyleDesc'))
            .addDropdown((dropdown) => {
                dropdown
                    .addOption('absolute', t('settings.pathAbsolute'))
                    .addOption('vault-relative', t('settings.pathVaultRelative'))
                    .setValue(this.plugin.settings.pathStyle)
                    .onChange(async (value: string) => {
                        this.plugin.settings.pathStyle = value as PathStyle;
                        await this.plugin.saveSettings();
                    });
            });

        // ── Triggers 分组 ───────────────────────────────────────────
        new Setting(containerEl).setName(t('settings.triggers')).setHeading();

        new Setting(containerEl)
            .setName(t('settings.showFloatingButton'))
            .setDesc(t('settings.showFloatingButtonDesc'))
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.showFloatingButton)
                    .onChange(async (value) => {
                        this.plugin.settings.showFloatingButton = value;
                        await this.plugin.saveSettings();
                        // 动态启用/禁用浮层按钮需要重新加载插件
                    });
            });

        new Setting(containerEl)
            .setName(t('settings.enableHotkey'))
            .setDesc(t('settings.enableHotkeyDesc'))
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.enableHotkey)
                    .onChange(async (value) => {
                        this.plugin.settings.enableHotkey = value;
                        await this.plugin.saveSettings();
                    });
            });

        // ── Advanced 分组 ───────────────────────────────────────────
        new Setting(containerEl).setName(t('settings.advanced')).setHeading();

        const alwaysCopyWarning = containerEl.createDiv({
            cls: 'setting-item-description',
        });
        alwaysCopyWarning.createEl('strong', {
            text: t('settings.alwaysCopyWarning'),
        });

        new Setting(containerEl)
            .setName(t('settings.alwaysCopy'))
            .setDesc(t('settings.alwaysCopyDesc'))
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.enableAlwaysCopy)
                    .onChange(async (value) => {
                        this.plugin.settings.enableAlwaysCopy = value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
