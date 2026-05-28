# app/ — Next.js App Router

## Structure
- `app/page.tsx` — Dashboard home
- `app/startups/` — Startup list and detail views
- `app/sources/` — Data source management
- `app/api/` — API routes (use sparingly — prefer Server Actions)
- `app/import-registro/` — Registro Startup import flow

## Patterns
- Pages are Server Components by default — fetch data directly.
- Use `loading.tsx` for streaming/suspense boundaries.
- Use `error.tsx` for error boundaries.
- Dynamic routes: `[id]/page.tsx` with `await params`.
- Layouts in `layout.tsx` — don't duplicate nav/shell logic.
