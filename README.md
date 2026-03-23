# aws-s3-deployer

CLI to upload a directory to S3 and optionally invalidate a CloudFront distribution.

## Prerequisites

- Install [Bun](https://bun.sh) — used to build and run the CLI
- Configure AWS credentials (environment variables, shared credentials file, or OIDC provider)

## Install

```bash
bun install
```

## Build

```bash
bun run build
```

## Usage

```bash
aws-s3-deployer \
  --folder ./dist/playground-1 \
  --bucket your-s3-bucket-name \
  --region eu-central-1 \
  --profile OIDC-PROFILE \
  --cloudfront-id E32XBZ9VWEFO0K
```

### Options

| Option                     | Required | Description                                                                                            |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `-f, --folder <path>`      | ✅       | Directory to deploy (e.g., `dist/playground-1`)                                                        |
| `-b, --bucket <name>`      | —        | AWS S3 Bucket name (optional) — falls back to `AWS_S3_DEPLOY_BUCKET`                                   |
| `-r, --region <region>`    | —        | AWS Region (e.g., `eu-central-1`) (optional) — falls back to `AWS_S3_DEPLOY_REGION`                    |
| `-p, --profile <profile>`  | —        | AWS Profile to use (supports OIDC profiles)                                                            |
| `-c, --cloudfront-id <id>` | —        | CloudFront Distribution ID to invalidate (optional) — falls back to `AWS_S3_DEPLOY_CF_DISTRIBUTION_ID` |

## Local Development

```bash
# Type check
bun run typecheck

# Lint
bun run lint

# Lint and auto-fix
bun run lint:fix

# Format
bun run format

# Run tests (watch mode)
bun run test

# Run tests once
bun run test:run

# Lint + format + tests in one command
bun run check

# Link for local testing
bun link
aws-s3-deployer --help
```

## Notes

- The `build` script produces an ESM bundle in `dist/` via Bun (the `bin` field points to `dist/cli.js`).
- The `prepare` script runs `bun run build` automatically on install when publishing.
- AWS credentials are resolved via `@aws-sdk` provider chain — OIDC profiles (e.g., for CI) work if configured in `~/.aws/config`.
- Linting is handled by [oxlint](https://oxc.rs/docs/guide/usage/linter), formatting by [oxfmt](https://oxc.rs/docs/guide/usage/formatter).
- Tests are written with [Vitest](https://vitest.dev) and live in `src/*.test.ts`.
- A [Husky](https://typicode.github.io/husky/) `pre-commit` hook runs `bun run check` (lint + format + tests) before every commit.

## License

MIT
