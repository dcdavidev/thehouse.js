/**
Player character class.
*/

import { printPause } from '../helpers/print-pause.js';
import { Character } from './character.js';

/**
 * Playable protagonist tracking inventory and escape state.
 */
export class Player extends Character {
  escaped: boolean;
  items: string[];

  constructor() {
    super();
    this.escaped = false;
    this.items = [];
  }

  /**
   * Return a summary of the player's health and escape status.
   */
  toString(): string {
    return `Player - health: ${this.health}; escaped ${this.escaped}`;
  }

  /**
  Return whether the player holds the specified item.
  */
  hasItem(item: string): boolean {
    return this.items.includes(item);
  }

  /**
  Mark the player as having escaped the house.
  */
  escapeTheHouse(): void {
    this.escaped = true;
  }

  /**
  Pick up an item and add it to the player's inventory.
  */
  async pickAnItem(item: string): Promise<void> {
    this.items.push(item);
    await printPause(`You pick ${item}!`);
  }

  /**
  Print all items currently held by the player.
  */
  async printItems(): Promise<void> {
    if (this.items.length === 0) {
      await printPause('Your pockets are empty!');
    } else {
      for (const item of this.items) {
        await printPause(`- ${item}`);
      }
    }
  }
}
