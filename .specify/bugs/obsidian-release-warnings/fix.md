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
| `package.json` | modified | Adds release scripts, then updates the final patch release to `0.1.5` and aligns esbuild with Vitest's Vite peer. |
| `package-lock.json` | modified | Keeps the lockfile root version at `0.1.5` and records esbuild `0.28.2` for clean CI installs. |
| `manifest.json` | modified | Bumps the final plugin version to `0.1.5`. |
| `versions.json` | modified | Adds the `0.1.4` and `0.1.5` minimum-version entries. |
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
- `npm ci --ignore-scripts --no-audit` → pass after aligning esbuild to `0.28.2`;
  this reproduces the clean-install path used by GitHub Actions.
- `npm audit --omit=optional` → pass, 0 vulnerabilities.
- `rg -n "createElement|createElementNS" src` → no matches.
- `git diff --check` → pass.
- `git ls-files main.js` → no output; the generated bundle is not tracked.

# Deviations from Assessment

- The published `0.1.3` and `0.1.4` tags are not moved. `0.1.4` contains the
  source/release-asset fixes; `0.1.5` also contains the CI dependency correction.
- The existing imperative settings UI was retained as a fallback because the
  manifest still supports Obsidian versions below 1.13.0.

# Post-release automation correction

The first `0.1.4` workflow run failed at `npm ci` because the lockfile did not
contain a peer-compatible esbuild for the Vite version selected by Vitest. The
dependency range and lockfile now use esbuild `0.28.2`; the corrected automation
will be verified by the `0.1.5` release workflow.

# Follow-ups

- Push the dependency correction and tag `0.1.5` with `gh`/Git transport.
- Publish release `0.1.5` and verify that its workflow completes and uploads all
  three assets.
