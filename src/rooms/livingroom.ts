/**
 * Living Room.
 *
 * Sides:
 * - FORWARD: safe
 * - RIGHT: door to the hallway
 * - BACKWARD: window
 * - LEFT: window
 */

import { Monster } from '../characters/monster.js';
import type { Player } from '../characters/player.js';
import {
  HOUSE_KEY_3,
  KNIFE,
  PASSEPARTOUT,
  type RoomName,
} from '../helpers/constants.js';
import { printPause } from '../helpers/print-pause.js';
import { randomInt } from '../helpers/random.js';
import { validateInput } from '../helpers/validate-input.js';
import { validateTextInput } from '../helpers/validate-text-input.js';
import type { TheHouse } from '../thehouse.js';
import { Room } from './room.js';

/**
 * Living room guarded by a monster and hiding a combination safe with the third house key.
 */
export class Livingroom extends Room {
  readonly name: RoomName = 'livingroom';
  monster: Monster;
  tries: number;
  safeOpen: boolean;
  safeCombination: number;

  /**
   * Initialize the living room, monster, escape tries, and safe combination.
   */
  constructor(player: Player, thehouse: TheHouse) {
    super(player, thehouse);
    this.monster = new Monster(this.player);
    this.tries = randomInt(3, 6);
    this.safeOpen = false;
    this.safeCombination = randomInt(1, 9999);
  }

  /**
   * Print the sides of the living room.
   */
  override async blueprint(): Promise<void> {
    await printPause([
      '- In front of you, there is a painting.',
      '- On your right, there is a door.',
      '- Behind you, there is a window.',
      '- On your left, there is another window.',
    ]);
  }

  /**
   * Trigger monster combat if alive, otherwise let the player explore the room.
   */
  override async center(): Promise<RoomName> {
    if (this.monster.isAlive) {
      await printPause([
        'There is a terrible monster!',
        'It is half human and half something indescribable!',
        'Luckily, it is slow, but one of its tentacles tries to grab you!',
      ]);
      return this.fightOrEscape();
    }

    await printPause('You are in the living room!');
    await this.blueprint();
    return this.move();
  }

  /**
   * Prompt the player to fight the monster or attempt to flee.
   */
  async fightOrEscape(): Promise<RoomName> {
    const choice = await validateInput('Do you want to fight or escape?', [
      'fight',
      'escape',
    ]);

    return choice === 'fight' ? this.fight() : this.escape();
  }

  /**
   * Execute a combat round between the player and the monster.
   */
  async fight(): Promise<RoomName> {
    if (this.monster.isAlive && this.player.isAlive) {
      await printPause('It is your turn to deal damage!');

      let damage: number;
      if (this.player.hasItem(KNIFE)) {
        damage = randomInt(2, 4);
      } else {
        damage = 1;
        await printPause(
          'It seems like you need something to deal more damage!'
        );
      }

      await printPause(`You deal ${damage} damage.`);
      await this.monster.loseHealth(damage);

      if (this.monster.isAlive) {
        await printPause("It is the monster's turn to deal damage!");
        await this.monster.dealDamage();

        return this.player.isAlive ? this.fightOrEscape() : this.name;
      }

      await printPause([
        'You successfully kill the monster!',
        'The monster drops a key.',
      ]);
      await this.player.pickAnItem(PASSEPARTOUT);
      this.thehouse.rooms.studio.doorLocked = false;
      return this.center();
    }

    return this.name;
  }

  /**
   * Attempt to escape the monster by choosing a random path.
   */
  async escape(): Promise<RoomName> {
    await printPause('You are trying to escape the monster!');

    const choice = await validateInput('Quick, choose a path!', [
      'Path 1',
      'Path 2',
      'Path 3',
      'Path 4',
      'Path 5',
      'Path 6',
    ]);

    const parts = choice.split(/\s+/);
    const pathNum = Math.trunc(Number(parts.at(-1) ?? '0'));

    if (pathNum === randomInt(1, 6)) {
      await printPause('You successfully escape the monster!');
      return 'hallway';
    }

    await printPause('You panic and cannot escape the fight.');
    this.tries -= 1;

    if (this.tries <= 0) {
      await printPause('The monster reaches you!');
      await this.monster.dealDamage();
      this.tries = randomInt(3, 6);

      return this.player.isAlive ? this.fightOrEscape() : this.name;
    }

    return this.fightOrEscape();
  }

  /**
   * Exit the living room into the hallway.
   */
  override async right(): Promise<RoomName> {
    await printPause('You open the door and enter the hallway.');
    return 'hallway';
  }

  /**
   * Look out the back window toward the car outside.
   */
  override async backward(): Promise<RoomName> {
    await printPause([
      'There is a window and you look outside.',
      'There is a car! Maybe you can use it to escape from this house!',
      'You go back.',
    ]);
    return this.name;
  }

  /**
   * Look out onto the dark garden balcony.
   */
  override async left(): Promise<RoomName> {
    await printPause([
      'There is a balcony.',
      'Outside, there is a garden.',
      'The low lights make the garden look bleak.',
      'You go back.',
    ]);
    return this.name;
  }

  /**
   * Inspect the painting concealing the wall safe.
   */
  override async forward(): Promise<RoomName> {
    if (this.safeOpen) {
      await printPause([
        'You already opened the safe and picked THE HOUSE KEY 3.',
        'You go back.',
      ]);
      return this.name;
    }

    await printPause([
      'There is a painting...',
      'You look closely and see there is something behind it!',
      'You move the painting and reveal a safe!',
      'Maybe you can break it open!',
    ]);

    return this.breakOpen();
  }

  /**
   * Prompt the player to enter the 4-digit safe combination.
   */
  async breakOpen(): Promise<RoomName> {
    await printPause('You need a combination!');

    const paddedCombination = String(this.safeCombination).padStart(4, '0');
    const rawCombination = String(this.safeCombination);

    while (true) {
      const choice = await validateTextInput(
        "Enter the combination (4 digits), or type 'back': "
      );

      if (choice.trim().toLowerCase() === 'back') {
        return this.name;
      }

      const trimmed = choice.trim();
      if (trimmed === paddedCombination || trimmed === rawCombination) {
        await printPause([
          'You successfully open the safe!',
          'Inside, there is a key!',
        ]);
        await this.player.pickAnItem(HOUSE_KEY_3);
        this.safeOpen = true;
        return this.name;
      }

      await printPause('The combination is wrong! Try again!');
    }
  }
}
