# AGENTS.md

Context for agentic coding systems working on this project.

## Main Rules

- Never ever fetch the source API directly `https://models.dev/api.json`, because it's huge amount of data, just check the sample return `docs/sample-api-models-dev.json`
- When you have zero context about this project, just read `docs/spec/models-explorer.md` (beware: large document) and `docs/implementation-phases.md`

---

## Tech Stack

- **Framework**: React 19 with TanStack Start
- **Build Tool**: Vite
- **Routing**: TanStack Router (file-based routing)
- **Data Fetching**: TanStack Query v5
- **Testing**: Vitest with Testing Library
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript (strict mode)
- **Package Manager**: npm

---

## Build/Lint/Test Commands

```bash
# Development server (port 3000)
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Run all tests
npm run test

# Run single test (by file or pattern)
npx vitest run src/routes/demo/api.names.test.tsx
npx vitest run -t "renders correctly"

# Lint and format
npm run lint
npm run format
npm run check  # prettier --write + eslint --fix
```

Please note, every error from `/demo/` should be skipped.

---

## Code Style Guidelines

### TypeScript

- `strict: true`, explicit interfaces for props, avoid `any`, infer when obvious.
- Array notation: Array<Type> not Type[]

```tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({ children, variant = 'primary' }: ButtonProps) {
  return <button className={variant}>{children}</button>
}
```

### Naming

| Category            | Convention | Example       |
| ------------------- | ---------- | ------------- |
| Variables/Functions | camelCase  | `getUserData` |
| Components/Types    | PascalCase | `UserProfile` |
| Constants           | UPPER_CASE | `MAX_RETRIES` |
| CSS Classes         | kebab-case | `user-card`   |

### File Structure

```
src/
├── components/     # Shared UI components
│   ├── FilterPanel/
│   ├── ModelList/
│   ├── SearchBar/
│   ├── Shared/
│   └── Header.tsx
├── data/          # Static data
│   ├── demo-table-data.ts
│   ├── demo.punk-songs.ts
│   └── sample-models.ts
├── hooks/         # Custom React hooks
│   └── index.ts
├── integrations/  # Third-party integrations
│   └── tanstack-query/
├── lib/           # Core library code
│   ├── api/
│   ├── models-api.ts
│   ├── models-transform.ts
│   └── index.ts
├── routes/        # File-based routing
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # /
│   └── demo/            # Demo routes
├── types/         # TypeScript type definitions
│   └── index.ts
├── utils/         # Utility functions
│   └── index.ts
├── logo.svg
├── router.tsx
├── routeTree.gen.ts
└── styles.css
```
