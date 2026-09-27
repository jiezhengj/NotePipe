import { describe, expect, it } from 'vitest';

const { formatPath, resolveContext } = await import('../src/context-resolver');

describe('context resolver', () => {
    it('keeps vault-relative paths portable without a desktop adapter', () => {
        expect(
            formatPath('notes/daily.md', 'absolute', {
                vault: { adapter: {} },
            } as never),
        ).toBe('notes/daily.md');
    });

    it('resolves an editor selection before less-specific fallbacks', async () => {
        const editor = {
            getSelection: () => 'selected text',
            getCursor: (side: 'from' | 'to') =>
                side === 'from' ? { line: 1 } : { line: 2 },
        };
        const view = { file: { path: 'notes/daily.md' } };

        await expect(
            resolveContext({} as never, editor as never, view as never),
        ).resolves.toMatchObject({
            source: 'editor-edit',
            path: 'notes/daily.md',
            selection: 'selected text',
            startLine: 2,
            endLine: 3,
        });
    });
});
