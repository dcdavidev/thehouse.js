/**
The terminal front end: boxes and colors on stdout, menus with
`@inquirer/prompts`. Node.js only.
*/

import chalk from 'chalk';
import { input, select } from '@inquirer/prompts';

import { BANNERS } from '../helpers/banner.js';
import { type GameIO, QuitGame } from '../io.js';
import { getAppbar, makeLayout, renderMessage, renderPanel } from './ui.js';

export {
  getAppbar,
  getTerminalWidth,
  makeLayout,
  type PanelOptions,
  renderMessage,
  renderPanel,
} from './ui.js';

/**
Print the BYE banner and leave: Ctrl+C during a pause.
*/
function exitWithGoodbye(): never {
  console.log(chalk.bold.yellow(`\n${BANNERS.bye}`));
  process.exit(0);
}

/**
Pause for the given number of seconds; Ctrl+C says goodbye and exits.
*/
function sleep(seconds: number): Promise<void> {
  if (seconds <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const onSigint = (): void => {
      clearTimeout(timer);
      exitWithGoodbye();
    };

    const timer = setTimeout(() => {
      process.off('SIGINT', onSigint);
      resolve();
    }, seconds * 1000);

    process.once('SIGINT', onSigint);
  });
}

/**
Move the cursor up and clear previously rendered lines on interactive TTYs.
*/
function clearPreviousLines(lineCount: number): void {
  if (lineCount > 0 && process.stdout.isTTY) {
    process.stdout.write(`\u{1B}[${lineCount}A\u{1B}[0J`);
  }
}

/**
Explain that the game needs a real terminal, then exit.
*/
function printInteractiveTerminalError(): never {
  console.log(
    renderPanel(
      [
        chalk.bold.red('Error: Interactive terminal required.'),
        '',
        'This game requires an interactive terminal to run.',
        `If you are using Docker, please run it with the ${chalk.bold('-it')} flags:`,
        '',
        `  ${chalk.bold.cyan('docker run -it dcdavidev/thehouse')}`,
      ].join('\n'),
      {
        title: 'System Error',
        borderColor: chalk.red,
        paddingX: 2,
        paddingY: 1,
      }
    )
  );
  process.exit(1);
}

/**
Whether the player aborted a prompt (Ctrl+C).
*/
function isPromptExitError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'ExitPromptError' || error.name === 'AbortPromptError')
  );
}

/**
Run a prompt: Ctrl+C quits the game, a missing TTY is an error.
*/
async function prompt<T>(run: () => Promise<T>): Promise<T> {
  if (!process.stdin.isTTY) {
    printInteractiveTerminalError();
  }
  try {
    return await run();
  } catch (error) {
    if (isPromptExitError(error)) {
      throw new QuitGame();
    }
    throw error;
  }
}

export const terminalIO: GameIO = {
  async print(messages, { seconds, banner, status }) {
    if (banner) {
      for (const message of messages) {
        console.log(makeLayout(renderMessage(message), status));
        await sleep(seconds);
      }
      return;
    }

    let accumulated = '';
    let renderedLineCount = 0;

    for (const [i, message] of messages.entries()) {
      if (i > 0) {
        accumulated += '\n\n';
      }
      accumulated += renderMessage(message);

      const frame = makeLayout(
        renderPanel(accumulated, {
          borderColor: chalk.blueBright,
          paddingX: 2,
          paddingY: 1,
        }),
        status
      );

      if (i > 0) {
        clearPreviousLines(renderedLineCount);
      }

      process.stdout.write(`${frame}\n`);
      renderedLineCount = frame.split('\n').length;

      await sleep(seconds);
    }
  },

  async choose(message, choices, { status }) {
    return prompt(async () => {
      console.log(getAppbar(status));
      return select({
        message,
        choices: choices.map((choice) => ({ name: choice, value: choice })),
        theme: {
          prefix: {
            idle: chalk.hex('#673ab7').bold('?'),
            done: chalk.hex('#673ab7').bold('✔'),
          },
          style: {
            message: (text: string) => chalk.bold(text),
            answer: (text: string) => chalk.hex('#f44336').bold(text),
            highlight: (text: string) => chalk.hex('#673ab7').bold(text),
            disabled: (text: string) => chalk.hex('#858585').italic(text),
          },
        },
      });
    });
  },

  async ask(message) {
    return prompt(() => input({ message }));
  },

  bell() {
    process.stdout.write('\u{7}');
  },
};
