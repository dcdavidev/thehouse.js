/**
 * Studio.
 *
 * Sides:
 * - FORWARD: door to the hallway
 * - RIGHT: window
 * - BACKWARD: desk
 * - LEFT: shelf
 */

import type { Player } from '../characters/player.js';
import {
  PASSEPARTOUT,
  type RoomName,
  STUDIO_KEY,
} from '../helpers/constants.js';
import { printPause } from '../helpers/print-pause.js';
import { randomChoice, randomInt } from '../helpers/random.js';
import { validateInput } from '../helpers/validate-input.js';
import type { TheHouse } from '../thehouse.js';
import { Room } from './room.js';

const BOOK_OPTIONS: Record<string, '1' | '2' | '3' | 'back'> = {
  'Divine Comedy': '1',
  'The King in Yellow': '2',
  "Arkham's Secrets": '3',
  'Nevermind...': 'back',
};

/**
 * Studio containing the safe combination note and a bookshelf hiding the studio key.
 */
export class Studio extends Room {
  readonly name: RoomName = 'studio';
  doorLocked: boolean;
  lights: boolean;
  keyInBook: number;

  /**
   * Initialize the studio with locked door, random lighting, and random key book.
   */
  constructor(player: Player, thehouse: TheHouse) {
    super(player, thehouse);
    this.doorLocked = true;
    this.lights = randomChoice([true, false] as const);
    this.keyInBook = randomInt(1, 3);
  }

  /**
   * Turn on the studio lights at the cost of some player health.
   */
  async promptLight(): Promise<void> {
    await printPause([
      'You hear something lurking in the dark.',
      'You lose some health while turning the lights on.',
    ]);
    await this.player.loseHealth();
    this.lights = true;
  }

  /**
   * Print the sides of the studio.
   */
  override async blueprint(): Promise<void> {
    await printPause([
      '- In front of you, there is a closed door.',
      '- On your right, there is a window.',
      '- Behind you, there is a desk with some papers on it.',
      '- On your left, there is a shelf with many books on it.',
    ]);
  }

  /**
   * Enter the studio, turning on lights if needed, and prompt the player to move.
   */
  override async center(): Promise<RoomName> {
    const lightsState = this.lights ? 'on' : 'off';
    await printPause(
      `You find yourself in a room with the lights ${lightsState}.`
    );

    if (!this.lights) {
      await this.promptLight();
    }

    if (this.player.isAlive) {
      await printPause('You are in the middle of a studio.');
      await this.blueprint();
      return this.move();
    }

    return this.name;
  }

  /**
   * Look out the studio window.
   */
  override async right(): Promise<RoomName> {
    await printPause([
      'Behind the desk, there is a window.',
      'You glance outside, but it is pitch black.',
      'You cannot see anything interesting here.',
      'You go back.',
    ]);
    return this.name;
  }

  /**
   * Inspect the desk note revealing the living room safe combination.
   */
  override async backward(): Promise<RoomName> {
    const combination = String(
      this.thehouse.rooms.livingroom.safeCombination
    ).padStart(4, '0');

    await printPause([
      'The desk is full of papers.',
      'There is a note on the desk.',
      `It says: ${combination}`,
      'You go back.',
    ]);
    return this.name;
  }

  /**
   * Browse the bookshelf on the left side of the studio.
   */
  override async left(): Promise<RoomName> {
    await printPause([
      'On your left, there is a shelf full of books.',
      'You run your finger along the dusty spines and quickly read the titles.',
      'There are so many books on this shelf.',
      'You wonder if you have ever read this many books.',
    ]);
    return this.pickABook();
  }

  /**
   * Inspect the Divine Comedy book.
   */
  async bookDivineComedy(): Promise<void> {
    if (this.keyInBook === 1 && !this.player.hasItem(STUDIO_KEY)) {
      await this.pickTheKey();
    } else {
      await printPause([
        'Amor, ch’a nullo amato amar perdona,',
        'mi prese del costui piacer sì forte,',
        'che, come vedi, ancor non m’abbandona',
      ]);
    }
  }

  /**
   * Inspect The King in Yellow book.
   */
  async bookTheKingInYellow(): Promise<void> {
    if (this.keyInBook === 2 && !this.player.hasItem(STUDIO_KEY)) {
      await this.pickTheKey();
    } else {
      await printPause([
        'for I knew that the King in Yellow',
        'had opened his tattered mantle',
        'and there was only God to cry to now.',
      ]);
    }
  }

  /**
   * Inspect Arkham's Secrets book.
   */
  async bookArkhamsSecrets(): Promise<void> {
    if (this.keyInBook === 3 && !this.player.hasItem(STUDIO_KEY)) {
      await this.pickTheKey();
    } else {
      await printPause([
        'West of Arkham the hills rise wild,',
        'and there are valleys with deep',
        'woods that no axe has ever cut.',
      ]);
    }
  }

  /**
   * Give the studio key to the player.
   */
  async pickTheKey(): Promise<void> {
    await printPause('You open the book and a key falls onto the ground.');
    await this.player.pickAnItem(STUDIO_KEY);
  }

  /**
   * Prompt the player to pick books from the shelf.
   */
  async pickABook(): Promise<RoomName> {
    const optionLabels = Object.keys(BOOK_OPTIONS);

    while (true) {
      const choiceLabel = await validateInput(
        'Which book do you want to pick?',
        optionLabels
      );
      const selectedKey = optionLabels.find(
        (key) => key.toLowerCase() === choiceLabel
      );
      if (!selectedKey) {
        continue;
      }

      const choice = BOOK_OPTIONS[selectedKey];
      if (choice === 'back') {
        await printPause('You go back to the center of the room.');
        return this.name;
      }
      await this.readBook(choice);
    }
  }

  /**
  Open the selected book by its menu identifier.
  */
  async readBook(bookId: '1' | '2' | '3' | undefined): Promise<void> {
    switch (bookId) {
      case '1': {
        await this.bookDivineComedy();
        break;
      }
      case '2': {
        await this.bookTheKingInYellow();
        break;
      }
      case '3': {
        await this.bookArkhamsSecrets();
        break;
      }
      // No default
    }
  }

  /**
   * Attempt to open the studio door leading back to the hallway.
   */
  override async forward(): Promise<RoomName> {
    if (!this.doorLocked) {
      await printPause('You open the door and enter the hallway.');
      return 'hallway';
    }

    await printPause([
      'There is a closed door in front of you.',
      'Do you want to try to open it?',
    ]);

    const choice = await validateInput('Your choice:', ['yes', 'no']);

    if (choice === 'yes') {
      if (
        this.player.hasItem(STUDIO_KEY) ||
        this.player.hasItem(PASSEPARTOUT)
      ) {
        this.doorLocked = false;
        await printPause([
          'You use a key to unlock the door.',
          'You exit the studio.',
        ]);
        return 'hallway';
      }

      await printPause([
        'The door is locked.',
        'It seems you need a key to open it!',
        'You go back.',
      ]);
      return this.name;
    }

    await printPause([
      'You hear a scratching sound from the other side of the door!',
      'You instantly jump back in fear!',
    ]);
    await this.player.loseHealth();
    return this.name;
  }
}
