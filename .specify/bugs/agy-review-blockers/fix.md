# Bug Fix: Independent review blockers

- **Slug**: agy-review-blockers
- **Fixed**: 2026-09-27
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

The copy workflow now preserves literal user content, resolves active note context
before stale file-explorer selection, and mounts and positions the floating button in
the active window. The unused hotkey setting and build typo were removed, release
metadata was aligned to `0.1.2`, and a focused Vitest suite plus type-check and build
scripts were added.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `.specify/memory/constitution.md` | modified | Replaced the Spec Kit placeholder with project principles and governance rules. |
| `src/template-engine.ts` | modified | Processes template escapes first, uses callback replacements, and checks UTF-8 bytes on the fast path. |
| `src/main.ts` | modified | Removes the stale file-list preflight from global copy. |
| `src/settings.ts` | modified | Removes the non-functional `enableHotkey` setting and toggle. |
| `src/i18n/locales/en.ts` | modified | Removes obsolete hotkey strings. |
| `src/i18n/locales/zh.ts` | modified | Removes obsolete hotkey strings. |
| `src/floating-button.ts` | modified | Uses owner documents/windows, observes popout documents, and clamps both viewport axes. |
| `src/floating-position.ts` | added | Pure viewport-clamping helper for UI behavior and tests. |
| `esbuild.config.mjs` | modified | Corrects `string_decoder`. |
| `package.json` | modified | Aligns version to `0.1.2` and adds test/typecheck scripts and Vitest. |
| `package-lock.json` | modified | Records the aligned version and reproducible Vitest 4.1.11 dependency tree. |
| `tests/template-engine.test.ts` | added | Covers `$`, literal `\\n`, Unicode byte limits, metadata, and empty values. |
| `tests/context-resolver.test.ts` | added | Covers editor selection precedence and portable path fallback. |
| `tests/floating-position.test.ts` | added | Covers all viewport edges and undersized viewports. |
| `tests/obsidian-stub.ts` | added | Supplies a test-only Obsidian runtime stub. |
| `vitest.config.mjs` | added | Aliases the Obsidian runtime for focused unit tests. |
| `main.js` | generated | Refreshed from the corrected TypeScript source with the production build. |

## Diff Highlights (optional)

Template values are now inserted through replacement callbacks, so JavaScript does not
interpret `$1`, `$&`, or `$100` as replacement syntax. The template's own `\\n` escape
is converted before user values are inserted, so a literal `\\n` inside selected code
remains unchanged.

Global copy now lets `resolveContext()` select the active editor or reading-mode
selection before checking the file explorer. Floating-button events are registered for
all open view documents and newly created layout documents, and its position is clamped
to the active window's dimensions.

## Tests Added or Updated

- `tests/template-engine.test.ts` — preserves replacement-sensitive text and verifies
  UTF-8 truncation and context metadata.
- `tests/context-resolver.test.ts` — verifies editor selection resolution and path
  fallback without an Obsidian runtime.
- `tests/floating-position.test.ts` — verifies viewport-safe positioning.

## Local Verification

- `npm test` → pass, 3 test files and 8 tests.
- `npm run typecheck` → pass, TypeScript emitted no diagnostics.
- `npm run build` → pass, production bundle regenerated `main.js`.
- `npm audit --omit=optional` → pass, 0 vulnerabilities.
- `python tools/spec-kit-governance/governance.py doctor` → pass, constitution and
  native `agy` integration report `READY`; optional governed-sdd companion remains
  uninstalled and is not required for this adaptive Bug Fix route.

## Deviations from Assessment

- Added `src/floating-position.ts` and a test-only Obsidian stub/config so viewport and
  context behavior can be tested without loading Obsidian's non-runnable package entry.
- The UTF-8 fast path in `truncateSelection()` was corrected after the new regression
  test exposed that the existing character-count shortcut bypassed byte-based limits.
- Vitest was pinned to `4.1.11` instead of the first compatible `3.x` attempt because
  the latter produced an npm audit vulnerability report. The final dependency tree is
  compatible with the existing `esbuild@0.25.x` build chain and has no audit findings.

## Follow-ups

- Manual verification in an actual Obsidian desktop popout remains useful because the
  unit suite cannot simulate Obsidian's full multi-window workspace.
