/**
Menu prompt with an automatic Quit option.
*/

import { getIO, QuitGame } from '../io.js';
import { GameState } from './state.js';

/**
Capitalize the first character of a string.
*/
function capitalizeFirst(value: string): string {
  return value.length === 0
    ? value
    : value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Let the player pick one of the options, plus Quit.
 * @param prompt the question
 * @param options the answers, in order
 * @returns the chosen option, lowercased
 * @throws QuitGame when the player picks Quit
 */
export async function validateInput(
  prompt: string,
  options: readonly string[]
): Promise<string> {
  const choices = options.map((option) => capitalizeFirst(option));
  if (options.every((option) => option.toLowerCase() !== 'quit')) {
    choices.push('Quit');
  }

  const answer = await getIO().choose(prompt.trim(), choices, {
    status: GameState.snapshot(),
  });

  if (answer.toLowerCase() === 'quit') {
    throw new QuitGame();
  }
  return answer.toLowerCase();
}
