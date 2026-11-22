# Contributing to The House

Thank you for your interest in contributing. This guide explains how to set up the project and submit changes.

By taking part in this project, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- Report a bug with the [bug report form](https://github.com/dcdavidev/thehouse.js/issues/new?template=bug_report.yml).
- Suggest an idea with the [feature request form](https://github.com/dcdavidev/thehouse.js/issues/new?template=feature_request.yml).
- Fix a typo or improve room descriptions and dialogue.
- Open a pull request with a fix, test, or new feature.

To report a security vulnerability, follow [SECURITY.md](SECURITY.md). Do not open a public issue.

## Project structure

- `src/characters/` — `Character`, `Player`, and `Monster` classes.
- `src/rooms/` — Room implementations (`Bedroom`, `Hallway`, `Hall`, `Kitchen`, `Diningroom`, `Livingroom`, `Studio`).
- `src/helpers/` — Terminal UI, prompts, banners, game state, and constants.
- `tests/` — Vitest unit tests.

## Development setup

Requirements:

- Node.js 24 (the version in `.nvmrc`)
- pnpm 12+

Steps:

1. Fork the repository and clone your fork.
2. Install the dependencies. This also installs the Git hooks with Lefthook.

   ```bash
   pnpm install
   ```

3. Run the game locally from TypeScript source.

   ```bash
   pnpm play
   ```

We recommend VS Code with the extensions in `.vscode/extensions.json`. VS Code suggests them when you open the project.

## Making changes

1. Create a branch from `main`, for example `feat/attic-room` or `fix/safe-combination`.
2. Make your changes and add or update tests in `tests/`.
3. Run all the checks before you push:

   ```bash
   pnpm check
   pnpm build
   ```

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org). Commitlint checks each commit message in the `commit-msg` hook.

To write a valid message with an interactive prompt, run:

```bash
pnpm commit
```

Examples:

```text
feat: add attic room to the house
fix: clamp negative health in appbar
docs: update development setup steps
```

The `pre-commit` hook runs ESLint, Prettier, TypeScript typechecking, and lockfile verification on staged files.

## Pull requests

1. Push your branch and open a pull request against `main`.
2. Fill in the pull request template.
3. Keep each pull request focused on one change.
4. Make sure all the checks pass.

The maintainer reviews pull requests as soon as possible.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
