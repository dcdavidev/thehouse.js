/**
TheHouse game engine wrapping all rooms and running the game loop.
*/

import type { Player } from './characters/player.js';
import { BANNERS } from './helpers/banner.js';
import type { RoomName } from './helpers/constants.js';
import { printPause } from './helpers/print-pause.js';
import { randomDeath } from './helpers/random-death.js';
import { GameState } from './helpers/state.js';
import {
  Bedroom,
  Diningroom,
  Hall,
  Hallway,
  Kitchen,
  Livingroom,
  Studio,
} from './rooms/index.js';

export interface HouseRooms {
  bedroom: Bedroom;
  diningroom: Diningroom;
  hall: Hall;
  hallway: Hallway;
  kitchen: Kitchen;
  livingroom: Livingroom;
  studio: Studio;
}

/**
 * Main game engine coordinating rooms, player state, and win/loss conditions.
 */
export class TheHouse {
  player: Player;
  rooms: HouseRooms;
  currentRoom: RoomName;

  /**
   * Initialize all rooms and bind the player to the game state.
   */
  constructor(player: Player) {
    this.player = player;

    this.rooms = {
      bedroom: new Bedroom(this.player, this),
      diningroom: new Diningroom(this.player, this),
      hall: new Hall(this.player, this),
      hallway: new Hallway(this.player, this),
      kitchen: new Kitchen(this.player, this),
      livingroom: new Livingroom(this.player, this),
      studio: new Studio(this.player, this),
    };

    this.currentRoom = 'bedroom';
    GameState.update({ player: this.player, room: this.currentRoom });
  }

  /**
   * Display the title banner and opening narrative.
   */
  async introduction(): Promise<void> {
    await printPause([{ text: BANNERS.thehouse, tone: 'title' }], 3);

    await printPause(
      [
        'Someone, or something hit you and you faint.',
        'You hear that this someone or something drags you to someplace.',
        'You open your eyes and find yourself lying on the floor.',
        'Your head is pounding and it hurts.',
        'With a lot of effort you stand up.',
      ],
      2
    );
  }

  /**
   * Run the room-by-room exploration loop until escape or death.
   */
  async play(): Promise<void> {
    await this.introduction();

    while (!this.player.escaped && this.player.isAlive) {
      GameState.update({ room: this.currentRoom });

      const nextRoom = await this.rooms[this.currentRoom].center();
      this.currentRoom = nextRoom;

      if (!this.player.isAlive) {
        // randomDeath already ends with the GAME OVER line
        await randomDeath();
        break;
      }

      if (this.player.escaped) {
        await printPause([{ text: BANNERS.victory, tone: 'success' }]);
        break;
      }
    }
  }
}
