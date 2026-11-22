/**
 * Interactive text input prompt with graceful exit and terminal validation.
 */

import chalk from 'chalk';
import { input } from '@inquirer/prompts';

import { renderBanner } from './banner.js';
import { renderPanel } from './ui.js';

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
Check whether an error indicates that the user aborted an interactive prompt.
*/
function isPromptExitError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'ExitPromptError' || error.name === 'AbortPromptError')
  );
}

/**
Prompt the user for free-form text input.
*/
export async function validateTextInput(prompt: string): Promise<string> {
  if (!process.stdin.isTTY) {
    printInteractiveTerminalError();
  }

  try {
    const answer = await input({
      message: prompt.trim(),
    });
    return answer;
  } catch (error) {
    if (isPromptExitError(error)) {
      exitWithGoodbye(true);
    }
    printInteractiveTerminalError();
  }
}
