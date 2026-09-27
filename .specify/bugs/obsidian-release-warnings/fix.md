- **Slug**: obsidian-release-warnings
- **Fixed**: 2026-09-27
- **Assessment**: ./assessment.md
- **Status**: applied

# Summary

The release path now treats `main.js` as generated output, validates the matching
plugin metadata and release files, and uploads the build artifacts automatically
after a GitHub Release is published. The floating button uses Obsidian DOM helpers,
and the settings tab provides searchable declarative definitions while retaining
the legacy rendering fallback.

# Changes

| File | Change | Notes |
|------|--------|-------|
| `.gitignore` | modified | Ignores generated `main.js`. |
| `.github/workflows/release.yml` | added | Builds and uploads `main.js`, `manifest.json`, and `styles.css`. |
| `AGENTS.md` | modified | Records release, DOM-helper, and settings API rules. |
| `src/floating-button.ts` | modified | Replaces raw DOM factories and uses the owner window for timeout cleanup. |
| `src/settings.ts` | modified | Adds `getSettingDefinitions()` and preserves `display()` for older Obsidian versions. |
| `tools/validate-release.mjs` | added | Checks versions, tag alignment, required assets, and release manifest contents. |
| `package.json` | modified | Bumps to `0.1.4` and adds release preparation/validation scripts. |
| `package-lock.json` | modified | Keeps the lockfile root version at `0.1.4`. |
| `manifest.json` | modified | Bumps plugin version to `0.1.4`. |
| `versions.json` | modified | Adds the `0.1.4` minimum-version entry. |
| `main.js` | removed from Git | Remains available after a local build but is no longer committed. |

# Tests Added or Updated

- No new runtime test was required for the pure copy logic; the existing 8-test
  Vitest suite remains the regression suite for this change.
- `tools/validate-release.mjs` provides an executable release asset check used both
  locally and by GitHub Actions.

# Local Verification

- `npm test` → pass, 3 test files and 8 tests.
- `npm run typecheck` → pass, TypeScript emitted no diagnostics.
- `npm run release:prepare -- --tag 0.1.4` → pass; production build and release
  validation succeeded for `main.js`, `manifest.json`, and `styles.css`.
- `npm run validate-release -- --tag 0.1.3` → expected failure; the validator
  rejected the tag/version mismatch.
- `npm audit --omit=optional` → pass, 0 vulnerabilities.
- `rg -n "createElement|createElementNS" src` → no matches.
- `git diff --check` → pass.
- `git ls-files main.js` → no output; the generated bundle is not tracked.

# Deviations from Assessment

- The published `0.1.3` tag is not moved. The fixed release uses `0.1.4` so the
  source commit and uploaded assets remain immutable and consistent.
- The existing imperative settings UI was retained as a fallback because the
  manifest still supports Obsidian versions below 1.13.0.

# Follow-ups

- Push the commit and tag `0.1.4` with `gh`/Git transport.
- Publish release `0.1.4` and verify that the workflow uploads all three assets.
