# Agent Instructions

Agents working in this repo must read CLAUDE.md first. It contains verification commands, coding conventions, and the mistakes log.

## Subagent Checklist
1. Read CLAUDE.md before making any changes
2. Run `npm run build` before claiming work is done
3. If you change DB schema, run `npm run db:generate && npm run db:migrate`
4. If you change UI, verify it renders (no broken imports, no missing props)
