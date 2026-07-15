export default {
    // 命令
    'command.copyWithContext': '复制并附带上下文',
    'command.copyWithContextGlobal': '复制并附带上下文（全局）',

    // 通知
    'notice.noContext': '无可用上下文',
    'notice.noActiveFile': '无活动文件',
    'notice.noTextSelected': '未选中文本',
    'notice.copied': '已复制（附带上下文）',
    'notice.clipboardUnavailable': '剪贴板不可用',
    'notice.truncated': '...（已截断）',

    // 浮层按钮
    'floating.label': '复制上下文',
    'floating.tooltip': '复制文件路径和行号',

    // 设置
    'settings.templates': '模板',
    'settings.templatesDesc': '使用变量自定义输出格式。',
    'settings.singleLine': '单行模板',
    'settings.singleLineDesc': '选中单行文本时使用。',
    'settings.multiLine': '多行模板',
    'settings.multiLineDesc': '选中多行文本时使用。',
    'settings.variableReference': '可用变量',
    'settings.path': '路径',
    'settings.pathStyle': '路径格式',
    'settings.pathStyleDesc': '绝对路径：完整路径，可直接在终端定位。库相对路径：跨机器可移植。',
    'settings.pathAbsolute': '绝对路径',
    'settings.pathVaultRelative': '库相对路径',
    'settings.triggers': '触发方式',
    'settings.showFloatingButton': '显示浮层按钮',
    'settings.showFloatingButtonDesc': '选中文本时显示浮层复制按钮。',
    'settings.enableHotkey': '启用快捷键',
    'settings.enableHotkeyDesc': '启用 Ctrl+Shift+C / Cmd+Shift+C 快捷键。',
    'settings.advanced': '高级',
    'settings.alwaysCopy': '始终复制模式（实验性）',
    'settings.alwaysCopyDesc': '每次选中文本时自动附带上下文复制。可能导致性能问题。',
    'settings.alwaysCopyWarning': '⚠️ 实验性功能：可能与剪贴板管理器冲突。',
} as const;
