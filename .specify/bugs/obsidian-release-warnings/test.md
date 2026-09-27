- **Slug**: obsidian-release-warnings
- **Tested**: 2026-09-27
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

# Summary

The release asset failure and source-review findings are resolved in the published
`0.1.5` release. The automated workflow completed successfully on GitHub and the
release contains all required assets. A live Obsidian desktop settings-search and
popout interaction was not available in this shell environment, so the result is
partial rather than end-to-end verified.

# Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Release reproduction before fix | `gh release view 0.1.3` | pass | Confirmed the original release had no assets. |
| Source DOM review | `rg -n "createElement|createElementNS" src` | pass | No raw DOM factory calls remain. |
| Settings API review | Inspect `src/settings.ts` | pass | `getSettingDefinitions()` exists and `display()` remains as fallback. |
| Unit tests | `npm test` | pass | 3 files and 8 tests passed. |
| Type check | `npm run typecheck` | pass | No TypeScript diagnostics. |
| Release preparation | `npm run release:prepare -- --tag 0.1.5` | pass | Build and asset/version validation passed. |
| Clean dependency install | `npm ci --ignore-scripts --no-audit` | pass | Lockfile is compatible with the CI install path. |
| Dependency audit | `npm audit --omit=optional` | pass | 0 vulnerabilities. |
| GitHub release workflow | `gh run view 36292595380` | pass | `0.1.5` workflow succeeded end-to-end. |
| Release assets | `gh release view 0.1.5` | pass | `main.js`, `manifest.json`, and `styles.css` are attached. |
| Generated output tracking | `git ls-files main.js` | pass | No output; `main.js` is not tracked. |
| Formatting | `git diff --check` | pass | No whitespace errors. |
| Obsidian desktop UI | Manual popout/settings-search check | not-run | The current environment has no Obsidian desktop runtime. |

# Failure and Recovery Evidence

The first `0.1.4` workflow run failed during `npm ci` because the lockfile did not
provide a peer-compatible esbuild for Vitest's Vite dependency. The project now
uses esbuild `0.28.2`, and the `0.1.5` workflow passed dependency installation,
build, validation, and upload.

# Residual Risks

- Obsidian 1.13+ settings search was verified by the declarative implementation and
  type-checking, but not through the live settings UI.
- Popout-window button rendering still needs one manual check in Obsidian desktop.
- GitHub Actions emitted deprecation annotations for Node 20-based action versions;
  they did not affect the successful run.

# Recommendation

Keep `0.1.5` as the current release. Perform the manual Obsidian popout and settings
search checks before declaring the bug fully verified.
