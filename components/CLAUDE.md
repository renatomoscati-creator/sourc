# components/ — UI Components

All components use shadcn/ui + Tailwind v4 + Lucide icons.

## Patterns
- Dialog components follow the pattern: `add-*-dialog.tsx`, `edit-*-dialog.tsx`
- Use shadcn primitives (Dialog, Button, Input, etc.) — don't rebuild from scratch.
- `'use client'` only on interactive components (dialogs, forms, filters).
- Props: use interfaces, not inline types. Name them `{Component}Props`.
- Keep components focused — one responsibility per file.
- Use `cn()` from `@/lib/utils` for conditional styles.
