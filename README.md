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

## Use it in your own front end

The game itself has no Node.js or DOM dependencies: it talks to a `GameIO`
that prints messages and asks questions. The terminal one ships as
`@dcdavidev/thehouse/terminal`; write your own to run the game on a web page
or anywhere else.

```ts
import { type GameIO, main, QuitGame } from '@dcdavidev/thehouse';

const io: GameIO = {
  // show each message, waiting `seconds` after each one
  async print(messages, { seconds, banner, status }) {},
  // resolve with one of `choices`, exactly as given
  async choose(prompt, choices, { status }) {
    return choices[0];
  },
  // free text (the safe's combination)
  async ask(prompt, { status }) {
    return 'back';
  },
  // optional: the player got hurt
  bell() {},
};

await main(io); // resolves when the player quits or stops playing
```

A message is a string or a list of `{ text, tone }` spans; `status` holds
health, items and the current room for a status bar. Reject any call with
`QuitGame` to end the game from the outside.

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
