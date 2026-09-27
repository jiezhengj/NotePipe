# Bug Verification: Independent review blockers

- **Slug**: agy-review-blockers
- **Tested**: 2026-09-27
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

The automated reproductions for template corruption, editor-context precedence,
viewport clamping, metadata consistency, and dependency health now pass. The full
Obsidian desktop popout interaction was not available in this checkout, so the result
is partial rather than an end-to-end verified close.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | `npm test` | pass | 3 files and 8 tests cover `$`, literal `\\n`, UTF-8 limits, editor precedence, and viewport edges. |
| New / updated tests | `npm test` | pass | Vitest 4.1.11 completed with 0 failed tests. |
| Regression suite | `npm run typecheck` | pass | TypeScript completed with no diagnostics. |
| Lint / type-check | `npm run typecheck` | pass | No separate lint command is configured. |
| Production build | `npm run build` during fix phase | pass | `main.js` regenerated successfully; not rerun here because the bug-test guardrail prohibits source writes. |
| Release metadata | Node JSON assertion | pass | `package.json` and `manifest.json` are `0.1.2`, and `versions.json` contains `0.1.2`. |
| Dependency audit | `npm audit --omit=optional` | pass | 0 vulnerabilities. |
| Governance | `python tools/spec-kit-governance/governance.py doctor` | pass with optional warning | Constitution and `agy` integration are READY; optional governed-sdd companion is not installed. |
| Formatting | `git diff --check` | pass | No whitespace errors in tracked changes. |
| Obsidian popout manual check | Actual desktop popout interaction | not-run | This shell checkout does not provide an Obsidian UI runtime. |

## Output Excerpts

- `Test Files 3 passed (3)` and `Tests 8 passed (8)`.
- `npm run typecheck` exited 0.
- `npm audit --omit=optional`: `found 0 vulnerabilities`.
- Version assertion: `version metadata OK: 0.1.2`.
- Governance doctor: `constitution.status = READY` and integration status `READY`.

## Residual Risks

- The owner-document and multi-window listener changes are covered by code inspection
  and pure positioning tests, but not by a live Obsidian popout window.
- The optional `governed-sdd` companion is not installed; the project remains on its
  configured adaptive workflow and the official `assess` and `bug` extensions are
  available.

## Recommendation

Keep the code fix applied and request one manual Obsidian desktop check for a popout
window and a selection near the right edge. If that check passes, close this bug as
verified; otherwise rerun the assessment with the observed UI evidence.
