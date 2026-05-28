# Agentic AI Sourcing Dashboard

An AI-powered startup sourcing and pipeline management tool built with Next.js, SQLite, and Anthropic Claude.

## Stack

- **Framework**: Next.js 16 + React 19
- **Database**: SQLite via better-sqlite3 + Drizzle ORM
- **AI**: Anthropic Claude via AI SDK v6
- **UI**: Tailwind v4 + shadcn/ui

## Getting Started

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features

- **Pipeline**: Kanban-style deal flow management
- **Startups**: Full startup CRM with scoring, outreach tracking, and AI briefs
- **Sources**: Import startups from B4I, Registro Startup Innovative, and custom scraping data

## Database

```bash
npm run db:generate   # Generate migrations after schema changes
npm run db:migrate    # Apply migrations
```
