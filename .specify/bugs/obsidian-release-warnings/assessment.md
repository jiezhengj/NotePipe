 - **Slug**: obsidian-release-warnings
 - **Created**: 2026-09-27
 - **Source**: Pasted Obsidian plugin review report for release `0.1.3` at commit `90f34aa`
 - **Verdict**: valid
 - **Severity**: high

# Report

The release review reports that release `0.1.3` has no directly attached `main.js`
or `manifest.json` assets. It also reports four `obsidianmd/prefer-create-el`
warnings in `src/floating-button.ts` and a missing declarative settings definition
in `src/settings.ts`, which prevents settings search on Obsidian 1.13.0 and newer.

# Symptom

Users and the Obsidian release checker cannot install release `0.1.3` from its
published assets because the required plugin files are absent. The source review
also flags DOM construction that bypasses Obsidian helpers and a settings tab that
is not indexed by the current settings search API.

# Reproduction

1. Inspect the GitHub release for tag `0.1.3`; its asset list is empty although the
   checker requires `main.js` and `manifest.json` as release assets.
2. Inspect `src/floating-button.ts`; four calls use `ownerDocument.createElement`
   or `createElementNS` instead of Obsidian's `createEl` and `createSvg` helpers.
3. Inspect `src/settings.ts`; `NotePipeSettingTab` overrides only `display()` and
   does not return definitions from `getSettingDefinitions()`.

# Suspected Code Paths

- `src/floating-button.ts:86-110` — creates the button and SVG nodes with raw DOM
  factories, which triggers `obsidianmd/prefer-create-el`.
- `src/settings.ts:41-147` — renders settings imperatively without declarative
  definitions for settings search.
- `.gitignore`, `esbuild.config.mjs`, and the release workflow — generated
  `main.js` is tracked in source but is not packaged and uploaded to releases.
- `package.json`, `manifest.json`, and `versions.json` — release version metadata
  and validation commands must remain consistent.

# Root Cause Hypothesis

The repository has a production build but no release packaging/upload automation,
and `main.js` was committed instead of being treated as generated release output.
The UI code predates Obsidian's helper and declarative settings APIs. Confidence is
high because the empty release asset list and all flagged source constructs are
visible in the current repository and GitHub release metadata.

# Proposed Remediation

**Preferred**: replace raw DOM creation with `body.createEl()` and
`button.createSvg()` while preserving the owner document and window for popouts.
Add `getSettingDefinitions()` for Obsidian 1.13+ and keep the existing `display()`
implementation as the compatibility fallback for older supported versions. Treat
`main.js` as ignored generated output, add a release validation/package command,
and add a GitHub Actions workflow that builds and uploads `main.js`, `manifest.json`,
and `styles.css` to the matching published release.

Because `0.1.3` is already published at an earlier commit, bump the fixed release
to `0.1.4` rather than moving the existing tag. This keeps the tag, source, and
uploaded artifacts consistent.

**Files likely to change**:

- `.gitignore`
- `.github/workflows/release.yml`
- `AGENTS.md`
- `src/floating-button.ts`
- `src/settings.ts`
- `package.json`
- `package-lock.json`
- `manifest.json`
- `versions.json`
- `tools/validate-release.mjs`
- generated `main.js` for local packaging only; it must not remain tracked

**Tests to add or update**:

- Run `npm test` and `npm run typecheck` for source regressions.
- Run `npm run build` and `npm run validate-release -- --tag 0.1.4` to verify the
  generated bundle and release metadata.
- Run `git diff --check` and verify `git ls-files main.js` returns no result.
- Inspect the published release asset list with `gh release view` after upload.

# Risks & Considerations

- Keeping `display()` is necessary because the manifest still supports Obsidian
  versions older than 1.13.0; declarative definitions must not remove that fallback.
- Ignoring `main.js` changes source checkout installation: users building from the
  repository must run `npm install` and `npm run build`, while release users receive
  the attached bundle.
- The workflow requires GitHub Actions `contents: write` permission and only runs
  after a release is published.
- The actual Obsidian settings-search UI and popout window cannot be exercised by
  the repository's unit-test environment.

# Open Questions

- None blocking the assessed fix.
