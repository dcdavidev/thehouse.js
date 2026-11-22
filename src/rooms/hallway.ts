/**
 * Hallway.
 *
 * Sides:
 * - FORWARD: the hall
 * - RIGHT: door to the bedroom
 * - BACKWARD: door to the studio
 * - LEFT: door to the livingroom
 */

import { PASSEPARTOUT, type RoomName } from '../helpers/constants.js';
import { printPause } from '../helpers/print-pause.js';
import { validateInput } from '../helpers/validate-input.js';
import { Room } from './room.js';

const RIGHT_CHOICES: Record<string, 'table' | 'door'> = {
  'Check the table': 'table',
  'Open the door': 'door',
};

/**
 * Central hallway connecting the hall, bedroom, studio, and living room.
 */
export class Hallway extends Room {
  readonly name: RoomName = 'hallway';

  /**
   * Print the sides of the hallway.
   */
  override async blueprint(): Promise<void> {
    await printPause([
      '- In front of you, there is the hall of the house.',
      '- On your right, there is a small table and a door.',
      '- Behind you, there is a door.',
      '- On your left, there is a door and two paintings.',
    ]);
  }

  /**
   * Enter the hallway and prompt the player to move.
   */
  override async center(): Promise<RoomName> {
    await printPause('You are in the hallway.');
    await this.blueprint();
    return this.move();
  }

  /**
   * Attempt to enter the studio if its door is unlocked and the player has the passepartout.
   */
  override async backward(): Promise<RoomName> {
    const studio = this.thehouse.rooms.studio;

    if (studio.doorLocked || !this.player.hasItem(PASSEPARTOUT)) {
      await printPause([
        'The door is locked!',
        'It seems you need to find a key.',
        'You go back.',
      ]);
      return this.name;
    }

    await printPause('You open the door and enter the studio.');
    return 'studio';
  }

  /**
   * Walk forward into the hall.
   */
  override async forward(): Promise<RoomName> {
    return 'hall';
  }

  /**
   * Check the small table or enter the bedroom.
   */
  override async right(): Promise<RoomName> {
    if (!this.player.hasItem(PASSEPARTOUT)) {
      await printPause([
        'There is a small table and a door.',
        'What do you want to do?',
      ]);

      const optionLabels = Object.keys(RIGHT_CHOICES);
      const choiceLabel = await validateInput('Your choice: ', optionLabels);
      const selectedKey = optionLabels.find(
        (key) => key.toLowerCase() === choiceLabel
      );
      const choice = selectedKey ? RIGHT_CHOICES[selectedKey] : 'table';

      if (choice === 'door') {
        await printPause('You open the door and enter the bedroom.');
        return 'bedroom';
      }

      return this.table();
    }

    await printPause('You open the door and enter the bedroom.');
    return 'bedroom';
  }

  /**
   * Inspect the empty drawer of the hallway table.
   */
  async table(): Promise<RoomName> {
    await printPause([
      'You open the drawer and find that it is empty.',
      'You go back.',
    ]);
    return this.name;
  }

  /**
   * Enter the living room.
   */
  override async left(): Promise<RoomName> {
    await printPause('You open the door and enter the living room.');
    return 'livingroom';
  }
}
