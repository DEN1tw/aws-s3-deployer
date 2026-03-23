# Contributing to aws-s3-deployer

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository and clone it locally.
2. Install [Bun](https://bun.sh) if you haven't already.
3. Install dependencies:

```bash
bun install
```

## Development Workflow

```bash
# Build the CLI
bun run build

# Type check
bun run typecheck

# Lint
bun run lint

# Lint with auto-fix
bun run lint:fix

# Format code
bun run format

# Run tests (watch mode)
bun run test

# Run tests once
bun run test:run

# Lint + format + tests in one command
bun run check

# Test the CLI manually
bun link
aws-s3-deployer --help
```

## Code Style

- All source files are in `src/`.
- TypeScript strict mode and additional strictness flags are enabled — no `any`, no unused vars/params.
- Linting: [oxlint](https://oxc.rs/docs/guide/usage/linter) — run `bun run lint:fix` before committing.
- Formatting: [oxfmt](https://oxc.rs/docs/guide/usage/formatter) — run `bun run format` before committing.

## Submitting Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes and ensure the following pass with no errors:
   ```bash
   bun run typecheck && bun run check
   ```
   The `pre-commit` Husky hook runs `bun run check` automatically on every commit.
3. Commit using a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — new feature
   - `fix:` — bug fix
   - `chore:` — tooling/dependency updates
   - `docs:` — documentation only
   - `refactor:` — code change without feature/fix
4. Open a Pull Request against `main` with a clear description of the change.

## Reporting Issues

Please include:

- Bun and Node.js versions (`bun --version`, `node --version`)
- AWS SDK version (from `package.json`)
- The exact command you ran and the full error output
