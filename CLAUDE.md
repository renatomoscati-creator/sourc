# Project: Startup Sourcing Tool

Next.js 16 + React 19 + Drizzle ORM + better-sqlite3 + AI SDK v6 + Tailwind v4 + shadcn/ui.

## Verify Your Work

Every change must pass these checks before you claim it's done:

```bash
npm run build          # Must succeed — catches type errors and broken imports
npm run lint           # ESLint — fix all warnings
npx tsc --noEmit       # Type check without emitting
```

If the project has tests, run them. If you're unsure whether tests exist for the area you changed, check with `find . -name "*.test.*" -o -name "*.spec.*"`.

## Next.js 16 — Read Before Writing

This version has breaking changes. APIs, conventions, and file structure differ from training data. Read `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key differences:
- All request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`
- `middleware.ts` is renamed to `proxy.ts` (Node.js runtime only)
- Turbopack config is top-level in `next.config.ts`
- Use `'use cache'` instead of PPR

## Database

SQLite via better-sqlite3 + Drizzle ORM. Schema lives in `lib/db/`. Queries in `lib/db/queries/`. Server actions in `lib/actions/`.

```bash
npm run db:generate    # Generate migrations after schema changes
npm run db:migrate     # Apply migrations
```

Never write raw SQL — always use Drizzle's query builder.

## Coding Conventions

- Server Components by default. Only add `'use client'` when you need interactivity.
- Push `'use client'` as far down the component tree as possible.
- Server Actions (`'use server'`) for mutations, not Route Handlers.
- Use `cn()` utility for conditional classNames (clsx + tailwind-merge).
- No `any` types. No `@ts-ignore`. Fix the type instead.
- Imports: use `@/` path alias. Group: external → internal → relative.

## AI SDK v6

Using `@ai-sdk/anthropic` directly (not AI Gateway — local project).
- `generateText` / `streamText` with `Output.object()` for structured output (not `generateObject`)
- `inputSchema` not `parameters` for tools
- `stopWhen: stepCountIs(N)` not `maxSteps`

## Self-Improvement

When you make a mistake or I correct you, update this CLAUDE.md with a short rule to prevent it next time. Keep rules concise — one line each. This file should stay under 100 lines.

## Mistakes Log
<!-- Add one-line rules here as mistakes are caught -->
