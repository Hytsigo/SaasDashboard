# AGENTS.md

Operational guidance for coding agents working in this repository.

## Project Snapshot

- Stack: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4.
- Package manager: npm (lockfile present: `package-lock.json`).
- Source layout: `src/app/` (App Router under `src`).
- Path alias: `@/*` maps to `src/*` (`tsconfig.json`).
- TypeScript mode: `strict: true`, `noEmit: true`.
- Linting: ESLint 9 with `eslint-config-next` (`core-web-vitals` + TypeScript rules).

## Rule Sources (Cursor/Copilot)

- Checked for Cursor rules in `.cursor/rules/` and `.cursorrules`: none found.
- Checked for Copilot rules in `.github/copilot-instructions.md`: none found.
- If these files are added later, treat them as high-priority repository instructions.

## Install

- Install dependencies: `npm install`

## Run Commands

- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Start production server: `npm run start`
- Run linter: `npm run lint`

## Lint and Type Check Details

- Lint entire repo: `npm run lint`
- Lint a single file: `npm run lint -- src/app/(dashboard)/page.tsx`
- Lint a directory: `npm run lint -- app`
- Run TypeScript check explicitly: `npx tsc --noEmit`
- Note: `npm run build` should also surface type/lint/build-time issues.

## Test Commands

- There is currently no test framework configured (no Jest/Vitest/Playwright/Cypress config, no test script).
- Current practical verification path:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
- If adding a test runner, also add scripts to `package.json`:
  - `test` for full suite
  - `test:watch` for local iteration
  - `test:single` (or framework equivalent) for single-test execution

## Single-Test Execution (When Framework Is Added)

- Vitest single file: `npx vitest run path/to/file.test.ts`
- Vitest single test name: `npx vitest run -t "test name"`
- Jest single file: `npx jest path/to/file.test.ts`
- Jest single test name: `npx jest -t "test name"`
- Playwright single spec: `npx playwright test e2e/example.spec.ts`
- Playwright single test title: `npx playwright test -g "test title"`

## File and Routing Conventions

- Follow Next.js App Router conventions in `src/app/`:
  - Route file: `page.tsx`
  - Layout file: `layout.tsx`
  - Global styles: `src/app/globals.css`
- Keep route-specific components close to their route when practical.
- Use server components by default; add `"use client"` only when required.

## Import Conventions

- Order imports in this sequence:
  1. framework/library imports (`next`, `react`, third-party)
  2. internal absolute imports (`@/...`)
  3. relative imports (`./...`, `../...`)
- Separate import groups with one blank line.
- Prefer absolute imports via `@/` when crossing directories.
- Prefer `import type` for type-only imports.
- Avoid deep relative chains when `@/` alias is clearer.

## TypeScript Guidelines

- Keep `strict` compatibility; do not add `any` unless unavoidable and justified.
- Prefer explicit return types for exported functions/utilities.
- Use narrow union types and discriminated unions for variant states.
- Model domain data with `type`/`interface` near usage or in shared modules.
- Validate external/untrusted data at boundaries (API, env, request payloads).
- Avoid non-null assertions (`!`) unless proven safe.

## React and Next.js Style

- Components: PascalCase names (e.g., `DashboardCard`).
- Hooks: `useX` naming and call only at top level.
- Keep components focused; extract repeated UI into reusable components.
- Prefer semantic HTML and accessible attributes.
- Use `next/image` for optimized images where applicable.
- Use `next/link` for internal navigation.
- Keep metadata in `export const metadata` where relevant.

## Naming Conventions

- Files for components: PascalCase when single exported component file.
- Route files remain framework-conventional lowercase (`page.tsx`, `layout.tsx`).
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE only for true constants.
- Types/interfaces/enums: PascalCase.
- CSS custom properties: kebab-case with clear prefixes when needed.

## Styling Conventions

- Use Tailwind utility classes for most styling.
- Keep design tokens in CSS variables (`src/app/globals.css`) when shared.
- Reuse existing color/font variables before introducing new tokens.
- Avoid inline styles unless dynamic styles cannot be represented cleanly.
- Prefer mobile-first responsive class patterns.

## Formatting Expectations

- Follow existing formatting in repository files (2-space indentation, semicolons).
- Use double quotes in TS/JS files to match current codebase.
- Keep lines reasonably short; split long JSX props across lines.
- Avoid unnecessary comments; code should be self-explanatory when possible.

## Error Handling Guidelines

- Fail fast on invalid inputs at boundaries.
- Use typed error shapes where errors are part of control flow.
- In server code, return safe user-facing messages; avoid leaking internals.
- Log actionable context for debugging, but never log secrets.
- For expected failures in UI, render clear fallback states.
- For route-level failures, prefer Next.js `error.tsx` and `not-found.tsx` patterns.

## Environment and Config

- Keep secrets in environment variables; never hardcode credentials.
- If new env vars are introduced, document them in `README.md`.
- Keep `next.config.ts` typed with `NextConfig`.
- Avoid changing lint/type/build config unless task requires it.

## Agent Working Rules

- Make minimal, focused edits aligned with the request.
- Do not refactor unrelated code in the same change.
- Preserve backward compatibility unless change request says otherwise.
- Run relevant verification commands after edits.
- If tests do not exist, run lint + typecheck + build before handoff.
- Include file paths changed and concise rationale in handoff notes.

## Preferred Verification Sequence

- 1. `npm run lint`
- 2. `npx tsc --noEmit`
- 3. `npm run build`

## Notes for Future Test Setup

- When adding tests, prefer colocated `*.test.ts(x)` near source or a clear `__tests__/` strategy.
- Add deterministic test data and avoid network calls in unit tests.
- Add CI-friendly scripts with non-interactive defaults.
- Document single-test commands in this file immediately after setup.
