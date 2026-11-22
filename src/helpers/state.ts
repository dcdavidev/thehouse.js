/**
 * Game state manager for the persistent UI appbar.
 */

import type { Player } from '../characters/player.js';

export const GameState = {
  player: null as Player | null,
  currentRoom: 'Bedroom',

  /**
   * Update the current player and/or room name.
   */
  update(options: { player?: Player; room?: string }): void {
    if (options.player) {
      GameState.player = options.player;
    }
    if (options.room) {
      GameState.currentRoom = options.room;
    }
  },

  /**
   * Reset the game state to its initial defaults.
   */
  reset(): void {
    GameState.player = null;
    GameState.currentRoom = 'Bedroom';
  },
};
