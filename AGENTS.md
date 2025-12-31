# AGENTS.md

Context for agentic coding systems working on this project.

## Main Rules

- Never ever fetch the source API directly `https://models.dev/api.json`, because it's huge amount of data, just check the sample return `docs/sample-api-models-dev.json`
- When you have zero context about this project, just read `docs/spec/models-explorer.MD` (beware: large document) and `docs/implementation-phases.md`
- Never try to start dev server, dev server always running at `http://localhost:3000`

## Subagents and Skills

### Built-in Tools

Leverate built-in tools if you have the necessary permissions.

- **bash**: Execute shell commands in your project environment.
- **edit**: Modify existing files using exact string replacements.
- **write**: Create new files or overwrite existing ones.
- **read**: Read file contents from your codebase.
- **grep**: Search file contents using regular expressions.
- **glob**: Find files by pattern matching.
- **list**: List files and directories in a given path.
- **patch**: Apply patches to files.
- **skill**: Load a skill (a SKILL.md file) and return its content in the conversation.
- **task**: Launch a new agent to handle complex, multi-step tasks autonomously.
- **todowrite**: Manage todo lists during coding sessions.
- **todoread**: Read existing todo lists.
- **webfetch**: Fetch web content.
- **websearch**: Search necessary information on the web.
- **codesearch**: Search real-world codebases for relevant examples.
- **batch**: Executes multiple independent tool calls concurrently to reduce latency.
- **gh_grep**: Search real-world code examples from GitHub
- **context7**: Fetch up-to-date documentation for libraries
- **playwright**: UI testing (when applicable)

### Specialists / Subagents

- **github-flow**: creating branches for new features or bug fixes, making commits with clear and concise messages, opening pull requests for code review, and merging changes after approval.
- **builder**: To implement the code
- **researcher**: For gathering documentation, examples, or best practices
- **qa-specialist**: To perform quality assurance (QA) tasks, such as testing software, identifying defects, or verifying functionality.
- **code-reviewer**: To review code and provide feedback.
- **technical-writer**: For adding, updating, or fixing documentation

## Quality Gates

Each feature must pass through these checkpoints before merging:

### Gate 1: Requirements Ready ☐
- [ ] Clear user requirements documented
- [ ] Definition of Done specified
- [ ] Tech constraints identified
- [ ] Branch created via `@github-flow`

### Gate 2: Design Complete ☐
- [ ] Implementation plan created
- [ ] Relevant files explored
- [ ] Research documented (if needed)
- [ ] Dependencies identified

### Gate 3: Implementation Ready ☐
- [ ] Context files provided to `@builder`
- [ ] Technical specifications clear
- [ ] Testing approach defined

### Gate 4: Code Complete ☐
- [ ] Code written
- [ ] Passes linting (`npm run check`)
- [ ] Follows project patterns
- [ ] Self-reviewed

### Gate 5: Review Complete ☐
- [ ] `@code-reviewer` approved
- [ ] Issues addressed
- [ ] Changes committed

### Gate 6: Testing Complete ☐
- [ ] `@qa-specialist` verified
- [ ] Tests pass (`npm run test`)
- [ ] No critical bugs

### Gate 7: Ready for Merge ☐
- [ ] PR created with clear description
- [ ] Documentation updated (if needed)
- [ ] Approved for merge

## Testing Strategy

### QA Involvement Points

1. **Before Implementation**: Test plan creation
2. **During Implementation**: Component-level testing
3. **After Implementation**: Integration testing
4. **Before PR**: Full regression testing

### Test Coverage Requirements

| Scenario | Coverage |
|----------|----------|
| Critical paths (authentication, data loading) | 100% |
| New features | 80%+ |
| Bug fixes | Specific scenario tests |
| Refactoring | Existing tests still pass |

## Documentation Requirements

### When Documentation is Required

Document must concise and clear.

| Change | Documentation Needed |
|--------|---------------------|
| New feature | Feature doc + API changes |
| Bug fix | Issue resolution doc |
| Breaking change | Migration guide |
| New component | Component usage doc |
| Complex logic | In-code comments + architecture doc |

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

---

## Demo Files

Demo files under `src/routes/demo` use it as guide, skip the linter error.
