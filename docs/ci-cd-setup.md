# CI/CD Setup Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-01
**Project:** AI Models Explorer (TanStack Start)

---

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions CI Setup](#github-actions-ci-setup)
3. [Netlify Deploy Configuration](#netlify-deploy-configuration)
4. [Pre-commit Hooks with Husky](#pre-commit-hooks-with-husky)
5. [Deployment Workflow](#deployment-workflow)
6. [Environment Variables](#environment-variables)
7. [Quality Gates](#quality-gates)
8. [Troubleshooting](#troubleshooting)

---

## 1. Overview

### What is CI/CD

**CI (Continuous Integration)** is a development practice where developers integrate code into a shared repository frequently, preferably several times a day. Each integration is verified by an automated build and tests to detect errors quickly.

**CD (Continuous Deployment/Delivery)** extends CI by automatically deploying all code changes to a production or staging environment after the build and tests pass.

### Why CI/CD is Needed

| Benefit                   | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| **Early Bug Detection**   | Automated tests catch bugs before they reach production |
| **Consistent Quality**    | Linting and type checking ensure code standards         |
| **Faster Feedback**       | Developers get immediate feedback on changes            |
| **Reduced Manual Effort** | Automated deployments eliminate manual steps            |
| **Reliable Releases**     | Consistent build process reduces deployment failures    |
| **Collaboration**         | Status checks enable better code review processes       |

### Current Setup

This project uses **Netlify** for deployment with **GitHub Actions** for CI/CD:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Development                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  Commit  │───▶│  Push to │───▶│ GitHub   │───▶│  CI/CD   │ │
│  │  Code    │    │  GitHub  │    │  Actions │    │  Pipeline│ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│                                                    │           │
│                                                    ▼           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  Netlify │◀───│ Deploy   │◀───│  Status  │◀───│  Build   │ │
│  │  CDN     │    │ Preview  │    │  Checks  │    │  & Test  │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. GitHub Actions CI Setup

### Workflow File

The CI workflow is defined in `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

### Jobs Overview

| Job            | Purpose                            | Dependencies           |
| -------------- | ---------------------------------- | ---------------------- |
| `lint`         | Run ESLint and Prettier checks     | None                   |
| `type-check`   | TypeScript strict mode checking    | None                   |
| `test`         | Run Vitest test suite              | None                   |
| `build`        | Build production application       | lint, type-check, test |
| `matrix-build` | Build on multiple Node.js versions | None                   |
| `notify`       | Notify on failure/success          | All jobs               |

### Trigger Conditions

The workflow triggers on:

- **Push** to `main` or `master` branches
- **Pull requests** targeting `main` or `master` branches

### Caching Strategy

Dependencies are cached using GitHub Actions cache:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

This caches `node_modules` between runs, significantly speeding up CI.

### Matrix Strategy for Node.js Versions

The build job runs on multiple Node.js versions to ensure compatibility:

```yaml
jobs:
  matrix-build:
    strategy:
      matrix:
        node-version: ['18', '20', '22']
```

### Required Scripts

The workflow uses these npm scripts:

| Script           | Command      | Purpose          |
| ---------------- | ------------ | ---------------- |
| `npm run lint`   | `eslint`     | Run ESLint       |
| `npm run format` | `prettier`   | Check formatting |
| `npm run test`   | `vitest run` | Run tests        |
| `npm run build`  | `vite build` | Build production |

---

## 3. Netlify Deploy Configuration

### Current Configuration

The `netlify.toml` file is already configured:

```toml
[build]
  command = "vite build"
  dir = "dist/client"

[dev]
  command = "npm run dev"
  targetPort = 3000
  port = 8888
```

### Build Settings

| Setting           | Value         | Description             |
| ----------------- | ------------- | ----------------------- |
| Build Command     | `vite build`  | Vite production build   |
| Publish Directory | `dist/client` | Static output directory |
| Node Version      | 20            | Match CI configuration  |

### Environment Variables in Netlify

Set these in **Netlify Dashboard > Site Settings > Environment Variables**:

| Variable         | Value  | Purpose                 |
| ---------------- | ------ | ----------------------- |
| `NODE_VERSION`   | `20`   | Node.js version         |
| `SKIP_DEMO_LINT` | `true` | Skip demo route linting |

### Redirects (if needed)

For SPA routing with TanStack Router, add to `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 4. Pre-commit Hooks with Husky

### Installation

```bash
# Install Husky and lint-staged
npm install -D husky lint-staged

# Initialize Husky
npx husky install

# Add Husky prepare script to package.json
npm pkg set scripts.prepare="husky install"
```

### Configuration

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["npm run lint", "npm run format"],
    "*.{json,md,yml,yaml}": ["npm run format"]
  }
}
```

### Create Pre-commit Hook

```bash
# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### Git Hook Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pre-commit Hook Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Developer runs `git commit`                                 │
│                                                                 │
│  2. Husky triggers pre-commit hook                              │
│                                                                 │
│  3. lint-staged runs on staged files                            │
│     ├── ESLint (fixes auto-fixable errors)                      │
│     └── Prettier (formats code)                                 │
│                                                                 │
│  4. If checks pass:                                             │
│     ├── Files are staged                                        │
│     ├── Commit is created                                       │
│     └── Hook exits successfully                                 │
│                                                                 │
│  5. If checks fail:                                             │
│     ├── Errors are displayed                                    │
│     ├── Commit is aborted                                       │
│     └── Developer must fix issues                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Benefits

- **Local Feedback**: Issues caught before pushing
- **Clean History**: No style violations in commits
- **Fast Iteration**: Quick fixes during development

---

## 5. Deployment Workflow

### Branch Strategy

```
main branch (production)
│
├── Feature branches (develop features)
│   └── Pull requests with CI checks
│
├── Develop branch (optional, staging)
│   └── Can deploy to staging environment
│
└── Hotfix branches (critical fixes)
    └── Fast-track to production
```

### Deployment Flow

#### Push to Main

```
1. Developer pushes code to main
2. GitHub Actions CI runs
   ├── Lint ✓
   ├── Type Check ✓
   ├── Test ✓
   └── Build ✓
3. Netlify detects change
4. Netlify deploys to production
5. Status check passes on GitHub
```

#### Pull Request

```
1. Developer opens PR
2. GitHub Actions CI runs
   ├── Lint ✓
   ├── Type Check ✓
   ├── Test ✓
   └── Build ✓
3. Netlify creates preview deployment
4. Preview URL added to PR
5. Reviewers can test changes
6. CI status required for merge
```

### Branch Protections

In **GitHub > Repository > Settings > Branches**:

1. **Add branch protection rule** for `main`
2. **Require pull request reviews**: 1 approval
3. **Require status checks to pass**:
   - `lint`
   - `type-check`
   - `test`
   - `build`
4. **Require conversation resolution**
5. **Restrict who can push** to main (optional)

---

## 6. Environment Variables

### Variable Categories

#### Client-side (VITE\_\*)

These are exposed to the browser and prefixed with `VITE_`:

| Variable               | Example                   | Purpose               |
| ---------------------- | ------------------------- | --------------------- |
| `VITE_APP_NAME`        | "AI Models Explorer"      | App display name      |
| `VITE_API_BASE_URL`    | "https://api.example.com" | API endpoint          |
| `VITE_ENABLE_DEVTOOLS` | "true"                    | Enable React DevTools |

#### Server-side

Used in server functions only, not exposed to client:

| Variable         | Example            | Purpose             |
| ---------------- | ------------------ | ------------------- |
| `API_SECRET_KEY` | "sk-..."           | API authentication  |
| `DATABASE_URL`   | "postgresql://..." | Database connection |

#### Build-time

Set during build process:

| Variable         | Example      | Purpose               |
| ---------------- | ------------ | --------------------- |
| `SKIP_DEMO_LINT` | "true"       | Skip demo lint errors |
| `NODE_ENV`       | "production" | Build mode            |

### Creating Environment Files

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### Netlify Environment Variables

Set in **Netlify Dashboard > Site Settings > Environment Variables**:

```
NODE_VERSION=20
SKIP_DEMO_LINT=true
VITE_APP_NAME=AI Models Explorer
```

### GitHub Actions Secrets

Set in **GitHub > Repository > Settings > Secrets and variables > Actions**:

| Secret               | Purpose                 |
| -------------------- | ----------------------- |
| `NETLIFY_AUTH_TOKEN` | Netlify API access      |
| `NETLIFY_SITE_ID`    | Netlify site identifier |

---

## 7. Quality Gates

### Branch Protection Rules

Configure in GitHub repository settings:

#### Required Status Checks

```
Required Checks:
├── lint
├── type-check
├── test
└── build
```

#### Merge Requirements

```
Before merging, require:
├── At least 1 approved review
├── All status checks passed
├── No unresolved conversations
├── Up to date with main branch
└── Linear history (optional)
```

### Definition of Done for PRs

- [ ] Code changes complete
- [ ] All tests pass
- [ ] No linting errors
- [ ] TypeScript compilation succeeds
- [ ] Build completes successfully
- [ ] At least 1 code review approval
- [ ] Documentation updated (if needed)
- [ ] Preview deployment tested

### Semantic Versioning

This project uses [Semantic Versioning](https://semver.org):

```
MAJOR.MINOR.PATCH
│      │     │
│      │     └── Bug fixes
│      └─────── New features (backward compatible)
└────────────── Breaking changes
```

#### Version Tags

```bash
# Patch release
git tag v1.0.1
git tag -a v1.0.1 -m "Bug fixes"

# Minor release
git tag v1.1.0
git tag -a v1.1.0 -m "New features"

# Major release
git tag v2.0.0
git tag -a v2.0.0 -m "Breaking changes"
```

---

## 8. Troubleshooting

### Common CI/CD Issues

#### Issue: Build Fails with TypeScript Errors

```
Error: TypeScript: No inputs found
```

**Solution**:

1. Check `tsconfig.json` includes correct paths
2. Verify files exist in the included paths
3. Run `npx tsc --noEmit` locally to see errors

#### Issue: ESLint Fails on Demo Routes

```
Error: ESLint: Demo routes should be skipped
```

**Solution**:

1. This is expected behavior per project conventions
2. Demo routes in `/src/routes/demo/` are excluded from linting
3. Set `SKIP_DEMO_LINT=true` environment variable

#### Issue: Netlify Build Fails

```
Error: Could not find module "@netlify/vite-plugin-tanstack-start"
```

**Solution**:

1. Ensure dependencies are installed: `npm ci`
2. Check `package.json` includes the plugin
3. Verify `netlify.toml` configuration is correct

#### Issue: Tests Fail in CI but Pass Locally

```
Error: Test failed - works on local machine
```

**Solutions**:

1. Clear node_modules and reinstall: `rm -rf node_modules && npm ci`
2. Check Node.js version matches CI (Node 20)
3. Look for environment-specific test configurations
4. Check for timing-related issues in tests

#### Issue: Netlify Preview Not Updating

```
Error: Preview deployment shows old code
```

**Solutions**:

1. Check PR status for build completion
2. Wait for Netlify to finish building
3. Clear Netlify cache (Site Settings > Build & deploy > Clear cache)
4. Push a new commit to trigger rebuild

### Debugging Failed Builds

#### GitHub Actions Logs

1. Go to **GitHub > Actions** tab
2. Select the failed workflow run
3. Click on the failed job
4. Expand the failed step to see logs
5. Search for error patterns:

```bash
# Common error patterns
grep -i "error" workflow.log
grep -i "failed" workflow.log
grep -i "cannot" workflow.log
```

#### Netlify Build Logs

1. Go to **Netlify Dashboard > Deploys**
2. Select the failed deploy
3. View **Deploy log** for detailed output
4. Look for:

```
[build] Error: ...
[build] Failed to ...
[build] Warning: ...
```

### Useful Commands

```bash
# Check TypeScript locally
npx tsc --noEmit

# Run linting
npm run lint

# Run tests with coverage
npm run test -- --coverage

# Check formatting
npm run format -- --check

# Full check (format + lint + type-check)
npm run check

# Build locally
npm run build

# Preview build
npm run preview
```

### Getting Help

- **GitHub Actions**: Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- **Netlify**: Check [Netlify documentation](https://docs.netlify.com)
- **Vitest**: Check [Vitest documentation](https://vitest.dev)
- **ESLint**: Check [ESLint documentation](https://eslint.org)
- **Prettier**: Check [Prettier documentation](https://prettier.io)

---

## Quick Start Checklist

- [ ] GitHub Actions workflow created (`.github/workflows/ci.yml`)
- [ ] Environment variables template created (`.env.example`)
- [ ] This guide reviewed (`docs/ci-cd-setup.md`)
- [ ] Husky installed and configured (optional)
- [ ] Branch protection rules enabled
- [ ] Netlify connected to GitHub repository
- [ ] Environment variables set in Netlify dashboard
- [ ] First deployment verified

---

## File Reference

| File                       | Purpose                        |
| -------------------------- | ------------------------------ |
| `.github/workflows/ci.yml` | GitHub Actions CI/CD pipeline  |
| `.env.example`             | Environment variables template |
| `netlify.toml`             | Netlify build configuration    |
| `package.json`             | npm scripts and dependencies   |
| `tsconfig.json`            | TypeScript configuration       |
| `eslint.config.js`         | ESLint configuration           |

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify Documentation](https://docs.netlify.com)
- [Vitest Documentation](https://vitest.dev)
- [ESLint Documentation](https://eslint.org)
- [Prettier Documentation](https://prettier.io)
- [TanStack Start Documentation](https://tanstack.com/start)
