import en from './locales/en';
import zh from './locales/zh';

const locales: Record<string, Record<string, string>> = { en, zh };

let currentLang: 'en' | 'zh' = 'en';

/**
 * 从 localStorage 读取 Obsidian 的语言设置并加载对应的 locale。
 * 应在插件 onload() 早期调用，确保后续 t() 调用使用正确的语言。
 */
export function loadLocale(): void {
    try {
        const lang = (typeof localStorage !== 'undefined'
            ? localStorage.getItem('language')
            : null) || 'en';
        currentLang = lang.startsWith('zh') ? 'zh' : 'en';
    } catch {
        currentLang = 'en';
    }
}

/**
 * 获取翻译字符串。
 * @param key 翻译 key
 * @param args 可选替换参数，替换模板中的 {0}, {1}, ...
 * @returns 翻译后的字符串
 */
export function t(key: string, ...args: string[]): string {
    const template = locales[currentLang]?.[key] ?? locales['en'][key] ?? key;
    return args.reduce((s, arg, i) => s.replace(`{${i}}`, arg), template);
}

/**
 * 获取当前语言代码。
 */
export function getCurrentLanguage(): 'en' | 'zh' {
    return currentLang;
}
