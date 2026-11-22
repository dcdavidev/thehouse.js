import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Player } from '../src/characters/player.js';
import * as printPauseModule from '../src/helpers/print-pause.js';
import { setIO } from '../src/io.js';

vi.mock('../src/helpers/print-pause.js', () => ({
  printPause: vi.fn().mockResolvedValue(undefined),
}));

describe('Player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state and health between 5 and 10', () => {
    const player = new Player();
    expect(player.escaped).toBe(false);
    expect(player.items).toEqual([]);
    expect(player.health).toBeGreaterThanOrEqual(5);
    expect(player.health).toBeLessThanOrEqual(10);
    expect(player.health).toBe(player.maxHealth);
    expect(player.isAlive).toBe(true);
  });

  it('formats string representation properly', () => {
    const player = new Player();
    player.health = 5;
    player.escaped = false;
    expect(player.toString()).toBe('Player - health: 5; escaped false');
  });

  it('marks player as escaped', () => {
    const player = new Player();
    player.escapeTheHouse();
    expect(player.escaped).toBe(true);
  });

  it('picks an item and announces it', async () => {
    const player = new Player();
    await player.pickAnItem('Key');
    expect(player.items).toContain('Key');
    expect(player.hasItem('Key')).toBe(true);
    expect(printPauseModule.printPause).toHaveBeenCalledWith('You pick Key!');
  });

  it('prints empty message when pockets are empty', async () => {
    const player = new Player();
    await player.printItems();
    expect(printPauseModule.printPause).toHaveBeenCalledWith(
      'Your pockets are empty!'
    );
  });

  it('prints each item in inventory', async () => {
    const player = new Player();
    player.items = ['Key', 'Sword'];
    await player.printItems();
    expect(printPauseModule.printPause).toHaveBeenCalledTimes(2);
    expect(printPauseModule.printPause).toHaveBeenCalledWith('- Key');
    expect(printPauseModule.printPause).toHaveBeenCalledWith('- Sword');
  });

  it('handles overkill damage without throwing and marks player dead', async () => {
    const bell = vi.fn();
    setIO({
      print: vi.fn(),
      choose: vi.fn(),
      ask: vi.fn(),
      bell,
    });
    const player = new Player();
    player.health = 1;
    await player.loseHealth(3);
    expect(player.health).toBe(-2);
    expect(player.isAlive).toBe(false);
    expect(bell).toHaveBeenCalledOnce();
    setIO(null);
  });

  it('restores health to maxHealth', async () => {
    const player = new Player();
    player.health = 2;
    await player.restoreHealth();
    expect(player.health).toBe(player.maxHealth);
  });
});
