/**
 * Hall.
 *
 * Sides:
 * - FORWARD: the main door of the house
 * - RIGHT: door to the diningroom
 * - BACKWARD: hallway
 * - LEFT: kitchen
 */

import {
  HOUSE_KEY_1,
  HOUSE_KEY_2,
  HOUSE_KEY_3,
  type RoomName,
} from '../helpers/constants.js';
import { printPause } from '../helpers/print-pause.js';
import { Room } from './room.js';

/**
 * Main hall connecting the kitchen, dining room, hallway, and front exit door.
 */
export class Hall extends Room {
  readonly name: RoomName = 'hall';

  /**
   * Print the sides of the hall.
   */
  override async blueprint(): Promise<void> {
    await printPause([
      "- In front of you there's the main door of the house.",
      "- On your right there's a door.",
      "- Backwards there's the hallway.",
      "- On your left there's another door.",
    ]);
  }

  /**
   * Enter the hall and prompt the player to move.
   */
  override async center(): Promise<RoomName> {
    await printPause("You're in the hall!");
    await this.blueprint();
    return this.move();
  }

  /**
   * Return to the hallway.
   */
  override async backward(): Promise<RoomName> {
    return 'hallway';
  }

  /**
   * Enter the kitchen.
   */
  override async left(): Promise<RoomName> {
    await printPause('You open the door and enter the room.');
    return 'kitchen';
  }

  /**
   * Enter the dining room.
   */
  override async right(): Promise<RoomName> {
    await printPause('You open the door and enter the room.');
    return 'diningroom';
  }

  /**
   * Attempt to unlock the main door with all three house keys.
   */
  override async forward(): Promise<RoomName> {
    if (
      this.player.hasItem(HOUSE_KEY_1) &&
      this.player.hasItem(HOUSE_KEY_2) &&
      this.player.hasItem(HOUSE_KEY_3)
    ) {
      await printPause('You unlock the door and finally exit the house!');
      this.player.escapeTheHouse();
    } else {
      await printPause([
        'You need three keys to open the door!',
        'You go back.',
      ]);
    }

    return this.name;
  }
}
