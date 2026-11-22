/**
 * Dining Room.
 *
 * Sides:
 * - FORWARD: corpse
 * - RIGHT: corpse
 * - BACKWARD: corpse
 * - LEFT: door to the hall
 */

import type { Player } from '../characters/player.js';
import { HOUSE_KEY_2, type RoomName } from '../helpers/constants.js';
import { printPause } from '../helpers/print-pause.js';
import { randomChoice } from '../helpers/random.js';
import type { TheHouse } from '../thehouse.js';
import { Room } from './room.js';

type CorpseSide = 'forward' | 'right' | 'backward';

/**
 * Dining room containing three corpses, one of which holds the second house key.
 */
export class Diningroom extends Room {
  readonly name: RoomName = 'diningroom';
  keyInCorpse: CorpseSide;

  /**
   * Initialize the dining room and place the key on a random corpse.
   */
  constructor(player: Player, thehouse: TheHouse) {
    super(player, thehouse);
    this.keyInCorpse = randomChoice(['forward', 'right', 'backward'] as const);
  }

  /**
  Check the pockets of the corpse on the specified side.
  */
  private async checkCorpsePockets(side: CorpseSide): Promise<void> {
    if (this.keyInCorpse === side) {
      if (this.player.hasItem(HOUSE_KEY_2)) {
        await printPause([
          'You already checked its pockets and found a key.',
          'You go back.',
        ]);
      } else {
        await printPause('You find a key!');
        await this.player.pickAnItem(HOUSE_KEY_2);
      }
    } else {
      await printPause('There is nothing inside its pockets. You go back.');
    }
  }

  /**
  Print the blueprint of the dining room.
  */
  override async blueprint(): Promise<void> {
    await printPause([
      '- In front of you, there is a corpse!',
      '- On your right, there is another corpse!',
      '- Behind you, there is a third corpse!',
      '- On your left, there is a door.',
    ]);
  }

  /**
  Print welcome message and prompt the player to move.
  */
  override async center(): Promise<RoomName> {
    await printPause([
      'You are in the dining room!',
      'There is a bloody mess here...',
      'Someone or something killed three people!',
    ]);
    await this.blueprint();
    return this.move();
  }

  /**
   * Inspect the corpse in front of the player.
   */
  override async forward(): Promise<RoomName> {
    await printPause([
      'Something smashed its head!',
      'There is a lot of blood and a strange material on the corpse.',
      'You check its pockets.',
    ]);
    await this.checkCorpsePockets('forward');
    return this.name;
  }

  /**
   * Inspect the corpse on the right side.
   */
  override async right(): Promise<RoomName> {
    await printPause([
      'Something ripped its arms off!',
      'You check its pockets.',
    ]);
    await this.checkCorpsePockets('right');
    return this.name;
  }

  /**
   * Inspect the corpse behind the player.
   */
  override async backward(): Promise<RoomName> {
    await printPause([
      'There is a huge hole inside the chest of the corpse.',
      'Something ripped its heart out!',
      'You check its pockets.',
    ]);
    await this.checkCorpsePockets('backward');
    return this.name;
  }

  /**
   * Open the door leading back to the hall.
   */
  override async left(): Promise<RoomName> {
    await printPause('You open the door and enter the hall.');
    return 'hall';
  }
}
