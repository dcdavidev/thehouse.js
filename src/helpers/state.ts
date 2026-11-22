/**
 * Game state shown in the status bar.
 */

import type { Player } from '../characters/player.js';
import type { GameStatus } from '../io.js';

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

  /**
   * A copy of what the status bar shows, or null before the game starts.
   */
  snapshot(): GameStatus | null {
    const { player } = GameState;
    if (!player) {
      return null;
    }
    return {
      health: Math.max(0, player.health),
      maxHealth: player.maxHealth,
      items: [...player.items],
      room: GameState.currentRoom,
    };
  },
};
