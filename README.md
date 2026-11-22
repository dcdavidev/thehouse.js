# the house

Trapped inside a haunted house with no memory of how you got there. A terminal-based interactive horror adventure—every choice counts if you want to make it out alive.

TypeScript port of [thehouse.py](https://github.com/dcdavidev/thehouse.py).

## Play

Run directly with `npx` (no installation required):

```bash
npx @dcdavidev/thehouse
```

Or with `pnpm`:

```bash
pnpm dlx @dcdavidev/thehouse
```

Or install globally and run the `thehouse` command:

```bash
npm install -g @dcdavidev/thehouse
thehouse
```

## Development

Install dependencies:

```bash
pnpm install
```

Run directly from TypeScript source:

```bash
pnpm play
```

Build and run the compiled CLI:

```bash
pnpm build
pnpm start
```

Run checks:

```bash
pnpm typecheck
pnpm test
pnpm build
```

## License

[MIT](./LICENSE)
