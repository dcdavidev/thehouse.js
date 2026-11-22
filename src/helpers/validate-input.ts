/**
 * Interactive menu selection prompt with Quit option and terminal validation.
 */

import chalk from 'chalk';
import { select } from '@inquirer/prompts';

import { renderBanner } from './banner.js';
import { getAppbar, renderPanel } from './ui.js';

/**
Display an error panel when running without an interactive terminal and exit.
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
Print the BYE banner and exit cleanly.
*/
function exitWithGoodbye(hasLeadingNewline = false): never {
  const banner = renderBanner('BYE');
  console.log(chalk.bold.yellow(hasLeadingNewline ? `\n${banner}` : banner));
  process.exit(0);
}

/**
Capitalize the first character of a string.
*/
function capitalizeFirst(value: string): string {
  return value.length === 0
    ? value
    : value.charAt(0).toUpperCase() + value.slice(1);
}

/**
Check whether an error indicates that the user aborted an interactive prompt.
*/
function isPromptExitError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'ExitPromptError' || error.name === 'AbortPromptError')
  );
}

/**
Render an interactive selection menu with an automatic Quit option.
*/
export async function validateInput(
  prompt: string,
  options: readonly string[]
): Promise<string> {
  if (!process.stdin.isTTY) {
    printInteractiveTerminalError();
  }

  try {
    console.log(getAppbar());

    const choices = options.map((opt) => {
      const label = capitalizeFirst(opt);
      return { name: label, value: label };
    });

    const hasQuit = options.some((opt) => opt.toLowerCase() === 'quit');
    if (!hasQuit) {
      choices.push({ name: 'Quit', value: 'Quit' });
    }

    const answer = await select({
      message: prompt.trim(),
      choices,
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

    if (answer === 'Quit') {
      exitWithGoodbye(false);
    }

    return answer.toLowerCase();
  } catch (error) {
    if (isPromptExitError(error)) {
      exitWithGoodbye(true);
    }
    printInteractiveTerminalError();
  }
}
