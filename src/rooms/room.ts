/**
Base Room blueprint.
*/

import type { Player } from '../characters/player.js';
import type { RoomName } from '../helpers/constants.js';
import { validateInput } from '../helpers/validate-input.js';
import type { TheHouse } from '../thehouse.js';

type MoveAction = 'forward' | 'right' | 'backward' | 'left' | 'help' | 'items';

const MOVE_OPTIONS: Record<string, MoveAction> = {
  'Go forward': 'forward',
  'Go right': 'right',
  'Go backward': 'backward',
  'Go left': 'left',
  'Check the room (Help)': 'help',
  'Check your pockets (Items)': 'items',
};

/**
 * Abstract base class for all rooms in the house.
 */
export abstract class Room {
  abstract readonly name: RoomName;
  player: Player;
  thehouse: TheHouse;

  /**
   * Bind the room to the active player and house instance.
   */
  constructor(player: Player, thehouse: TheHouse) {
    this.player = player;
    this.thehouse = thehouse;
  }

  /**
   * Return the canonical lowercase room name.
   */
  toString(): RoomName {
    return this.name;
  }

  /**
  Print all sides of the room (called when the user selects Help).
  */
  async blueprint(): Promise<void> {}

  /**
  Entry point when entering or returning to the room.
  */
  abstract center(): Promise<RoomName>;

  /**
  Inspect or move toward the right side of the room.
  */
  async right(): Promise<RoomName> {
    return this.name;
  }

  /**
  Inspect or move toward the left side of the room.
  */
  async left(): Promise<RoomName> {
    return this.name;
  }

  /**
  Inspect or move toward the back side of the room.
  */
  async backward(): Promise<RoomName> {
    return this.name;
  }

  /**
  Inspect or move toward the front side of the room.
  */
  async forward(): Promise<RoomName> {
    return this.name;
  }

  /**
  Prompt the player to choose a direction or room action.
  */
  async move(): Promise<RoomName> {
    const optionLabels = Object.keys(MOVE_OPTIONS);

    while (true) {
      const choiceLabel = await validateInput(
        'Where do you want to go?',
        optionLabels
      );

      const selectedKey = optionLabels.find(
        (key) => key.toLowerCase() === choiceLabel
      );
      if (!selectedKey) {
        continue;
      }

      const choice = MOVE_OPTIONS[selectedKey];
      if (choice === 'right') {
        return this.right();
      }
      if (choice === 'left') {
        return this.left();
      }
      if (choice === 'backward') {
        return this.backward();
      }
      if (choice === 'forward') {
        return this.forward();
      }
      if (choice === 'help') {
        await this.blueprint();
      } else if (choice === 'items') {
        await this.player.printItems();
      }
    }
  }
}
