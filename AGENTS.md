# AGENTS.md

Context for agentic coding systems working on this project.

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

### Imports

3 groups with blank lines: external libs, internal (@/\*), relative.

```tsx
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import Header from '@/components/Header'
import { getUser } from '@/api/users'

import styles from './Demo.module.css'
```

### Formatting

Prettier: single quotes, no semicolons, trailing commas.

### TypeScript

`strict: true`, explicit interfaces for props, avoid `any`, infer when obvious.

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
├── components/     # Shared UI
├── data/          # Static data
├── integrations/  # Third-party
└── routes/        # File-based routing
    ├── __root.tsx       # Root layout
    ├── index.tsx        # /
    └── demo/            # /demo routes
```

### TanStack Router

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchPosts } from '../utils/posts'

export const Route = createFileRoute('/posts')({
  loader: async () => fetchPosts(),
  component: PostsComponent,
})

function PostsComponent() {
  const posts = Route.useLoaderData()

  return (
    <div className="p-2 flex gap-2">
      <ul className="list-disc pl-4">
        {[...posts, { id: 'i-do-not-exist', title: 'Non-existent Post' }].map(
          (post) => {
            return (
              <li key={post.id} className="whitespace-nowrap">
                <Link
                  to="/posts/$postId"
                  params={{
                    postId: String(post.id),
                  }}
                  className="block py-1 text-blue-800 hover:text-blue-600"
                  activeProps={{ className: 'text-black font-bold' }}
                >
                  <div>{post.title.substring(0, 20)}</div>
                </Link>
              </li>
            )
          },
        )}
      </ul>
    </div>
  )
}
```

### Server Functions

Tanstack Start server function.

```tsx
import { createServerFn } from '@tanstack/react-start'

export type PostType = {
  id: number
  title: string
  body: string
}

export const fetchPosts = createServerFn().handler(async () => {
  console.info('Fetching posts...')
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }

  const posts = await res.json()

  return (posts as Array<PostType>).slice(0, 10)
})
```

### Data Fetching (TanStack Query)

Descriptive query keys: `[scope, entity, identifiers]`.

```tsx
const { data } = useQuery({
  queryKey: ['users', 'list', { status: 'active' }],
  queryFn: () => fetchUsers({ status: 'active' }),
  staleTime: 5 * 60 * 1000,
})
```

### Error Handling

Use `ErrorBoundary` from `@tanstack/react-router` with type-safe fallbacks.

### Testing

Vitest with Testing Library. Test files: `*.test.tsx` or `*.spec.tsx`.

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click</Button>)
    expect(screen.getByText('Click')).toBeInTheDocument()
  })
})
```

### Comments

JSDoc for complex functions/public APIs, inline for non-obvious logic, avoid redundancy.

---

## Key Files

| File                 | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `tsconfig.json`      | TypeScript with strict mode + `@/*` aliases |
| `vite.config.ts`     | Vite build config                           |
| `eslint.config.js`   | ESLint rules                                |
| `prettier.config.js` | Prettier formatting                         |

## Demo Files

Demo files under `src/routes/demo` use it as guide, skip the linter error.
