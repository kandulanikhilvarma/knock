# Toolbox inventory — this session

| Need | Covered by | Use in phase |
|---|---|---|
| Correctness / reliability review | `ecc:code-reviewer` agent (spawn failed: classifier error ×3). Lead did a manual review instead | 1 |
| Security + production readiness | `ecc:security-reviewer` agent | 1 |
| Performance / architecture / DX | `ecc:react-reviewer` agent (spawn failed ×3). Lead did a manual review instead | 1 |
| Accessibility / UX / visual design | `general-purpose` agent (code read) | 1 |
| Project-rule compliance (Do-NOT list, tokens, i18n parity) | `build-guard` project agent | 1, 6 |
| Screenshots + interaction checks | Claude Browser pane (`mcp__Claude_Browser__*`) on the Expo web dev server (`.claude/launch.json` → `web`) | 2, 4, 6 |
| Design inspiration | Mobbin MCP (`search_screens`/`search_flows`) | 2 |
| DB types / advisors (read-only) | Supabase MCP (`generate_typescript_types`, `get_advisors`) | 1, 4 |
| Diagram validation | Mermaid validator MCP | 5 |
| Prose standard | `ste100` skill (reports, docs, commits) | all |
| Git / PR | `git` + `gh` CLI | 6 |

## Not used, and why

- Figma, Magic Patterns, Unsplash, fonts MCPs: the design direction ("Doorstep") is approved and locked in `CLAUDE.md`. The run extends it and does not need new assets.
- SEO tools: the web export is a demo preview of a native app, not a marketing site. A small metadata fix is enough.
- Chrome DevTools MCP: failed to connect (timeout). The Browser pane covers the need.

## GAPS (recommendations, not installed)

1. **ESLint (`eslint-config-expo`)**: the repo has no linter. `npx expo lint` sets it up in one step. It needs a new devDependency, so the user must approve it.
2. **Maestro or Detox e2e**: the booking loop has no automated end-to-end test. It needs a device or simulator and an account.
3. **Lighthouse CLI**: no web performance score is on record. It is not installed, so this run uses bundle size as the performance metric.
