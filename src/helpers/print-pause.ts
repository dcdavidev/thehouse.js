/**
Print messages with a persistent appbar and pause the terminal.
*/

import chalk from 'chalk';

import { renderBanner } from './banner.js';
import { makeLayout, renderPanel } from './ui.js';

/**
 * Pause execution for the given number of seconds while handling SIGINT.
 */
function sleep(seconds: number): Promise<void> {
  if (seconds <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const onSigint = (): void => {
      clearTimeout(timer);
      process.off('SIGINT', onSigint);
      console.log(chalk.bold.yellow(renderBanner('BYE')));
      process.exit(0);
    };

    const timer = setTimeout(() => {
      process.off('SIGINT', onSigint);
      resolve();
    }, seconds * 1000);

    process.once('SIGINT', onSigint);
  });
}

/**
 * Move cursor up and clear previously rendered lines on interactive TTYs.
 */
function clearPreviousLines(lineCount: number): void {
  if (lineCount > 0 && process.stdout.isTTY) {
    process.stdout.write(`\u{1B}[${lineCount}A\u{1B}[0J`);
  }
}

/**
 * Print a message (or multiple messages sequentially inside the same box)
 * with the persistent top appbar, pausing after each line.
 */
export async function printPause(
  content: string | readonly string[],
  sleepSeconds = 1
): Promise<void> {
  const lines = typeof content === 'string' ? [content] : [...content];
  const isBanner = lines.some((line) => line.trim().includes('\n'));

  if (isBanner) {
    for (const line of lines) {
      console.log(makeLayout(line));
      await sleep(sleepSeconds);
    }
    return;
  }

  let accumulated = '';
  let renderedLineCount = 0;

  for (const [i, line] of lines.entries()) {
    if (i > 0) {
      accumulated += '\n\n';
    }
    accumulated += line;

    const panel = renderPanel(accumulated, {
      borderColor: chalk.blueBright,
      paddingX: 2,
      paddingY: 1,
    });
    const frame = makeLayout(panel);

    if (i > 0) {
      clearPreviousLines(renderedLineCount);
    }

    process.stdout.write(`${frame}\n`);
    renderedLineCount = frame.split('\n').length;

    await sleep(sleepSeconds);
  }
}
