/**
Monster character class.
*/

import { randomInt } from '../helpers/random.js';
import { Character } from './character.js';
import type { Player } from './player.js';

/**
 * Hostile monster encountered in the living room.
 */
export class Monster extends Character {
  player: Player;

  /**
   * Create a monster targeting the given player.
   */
  constructor(player: Player) {
    super();
    this.player = player;
  }

  /**
   * Return a summary of the monster's current health.
   */
  toString(): string {
    return `Monster - health: ${this.health}`;
  }

  /**
  Deal random damage (1 or 2) to the player.
  */
  async dealDamage(): Promise<void> {
    const damage = randomInt(1, 2);
    await this.player.loseHealth(damage);
  }
}
