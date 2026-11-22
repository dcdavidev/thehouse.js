/**
 * Kitchen.
 *
 * Sides:
 * - FORWARD: window
 * - RIGHT: door to the hall
 * - BACKWARD: drawers
 * - LEFT: drawers
 */

import type { Player } from '../characters/player.js';
import { KNIFE, type RoomName } from '../helpers/constants.js';
import { printPause } from '../helpers/print-pause.js';
import { randomChoice, randomInt } from '../helpers/random.js';
import { validateInput } from '../helpers/validate-input.js';
import type { TheHouse } from '../thehouse.js';
import { Room } from './room.js';

type DrawerWall = 'left' | 'backward';

const DRAWER_OPTIONS: Record<string, number | 'back'> = {
  'Open the 1st drawer': 1,
  'Open the 2nd drawer': 2,
  'Open the 3rd drawer': 3,
  'Nevermind...': 'back',
};

/**
 * Kitchen hiding a knife inside one of the drawers.
 */
export class Kitchen extends Room {
  readonly name: RoomName = 'kitchen';
  knifeInDrawer: number;
  knifeOnWall: DrawerWall;

  /**
   * Initialize the kitchen and randomly place the knife in a drawer.
   */
  constructor(player: Player, thehouse: TheHouse) {
    super(player, thehouse);
    this.knifeInDrawer = randomInt(1, 3);
    this.knifeOnWall = randomChoice(['left', 'backward'] as const);
  }

  /**
  Search the three drawers on the given wall.
  */
  private async searchDrawers(wall: DrawerWall): Promise<RoomName> {
    await printPause([
      'There are three drawers here. You decide to check them all.',
    ]);
    return this.pickADrawer(wall);
  }

  /**
  Print the blueprint of the kitchen.
  */
  override async blueprint(): Promise<void> {
    await printPause([
      '- In front of you, there is a window.',
      '- On your right, there is a door.',
      '- Behind you, there are some kitchen drawers.',
      '- On your left, there are more kitchen drawers.',
    ]);
  }

  /**
  Print welcome message and prompt the player to move.
  */
  override async center(): Promise<RoomName> {
    await printPause('You are in the kitchen!');
    await this.blueprint();
    return this.move();
  }

  /**
  Look out the kitchen window.
  */
  override async forward(): Promise<RoomName> {
    await printPause([
      'You look out of the window.',
      'There is nothing but darkness to see...',
      'You go back.',
    ]);
    return this.name;
  }

  /**
  Move from the kitchen into the hall.
  */
  override async right(): Promise<RoomName> {
    await printPause('You open the door and enter the hall.');
    return 'hall';
  }

  /**
   * Search the drawers on the left wall.
   */
  override async left(): Promise<RoomName> {
    return this.searchDrawers('left');
  }

  /**
   * Search the drawers on the back wall.
   */
  override async backward(): Promise<RoomName> {
    return this.searchDrawers('backward');
  }

  /**
   * Prompt the player to open kitchen drawers on the specified wall.
   */
  async pickADrawer(wall: DrawerWall): Promise<RoomName> {
    const optionLabels = Object.keys(DRAWER_OPTIONS);

    while (true) {
      const choiceLabel = await validateInput(
        'Which drawer do you want to open?',
        optionLabels
      );
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
        'You dig through the kitchen tools, looking for something useful.'
      );

      if (wall === this.knifeOnWall && choice === this.knifeInDrawer) {
        if (this.player.hasItem(KNIFE)) {
          await printPause([
            'You already have the knife from this drawer.',
            'There is nothing else inside.',
          ]);
        } else {
          await printPause('You find a KNIFE!');
          await this.player.pickAnItem(KNIFE);
        }
      } else {
        await printPause(
          'You find nothing but old silverware and rusty tools.'
        );
      }
    }
  }
}
