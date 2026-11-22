/**
Terminal UI components (status bar, bordered panels, layout).
*/

import chalk from 'chalk';
import stringWidth from 'string-width';
import wrapAnsi from 'wrap-ansi';

import type { GameStatus, Message, Tone } from '../io.js';

export interface PanelOptions {
  borderColor?: (text: string) => string;
  paddingX?: number;
  paddingY?: number;
  title?: string;
  width?: number;
}

const TONES: Record<Tone, (text: string) => string> = {
  plain: (text) => text,
  bold: chalk.bold,
  muted: chalk.dim,
  danger: chalk.red,
  success: chalk.bold.yellow,
  title: chalk.bold.dim.green,
  warning: chalk.bold.yellow,
};

/**
Turn a message into a string with ANSI colors.
*/
export function renderMessage(message: Message): string {
  return typeof message === 'string'
    ? message
    : message.map((span) => TONES[span.tone ?? 'plain'](span.text)).join('');
}

/**
 * Return the active terminal width in columns, clamped to a safe minimum.
 */
export function getTerminalWidth(): number {
  return Math.max(50, process.stdout.columns || 80);
}

/**
Render content inside a full-width bordered Unicode box.
*/
export function renderPanel(
  content: string,
  options: PanelOptions = {}
): string {
  const {
    borderColor = chalk.blueBright,
    paddingX = 2,
    paddingY = 1,
    title,
    width = getTerminalWidth(),
  } = options;

  const innerWidth = Math.max(10, width - 2);
  const contentWidth = Math.max(1, innerWidth - paddingX * 2);

  const wrappedLines: string[] = [];
  for (const rawLine of content.split('\n')) {
    if (rawLine === '') {
      wrappedLines.push('');
    } else {
      const wrapped = wrapAnsi(rawLine, contentWidth, {
        hard: true,
        trim: false,
      });
      wrappedLines.push(...wrapped.split('\n'));
    }
  }

  let topBorder: string;
  if (title) {
    const titleLabel = ` ${title} `;
    const titleLen = stringWidth(titleLabel);
    const remaining = Math.max(0, innerWidth - titleLen - 2);
    const leftDashes = '─'.repeat(Math.min(2, innerWidth));
    const rightDashes = '─'.repeat(remaining);
    topBorder = borderColor(`╭${leftDashes}${titleLabel}${rightDashes}╮`);
  } else {
    topBorder = borderColor(`╭${'─'.repeat(innerWidth)}╮`);
  }

  const bottomBorder = borderColor(`╰${'─'.repeat(innerWidth)}╯`);
  const emptyLine = `${borderColor('│')}${' '.repeat(innerWidth)}${borderColor('│')}`;

  const bodyLines = wrappedLines.map((line) => {
    const visibleWidth = stringWidth(line);
    const rightPad = Math.max(0, contentWidth - visibleWidth);
    return `${borderColor('│')}${' '.repeat(paddingX)}${line}${' '.repeat(rightPad + paddingX)}${borderColor('│')}`;
  });

  const padLines = Array.from({ length: paddingY }, () => emptyLine);
  return [topBorder, ...padLines, ...bodyLines, ...padLines, bottomBorder].join(
    '\n'
  );
}

/**
Format three columns (left, center, right) to fit cleanly within totalWidth.
*/
function formatThreeColumnRow(
  left: string,
  center: string,
  right: string,
  totalWidth: number
): string {
  const leftW = stringWidth(left);
  const centerW = stringWidth(center);
  const rightW = stringWidth(right);

  const totalContent = leftW + centerW + rightW;
  if (totalContent + 2 >= totalWidth) {
    return `${left} ${center} ${right}`;
  }

  const centerStart = Math.max(
    leftW + 1,
    Math.min(
      Math.floor((totalWidth - centerW) / 2),
      totalWidth - rightW - centerW - 1
    )
  );
  const leftGap = Math.max(1, centerStart - leftW);
  const rightGap = Math.max(1, totalWidth - leftW - leftGap - centerW - rightW);

  return `${left}${' '.repeat(leftGap)}${center}${' '.repeat(rightGap)}${right}`;
}

/**
Create the status bar showing HP, inventory, and current room.
*/
export function getAppbar(status: GameStatus | null): string {
  const width = getTerminalWidth();
  const innerContentWidth = Math.max(10, width - 4); // 2 border chars + 2 paddingX(1)

  if (!status) {
    return renderPanel(chalk.dim('Loading...'), {
      borderColor: chalk.magentaBright,
      paddingX: 1,
      paddingY: 0,
      width,
    });
  }

  const lostHealth = Math.max(0, status.maxHealth - status.health);

  const healthText =
    chalk.bold('HP: ') +
    chalk.red('❤'.repeat(status.health)) +
    chalk.dim.white('o'.repeat(lostHealth));

  const itemsValue =
    status.items.length === 0
      ? chalk.dim.italic('None')
      : chalk.yellow(status.items.join(', '));
  const itemsText = chalk.bold('📦 Items: ') + itemsValue;

  const roomText = chalk.bold.cyan(`🏠 ${status.room.toUpperCase()}`);

  const row = formatThreeColumnRow(
    healthText,
    itemsText,
    roomText,
    innerContentWidth
  );

  return renderPanel(row, {
    borderColor: chalk.magentaBright,
    paddingX: 1,
    paddingY: 0,
    width,
  });
}

/**
Combine the status bar with the main content area.
*/
export function makeLayout(
  mainContent: string,
  status: GameStatus | null
): string {
  return `${getAppbar(status)}\n${mainContent}`;
}
