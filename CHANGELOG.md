# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `vitest` for unit testing; tests live in `src/index.test.ts`
- Husky `pre-commit` hook (`.husky/pre-commit`) runs `bun run check` + `bun run test:run` before every commit
- `test`, `test:run`, and `check` scripts in `package.json`

### Changed

- Replaced ESLint/Prettier with `oxlint` and `oxfmt` for faster linting and formatting
- Updated `tsconfig.json`: switched to `module: ESNext` + `moduleResolution: bundler` to align with Bun build output; added `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`
- `prepare` script now also initialises Husky (`bun run build && husky`)
- Added `typecheck` script (`tsc --noEmit`)
- Improved README with options table and development section
- Added `CONTRIBUTING.md` and `CHANGELOG.md`

## [1.0.0] - 2026-03-20

### Added

- Initial release
- Upload a local directory to an AWS S3 bucket recursively
- Automatic MIME type detection per file
- Optional CloudFront distribution invalidation (`/*`) after upload
- OIDC-compatible credential provider via `@aws-sdk/credential-providers`
- CLI built with [Commander](https://github.com/tj/commander.js) and bundled via Bun
