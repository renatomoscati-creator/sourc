# lib/ — Backend Logic

- `lib/actions/` — Server Actions (data mutations). Always use `'use server'` directive.
- `lib/db/` — Drizzle schema and connection. Never import the db connection from components.
- `lib/db/queries/` — Read-only query functions. Keep them composable and typed.
- `lib/utils.ts` — Shared utilities (cn, formatters, etc.)

## Patterns
- Server Actions return `{ success: boolean, error?: string }` or the data directly.
- Queries return typed results — never `any`.
- Use Drizzle's `eq()`, `and()`, `or()` — no raw SQL.
- Revalidate paths after mutations with `revalidatePath()`.
