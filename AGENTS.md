# AGENTS.md

This file provides guidelines for AI agents working in this repository.

## Project Overview

AI Models Explorer - A React-based web application for browsing and comparing 500+ AI models from various providers. Built with the full TanStack ecosystem (Start, Router, Query, Table, Virtual) for type-safe, performant server-side rendering with 24-hour caching.

**Key Architecture Decision:** Server-side pagination, filtering, and fuzzy search via a custom API layer (`src/lib/models.ts`) that uses Netlify Durable Cache to persist responses across cold starts, avoiding repeated 5MB API fetches from models.dev.

## Development Commands

```bash
# Development server (always running at http://localhost:3000)
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint and format (use before commits)
npm run check        # prettier --write + eslint --fix
```

**Code Style Requirements:**

- Single quotes only, no semicolons
- TypeScript strict mode enabled
- Array notation: `Array<Type>` NOT `Type[]`
- Path aliases: `@/*` → `src/*`

## Tech Stack

- **Framework:** React 19 + TanStack Start (SSR + server functions)
- **Build Tool:** Vite
- **Routing:** TanStack Router (file-based with URL state)
- **Data Fetching:** TanStack Query v5 with 24h caching
- **Table:** TanStack Table with manual pagination/filtering
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript (strict mode)
- **Search:** Fuse.js for fuzzy search on server

## Worktree Manager

- Use `git-worktree-runner` skill for managing git worktree

## Important Notes

- **API Sample:** Check `docs/sample-api-models-dev.json` for API structure - never fetch live API for exploration
- **Dev Server:** Always running at `http://localhost:3000` - don't start it
