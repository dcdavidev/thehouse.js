/**
Print messages through the installed front end and pause after each one.
*/

import { getIO, type Message, type Span } from '../io.js';
import { GameState } from './state.js';

/**
Whether a message spans several lines, i.e. is an ASCII-art banner.
*/
function isMultiline(message: Message): boolean {
  const text =
    typeof message === 'string'
      ? message
      : message.map((span) => span.text).join('');
  return text.trim().includes('\n');
}

/**
Whether the content is one message made of spans (not a list of messages).
*/
function isSpans(content: Message | readonly Message[]): content is Span[] {
  return (
    typeof content !== 'string' &&
    content.length > 0 &&
    typeof content[0] === 'object' &&
    'text' in content[0]
  );
}

/**
 * Print a message (or several, one after the other in the same box) with
 * the status bar, pausing after each one.
 * @param content a message or a list of messages
 * @param sleepSeconds how long to pause after each message
 */
export async function printPause(
  content: Message | readonly Message[],
  sleepSeconds = 1
): Promise<void> {
  const messages: readonly Message[] =
    typeof content === 'string' || isSpans(content)
      ? [content]
      : (content as readonly Message[]);

  await getIO().print(messages, {
    seconds: sleepSeconds,
    banner: messages.some((message) => isMultiline(message)),
    status: GameState.snapshot(),
  });
}
