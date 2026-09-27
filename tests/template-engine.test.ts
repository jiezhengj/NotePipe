import { describe, expect, it } from 'vitest';
import {
    buildTemplateContext,
    renderTemplate,
    truncateSelection,
} from '../src/template-engine';

describe('template engine', () => {
    it('preserves replacement-sensitive selection and template escapes', () => {
        const context = buildTemplateContext(
            '/vault/$file.md',
            'const value = "$100"; const match = "$1 $&";\nconst text = "hello\\nworld";',
            7,
            8,
        );

        const rendered = renderTemplate(
            '> {{path}}:{{startLine}}-{{endLine}}\\n> {{selection}}',
            context,
        );

        expect(rendered).toBe(
            '> /vault/$file.md:7-8\n' +
                '> const value = "$100"; const match = "$1 $&";\n' +
                '> const text = "hello\\nworld";',
        );
    });

    it('renders empty optional context values without leaking placeholders', () => {
        const context = buildTemplateContext('note.md', null, null, null);

        expect(renderTemplate('{{path}} {{startLine}} {{selection}} {{lines}}', context)).toBe(
            'note.md   ',
        );
    });

    it('builds line and folder metadata', () => {
        expect(buildTemplateContext('notes/daily.md', null, 3, 3)).toMatchObject({
            fileName: 'daily',
            folder: 'notes',
            lines: 'Line 3',
        });
        expect(buildTemplateContext('notes/daily.md', null, 3, 5).lines).toBe(
            'Lines 3-5',
        );
    });

    it('truncates by UTF-8 byte length', () => {
        expect(truncateSelection('你好世界', 6, '[cut]')).toBe('你好[cut]');
        expect(truncateSelection('short', 100)).toBe('short');
    });
});
