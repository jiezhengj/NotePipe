<!--
Sync Impact Report
- Version change: template placeholder → 1.0.0
- Modified principles: placeholder principles → Context correctness, Data preservation, Scenario coverage, Testable changes, Obsidian compatibility
- Added sections: Product constraints; Development workflow
- Removed sections: none
- Follow-up TODOs: none
-->

# NotePipe Constitution

## Core Principles

### I. Context correctness

NotePipe MUST produce context that identifies the intended Obsidian source, selected
content, and line range for every supported scenario. The implementation MUST keep
editor selection, reading-mode selection, and file-explorer selection distinct, and
MUST resolve the most specific active context before falling back to less specific
contexts. A change that alters context precedence MUST include a regression check for
each affected scenario.

### II. Data preservation

Copy operations MUST preserve user-authored content byte-for-byte except for the
documented Markdown quoting and template transformations. Template substitution MUST
treat all context values as literal data, including dollar signs, backslashes,
newlines, Unicode characters, and empty values. Any truncation or normalization MUST
be explicit in the user-visible behavior and covered by a test.

### III. Scenario coverage

Every user-facing change MUST account for edit mode, reading mode, file explorer, and
the floating-button path when the change touches shared copy logic. Unsupported or
unavailable context MUST produce the existing localized notice instead of silently
copying a different source. Desktop popout windows and narrow viewport boundaries
are supported environments for UI behavior.

### IV. Testable changes

Pure functions MUST remain independently testable without an Obsidian runtime. Changes
to template rendering, context precedence, path formatting, truncation, or settings
behavior MUST add or update automated tests that fail for the reported regression and
pass after the fix. A change is not complete until the relevant tests, type-check, and
production build have been run or an environment limitation is recorded.

### V. Obsidian compatibility and minimal scope

The plugin MUST use public Obsidian APIs and clean up listeners, DOM nodes, and
interceptors during unload. Browser and window-specific DOM work MUST use the document
and viewport belonging to the active Obsidian window. Fixes MUST remain focused on the
reported behavior, preserve the existing public plugin commands and template
variables, and avoid adding dependencies unless the project needs them for a tested
capability.

## Product Constraints

NotePipe is a TypeScript Obsidian desktop plugin that copies selected note content or
file paths into Markdown-friendly text for use in terminal-based AI tools. The
supported UI languages are English and Chinese. The default output uses absolute
paths, while vault-relative paths remain available as a setting. The plugin does not
own or modify note content; it only reads the active context and writes to the
system clipboard.

## Development Workflow

Bug fixes MUST begin with a code-grounded assessment, identify the affected behavior
and acceptance evidence, and record the remediation under `.specify/bugs/<slug>/`.
Implementation MUST stay within the assessed scope unless the fix report records a
newly discovered dependency. Before review, the maintainer MUST run the focused tests,
type-check, production build, and relevant manual or scripted regression checks.
Version metadata in `package.json`, `manifest.json`, and `versions.json` MUST remain
consistent for a release. Changes to user-visible behavior MUST update the English
and Chinese strings or documentation when applicable.

## Governance

This constitution is the project baseline for substantive engineering work. A change
that conflicts with a principle MUST document the conflict, its user impact, and the
approval or follow-up required to remove the exception. Amendments MUST update the
Sync Impact Report, use semantic versioning, preserve the project language setting,
and be reviewed together with the implementation evidence. Every substantive review
MUST verify the relevant principles, automated checks, and any recorded residual
risk.

**Version**: 1.0.0 | **Ratified**: 2026-09-26 | **Last Amended**: 2026-09-27
