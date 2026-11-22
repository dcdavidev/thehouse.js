/**
Game entry loop responsible for initializing and replaying the game.
*/

import { Player } from './characters/player.js';
import { printPause } from './helpers/print-pause.js';
import { validateInput } from './helpers/validate-input.js';
import { TheHouse } from './thehouse.js';

/**
 * Run the main game loop until the player chooses not to replay.
 */
export async function main(): Promise<void> {
  while (true) {
    const player = new Player();
    const game = new TheHouse(player);

    await game.play();

    await printPause('Do you want to play again?');
    const choice = await validateInput('Type yes or no: ', ['yes', 'no']);

    if (choice === 'no') {
      break;
    }
  }
}
