/**
Game entry loop responsible for initializing and replaying the game.
*/

import { Player } from './characters/player.js';
import { BANNERS } from './helpers/banner.js';
import { printPause } from './helpers/print-pause.js';
import { GameState } from './helpers/state.js';
import { validateInput } from './helpers/validate-input.js';
import { type GameIO, QuitGame, setIO } from './io.js';
import { TheHouse } from './thehouse.js';

/**
 * Play until the player doesn't want to play again, or quits.
 * @param io the front end to play on (e.g. `terminalIO` from
 * `@dcdavidev/thehouse/terminal`, or your own for a web page)
 */
export async function main(io: GameIO): Promise<void> {
  setIO(io);
  try {
    while (true) {
      GameState.reset();
      const player = new Player();
      const game = new TheHouse(player);

      await game.play();

      await printPause('Do you want to play again?');
      const choice = await validateInput('Type yes or no: ', ['yes', 'no']);

      if (choice === 'no') {
        break;
      }
    }
  } catch (error) {
    if (!(error instanceof QuitGame)) {
      throw error;
    }
  }

  try {
    await printPause([{ text: BANNERS.bye, tone: 'warning' }], 0);
  } catch (error) {
    // the front end may already be gone (e.g. a closed page)
    if (!(error instanceof QuitGame)) {
      throw error;
    }
  } finally {
    GameState.reset();
    setIO(null);
  }
}
