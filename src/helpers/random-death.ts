/**
Print a random death message followed by Game Over.
*/

import { printPause } from './print-pause.js';
import { randomChoice } from './random.js';

export const DEATHS = [
  'Something utterly bad stabs you in the back. You died!',
  'A strange figure grabs you and kills you instantly!',
  'Something from the dark makes you so mad you die!',
] as const;

/**
 * Print a random death message followed by the Game Over line.
 */
export async function randomDeath(): Promise<void> {
  const deathMsg = randomChoice(DEATHS);
  await printPause([{ text: deathMsg, tone: 'danger' }], 3);
  await printPause([{ text: '=== GAME OVER ===', tone: 'danger' }], 3);
}
