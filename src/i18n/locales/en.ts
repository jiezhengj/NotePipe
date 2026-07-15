export default {
    // Commands
    'command.copyWithContext': 'Copy with context',
    'command.copyWithContextGlobal': 'Copy with context (global)',

    // Notices
    'notice.noContext': 'No context available',
    'notice.noActiveFile': 'No active file',
    'notice.noTextSelected': 'No text selected',
    'notice.copied': 'Copied with context',
    'notice.clipboardUnavailable': 'Clipboard unavailable',
    'notice.truncated': '... (truncated)',

    // Floating button
    'floating.label': 'Copy context',
    'floating.tooltip': 'Copy with file path and line number',

    // Settings
    'settings.templates': 'Templates',
    'settings.templatesDesc': 'Use variables to customize the output format.',
    'settings.singleLine': 'Single-line template',
    'settings.singleLineDesc': 'Used when selection spans a single line.',
    'settings.multiLine': 'Multi-line template',
    'settings.multiLineDesc': 'Used when selection spans multiple lines.',
    'settings.variableReference': 'Available variables',
    'settings.path': 'Path',
    'settings.pathStyle': 'Path format',
    'settings.pathStyleDesc': 'Absolute: full path, ready for terminal use. Vault-relative: portable across machines.',
    'settings.pathAbsolute': 'Absolute',
    'settings.pathVaultRelative': 'Vault-relative',
    'settings.triggers': 'Triggers',
    'settings.showFloatingButton': 'Show floating button',
    'settings.showFloatingButtonDesc': 'Show a floating copy button when text is selected.',
    'settings.enableHotkey': 'Enable hotkey',
    'settings.enableHotkeyDesc': 'Enable Ctrl+Shift+C / Cmd+Shift+C shortcut.',
    'settings.advanced': 'Advanced',
    'settings.alwaysCopy': 'Always copy mode (experimental)',
    'settings.alwaysCopyDesc': 'Automatically copy with context on every text selection. May cause performance issues.',
    'settings.alwaysCopyWarning': '⚠️ Experimental: may conflict with clipboard managers.',
} as const;
