import { afterEach, describe, expect, it } from 'vitest';

import { BANNERS } from '../src/helpers/banner.js';
import { printPause } from '../src/helpers/print-pause.js';
import {
  type GameIO,
  type Message,
  type PrintOptions,
  QuitGame,
  setIO,
} from '../src/io.js';
import { main } from '../src/play.js';

/**
A front end that records what is printed and answers with `pick`.
*/
function fakeIO(
  pick: (prompt: string, choices: readonly string[]) => string
): GameIO & { printed: Message[]; calls: PrintOptions[] } {
  const printed: Message[] = [];
  const calls: PrintOptions[] = [];
  return {
    printed,
    calls,
    print: async (messages, options) => {
      printed.push(...messages);
      calls.push(options);
    },
    choose: async (prompt, choices) => pick(prompt, choices),
    // the living room safe: always give up
    ask: async () => 'back',
  };
}

const text = (m: Message) =>
  typeof m === 'string' ? m : m.map((s) => s.text).join('');

afterEach(() => {
  setIO(null);
});

describe('GameIO', () => {
  it('printPause sends one message, a list of messages, or spans', async () => {
    const io = fakeIO(() => 'Quit');
    setIO(io);

    await printPause('one');
    await printPause(['two', 'three'], 2);
    await printPause([{ text: 'four', tone: 'danger' }]);

    expect(io.printed.map((m) => text(m))).toEqual([
      'one',
      'two',
      'three',
      'four',
    ]);
    expect(io.calls[1]).toMatchObject({ seconds: 2, banner: false });
  });

  it('marks banners and passes the status bar', async () => {
    const io = fakeIO(() => 'Quit');
    await main(io);

    const first = io.calls[0];
    expect(first.banner).toBe(true);
    expect(first.status).toMatchObject({ room: 'bedroom', items: [] });
    expect(text(io.printed[0])).toBe(BANNERS.thehouse);
  });

  it('Quit ends main and says goodbye', async () => {
    const io = fakeIO((_prompt, choices) => {
      expect(choices.at(-1)).toBe('Quit');
      return 'Quit';
    });

    await expect(main(io)).resolves.toBeUndefined();
    expect(text(io.printed.at(-1)!)).toBe(BANNERS.bye);
  });

  it('rejecting with QuitGame from the front end ends main too', async () => {
    const io = fakeIO(() => {
      throw new QuitGame();
    });
    await expect(main(io)).resolves.toBeUndefined();
  });

  it('survives many random playthroughs', async () => {
    for (let game = 0; game < 30; game++) {
      let steps = 0;
      const io = fakeIO((prompt, choices) => {
        steps += 1;
        if (steps > 3000) return 'Quit';
        if (prompt.startsWith('Type yes or no') && choices.length === 3) {
          // "play again?" after the end: stop there
          const isEnd = io.printed.some((m) =>
            ['=== GAME OVER ===', BANNERS.victory].includes(text(m))
          );
          if (isEnd) return 'No';
        }
        const options = choices.filter((c) => c !== 'Quit');
        return options[Math.floor(Math.random() * options.length)];
      });
      await expect(main(io)).resolves.toBeUndefined();
    }
  });
});
