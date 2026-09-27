# Bug Assessment: Independent review blockers

- **Slug**: agy-review-blockers
- **Created**: 2026-09-27
- **Source**: Pasted text from the independent `agy` review run in this repository
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

The independent `agy` review returned `FAIL`. It identified data corruption in
template rendering, incorrect context precedence for global copy, a non-functional
hotkey setting, inconsistent release metadata, a misspelled build external, floating
button problems in popout or narrow windows, missing automated tests, and an empty
Spec Kit constitution.

The constitution blocker has been resolved separately by replacing the placeholder
with a project-specific constitution. The remaining findings are assessed here as
one coordinated bug-fix package because they affect the same copy workflow and its
release quality gates.

## Symptom

Users can lose or alter selected text when it contains replacement-sensitive `$`
sequences or a literal `\\n`, and the global copy command can copy a selected file
list instead of the selected note text. The settings UI presents a hotkey switch that
does not control any behavior; release metadata and build configuration are also
inconsistent, while the floating button can be mounted in the wrong window or outside
the viewport. The repository has no automated regression suite for these paths.

## Reproduction

1. Render a template with a selection containing `$1`, `$&`, `$100`, or the literal
   characters `\\n`; observe that JavaScript replacement semantics or the final newline
   conversion changes the user content.
2. Open a note from the file explorer, select text in reading mode, and invoke global
   copy; observe that the persistent `.nav-file.is-selected` element can cause the file
   list branch to run before the note selection branch.
3. Inspect the settings and release files; observe the unused `enableHotkey` switch,
   `package.json` version `0.1.0` versus plugin metadata `0.1.2`, and
   `string_decacer` in the build externals.
4. Select text near the right edge or in an Obsidian popout window; observe that the
   button is appended through the main document and its left coordinate is not clamped
   to the active viewport.
5. Run `npm test`; observe that no test script exists. Run `npm ls`; observe that the
   repository checkout has no installed dependencies until installation is performed.

## Suspected Code Paths

- `src/template-engine.ts:renderTemplate()` — string replacements use replacement
  strings and convert `\\n` after context insertion.
- `src/main.ts:copyGlobalContext()` — file explorer detection runs before active note
  selection handling.
- `src/settings.ts:NotePipeSettings` and `NotePipeSettingTab.display()` — expose and
  persist `enableHotkey` without reading it during command registration or execution.
- `src/floating-button.ts:SharedFloatingButton` and
  `FloatingButtonManager.onSelectionChange()` — use the global document and only
  clamp the left edge.
- `esbuild.config.mjs` — contains the misspelled Node builtin external.
- `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` — release
  version metadata must agree.
- `tests/template-engine.test.ts` and related focused tests — missing regression
  coverage for the pure copy logic.

## Root Cause Hypothesis

The root causes are direct use of JavaScript replacement-string semantics for
user-controlled values, a duplicated file-list preflight that violates the resolver's
documented precedence, stale settings and release metadata left after earlier product
decisions, and UI code that assumes the main window is the active DOM owner. Confidence
is high because the affected branches are visible in the current source and the
`agy` reviewer reproduced the data corruption with executable checks.

## Proposed Remediation

**Preferred**: process template escape sequences before inserting context values and
use callback replacements for every placeholder. Remove the duplicated file-list
preflight so `resolveContext()` decides between active editor, reading-mode selection,
and file explorer in the documented order. Remove the unused `enableHotkey` setting and
its bilingual strings, align package metadata to `0.1.2`, correct the build external,
and make the floating button use the selected range's owner document and viewport with
both horizontal and vertical bounds. Add a small Vitest suite for template rendering,
context construction, and truncation, plus the scripts needed to run tests and type
checking.

The fix must preserve the existing public command IDs, template variables, output
format, and localized user-facing behavior. The build output `main.js` is generated
from `src/` and must be refreshed by the production build rather than edited as an
independent source.

**Files likely to change**:

- `.specify/memory/constitution.md`
- `src/template-engine.ts`
- `src/main.ts`
- `src/settings.ts`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/zh.ts`
- `src/floating-button.ts`
- `esbuild.config.mjs`
- `package.json`
- `package-lock.json`
- `tests/template-engine.test.ts`
- `tests/context-resolver.test.ts`
- `tests/floating-button.test.ts`
- generated `main.js` after `npm run build`

**Tests to add or update**:

- Render all placeholders with `$`, backslashes, literal `\\n`, Unicode, and empty
  values without changing the inserted data.
- Verify `buildTemplateContext()` line and folder values and `truncateSelection()`
  byte limits.
- Verify the active context resolver remains ordered editor, reading mode, file
  explorer, then active-file fallback using focused mocks where the Obsidian runtime
  is not required.
- Verify floating-button placement stays inside the owner window's viewport and the
  button is attached to that window's document.
- Run `npm test`, `npm run typecheck`, and `npm run build`.

## Risks & Considerations

- Removing `enableHotkey` changes only the settings UI and removes a setting that never
  controlled the Obsidian command; existing saved data is ignored safely.
- Popout support depends on the selection range's owner document and its default view;
  a manual Obsidian popout check remains useful because the test environment is not a
  full Obsidian runtime.
- Adding Vitest changes development dependencies and requires a dependency install;
  the lockfile must remain reproducible.
- `main.js` is generated output and should change only as the source build result.

## Open Questions

- None blocking the proposed remediation.
