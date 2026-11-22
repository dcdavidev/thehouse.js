/**
Free-text prompt.
*/

import { getIO } from '../io.js';
import { GameState } from './state.js';

/**
 * Ask the player to type something.
 * @param prompt the question
 * @returns what the player typed
 */
export async function validateTextInput(prompt: string): Promise<string> {
  return getIO().ask(prompt.trim(), { status: GameState.snapshot() });
}
