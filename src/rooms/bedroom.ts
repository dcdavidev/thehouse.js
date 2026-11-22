/**
 * Bedroom.
 *
 * Sides:
 * - FORWARD: dresser
 * - RIGHT: window
 * - BACKWARD: bed
 * - LEFT: door to the hallway
 */

import type { Player } from '../characters/player.js';
import { HOUSE_KEY_1, type RoomName } from '../helpers/constants.js';
import { printPause } from '../helpers/print-pause.js';
import { randomInt } from '../helpers/random.js';
import { validateInput } from '../helpers/validate-input.js';
import type { TheHouse } from '../thehouse.js';
import { Room } from './room.js';

const DRAWER_OPTIONS: Record<string, number | 'back'> = {
  'Open 1st drawer': 1,
  'Open 2nd drawer': 2,
  'Open 3rd drawer': 3,
  'Open 4th drawer': 4,
  'Open 5th drawer': 5,
  'You give up': 'back',
};

/**
 * Starting bedroom containing a dresser with the first house key and a bed to rest.
 */
export class Bedroom extends Room {
  readonly name: RoomName = 'bedroom';
  keyInDrawer: number;

  /**
   * Initialize the bedroom and hide the first key in a random drawer.
   */
  constructor(player: Player, thehouse: TheHouse) {
    super(player, thehouse);
    this.keyInDrawer = randomInt(1, 5);
  }

  /**
   * Print the sides of the bedroom.
   */
  override async blueprint(): Promise<void> {
    await printPause([
      '- In front of you, there is a dresser.',
      '- On your right, there is a window.',
      '- Behind you, there is a bed.',
      '- On your left, there is a door.',
    ]);
  }

  /**
   * Enter the bedroom and prompt the player to move.
   */
  override async center(): Promise<RoomName> {
    await printPause('You are in the bedroom!');
    await this.blueprint();
    return this.move();
  }

  /**
   * Open the door leading to the hallway.
   */
  override async left(): Promise<RoomName> {
    await printPause('You open the door and enter the hallway.');
    return 'hallway';
  }

  /**
   * Offer the player a chance to rest in bed and restore health.
   */
  override async backward(): Promise<RoomName> {
    await printPause(['You look tired.', 'Do you want to rest a little?']);

    const choice = await validateInput('Type yes or no: ', ['yes', 'no']);

    if (choice === 'yes') {
      await printPause(['You decide to rest.', '.', '.', '.'], 2);
      await this.player.restoreHealth();
    } else {
      await printPause('You go back.');
    }

    return this.name;
  }

  /**
   * Look out the bedroom window into the darkness.
   */
  override async right(): Promise<RoomName> {
    await printPause(
      [
        'You look out the window.',
        'Outside, it is pitch black!',
        'Something is moving in the darkness.',
        'It moves so fast that you can barely see it...',
        'You wonder how you can escape this house.',
        'And if it is even safe outside...',
        'You go back.',
      ],
      3
    );

    return this.name;
  }

  /**
   * Approach the dresser and search its five drawers.
   */
  override async forward(): Promise<RoomName> {
    await printPause(['There are five drawers.']);
    return this.pickADrawer();
  }

  /**
   * Prompt the player to pick a dresser drawer to search.
   */
  async pickADrawer(): Promise<RoomName> {
    const optionLabels = Object.keys(DRAWER_OPTIONS);

    while (this.player.isAlive) {
      const choiceLabel = await validateInput('Choose wisely: ', optionLabels);
      const selectedKey = optionLabels.find(
        (key) => key.toLowerCase() === choiceLabel
      );
      if (!selectedKey) {
        continue;
      }

      const choice = DRAWER_OPTIONS[selectedKey];

      if (choice === 'back') {
        await printPause('You go back to the center of the room.');
        return this.name;
      }

      await printPause(
        'There are some clothes in it. You dig through them to find something...'
      );

      if (choice === this.keyInDrawer) {
        if (this.player.hasItem(HOUSE_KEY_1)) {
          await printPause([
            'You already found a key in this drawer!',
            'There is nothing more in it.',
          ]);
        } else {
          await printPause('You find a key!');
          await this.player.pickAnItem(HOUSE_KEY_1);
        }
      } else {
        await printPause([
          'There is nothing among the clothes.',
          'Something outside is moving...',
        ]);
        await this.player.loseHealth();
      }
    }

    return this.name;
  }
}
