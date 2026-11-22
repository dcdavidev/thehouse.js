import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Player } from '../src/characters/player.js';
import {
  HOUSE_KEY_1,
  HOUSE_KEY_2,
  HOUSE_KEY_3,
  KNIFE,
  PASSEPARTOUT,
  STUDIO_KEY,
} from '../src/helpers/constants.js';
import { GameState } from '../src/helpers/state.js';
import * as validateInputModule from '../src/helpers/validate-input.js';
import * as validateTextInputModule from '../src/helpers/validate-text-input.js';
import { getAppbar } from '../src/terminal/ui.js';
import { TheHouse } from '../src/thehouse.js';

vi.mock('../src/helpers/print-pause.js', () => ({
  printPause: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/helpers/validate-input.js', () => ({
  validateInput: vi.fn(),
}));

vi.mock('../src/helpers/validate-text-input.js', () => ({
  validateTextInput: vi.fn(),
}));

describe('TheHouse & Rooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    GameState.reset();
  });

  it('initializes all 7 rooms starting in bedroom', () => {
    const player = new Player();
    const house = new TheHouse(player);
    expect(house.currentRoom).toBe('bedroom');
    expect(
      Object.keys(house.rooms).toSorted((a, b) => a.localeCompare(b))
    ).toEqual([
      'bedroom',
      'diningroom',
      'hall',
      'hallway',
      'kitchen',
      'livingroom',
      'studio',
    ]);
    expect(GameState.player).toBe(player);
    expect(GameState.currentRoom).toBe('bedroom');
  });

  it('allows finding HOUSE_KEY_1 in bedroom and resting restores health', async () => {
    const player = new Player();
    player.health = 2;
    const house = new TheHouse(player);
    house.rooms.bedroom.keyInDrawer = 2;

    vi.mocked(validateInputModule.validateInput)
      .mockResolvedValueOnce('open 2nd drawer')
      .mockResolvedValueOnce('you give up')
      .mockResolvedValueOnce('yes');

    expect(await house.rooms.bedroom.forward()).toBe('bedroom');
    expect(player.hasItem(HOUSE_KEY_1)).toBe(true);

    expect(await house.rooms.bedroom.backward()).toBe('bedroom');
    expect(player.health).toBe(player.maxHealth);
  });

  it('finds HOUSE_KEY_2 on the chosen corpse in diningroom', async () => {
    const player = new Player();
    const house = new TheHouse(player);
    house.rooms.diningroom.keyInCorpse = 'right';

    expect(await house.rooms.diningroom.forward()).toBe('diningroom');
    expect(player.hasItem(HOUSE_KEY_2)).toBe(false);

    expect(await house.rooms.diningroom.right()).toBe('diningroom');
    expect(player.hasItem(HOUSE_KEY_2)).toBe(true);
  });

  it('finds KNIFE in kitchen on the matching wall and drawer', async () => {
    const player = new Player();
    const house = new TheHouse(player);
    house.rooms.kitchen.knifeOnWall = 'left';
    house.rooms.kitchen.knifeInDrawer = 3;

    vi.mocked(validateInputModule.validateInput)
      .mockResolvedValueOnce('open the 3rd drawer')
      .mockResolvedValueOnce('nevermind...');

    expect(await house.rooms.kitchen.left()).toBe('kitchen');
    expect(player.hasItem(KNIFE)).toBe(true);
  });

  it('blocks hallway backward to studio until monster is defeated, then grants PASSEPARTOUT', async () => {
    const player = new Player();
    player.items.push(KNIFE);
    const house = new TheHouse(player);

    expect(await house.rooms.hallway.backward()).toBe('hallway');

    // Kill monster in livingroom
    house.rooms.livingroom.monster.health = 1;
    vi.mocked(validateInputModule.validateInput).mockResolvedValueOnce(
      'go right'
    );

    const next = await house.rooms.livingroom.fight();
    expect(next).toBe('hallway');
    expect(player.hasItem(PASSEPARTOUT)).toBe(true);
    expect(house.rooms.studio.doorLocked).toBe(false);

    expect(await house.rooms.hallway.backward()).toBe('studio');
  });

  it('unlocks livingroom safe with padded or unpadded combination and grants HOUSE_KEY_3', async () => {
    const player = new Player();
    const house = new TheHouse(player);
    house.rooms.livingroom.safeCombination = 42;

    vi.mocked(validateTextInputModule.validateTextInput)
      .mockResolvedValueOnce('9999')
      .mockResolvedValueOnce('0042');

    expect(await house.rooms.livingroom.forward()).toBe('livingroom');
    expect(player.hasItem(HOUSE_KEY_3)).toBe(true);
    expect(house.rooms.livingroom.safeOpen).toBe(true);
  });

  it('allows finding STUDIO_KEY in studio books', async () => {
    const player = new Player();
    const house = new TheHouse(player);
    house.rooms.studio.keyInBook = 2;

    vi.mocked(validateInputModule.validateInput)
      .mockResolvedValueOnce('the king in yellow')
      .mockResolvedValueOnce('nevermind...');

    expect(await house.rooms.studio.left()).toBe('studio');
    expect(player.hasItem(STUDIO_KEY)).toBe(true);
  });

  it('requires all 3 house keys in hall to escape', async () => {
    const player = new Player();
    const house = new TheHouse(player);

    await house.rooms.hall.forward();
    expect(player.escaped).toBe(false);

    player.items.push(HOUSE_KEY_1, HOUSE_KEY_2, HOUSE_KEY_3);
    await house.rooms.hall.forward();
    expect(player.escaped).toBe(true);
  });

  it('renders appbar safely even when player health is negative', () => {
    const player = new Player();
    player.health = -3;
    GameState.update({ player, room: 'livingroom' });

    const bar = getAppbar(GameState.snapshot());
    expect(bar).toContain('LIVINGROOM');
    expect(bar).toContain('Items:');
  });
});
