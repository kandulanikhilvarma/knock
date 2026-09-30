# Baseline — before state (2026-09-29, branch `enhance/2026-09-29` from `main@280bdbe`)

## Stack detected

| Item | Value | Evidence |
|---|---|---|
| Framework | Expo SDK 57, React Native 0.86.2, React 19.2.3, expo-router | `package.json` |
| Language | TypeScript 6 (`strict`) | `tsconfig.json` |
| Package manager | npm 10.9.4, `legacy-peer-deps=true` | `.npmrc`, `package-lock.json` |
| Node | v22.22.0 | `node -v` |
| Backend | Supabase (Postgres + RLS, Edge Functions, Realtime, Storage) | `supabase/` |
| Test runner | None. One assert script: `npm run test:dispatch` | `package.json` scripts |
| Linter | None configured | no eslint/biome config |
| CI | None. No `.github/` directory | `ls .github` |
| Build | `npx expo export -p web` | `vercel.json` |
| Deploy target | Vercel (web preview, git-linked). EAS for native (not yet run) | `vercel.json`, `eas.json` |

## Results

| Check | Command | Result | Time |
|---|---|---|---|
| Install | skipped (node_modules present, lockfile unchanged) | — | — |
| Lint | none configured | N/A | — |
| Type check | `npx tsc --noEmit` | PASS, 0 errors | 51 s |
| Unit tests | `npm run test:dispatch` | PASS, 1 file, all asserts. Warning: `MODULE_TYPELESS_PACKAGE_JSON` | 1.8 s |
| Build | `npx expo export -p web` | PASS | 2 m 38 s |

## Bundle

| Artifact | Size |
|---|---|
| `entry-*.js` (raw) | 3,548,603 B (3.5 MB) |
| `entry-*.js` (gzip) | 950,969 B (929 KB) |
| `index-*.js` | 45,532 B |
| `dist/` total | 22 MB |
| Icon font files shipped | 19 families (only `Ionicons` is used) |

Build log: `.enhance/build-before.log`.
