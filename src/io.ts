/**
The seam between the game and whatever shows it: a terminal, a web page, a
test. The game never touches `process`, the DOM or a prompt library itself;
it talks to the `GameIO` installed with `setIO`.
*/

/**
How a run of text should look. Each front end picks its own colors.
*/
export type Tone =
  'plain' | 'bold' | 'muted' | 'danger' | 'success' | 'title' | 'warning';

/**
A run of text with one look.
*/
export interface Span {
  text: string;
  tone?: Tone;
}

/**
One message: plain text, or spans of differently styled text.
*/
export type Message = string | readonly Span[];

/**
What the status bar shows: health, pockets and where the player is.
*/
export interface GameStatus {
  health: number;
  maxHealth: number;
  items: readonly string[];
  room: string;
}

export interface PrintOptions {
  /**
  how long to wait after each message, in seconds
  */
  seconds: number;
  /**
  the messages are ASCII-art banners (keep spacing, no box)
  */
  banner: boolean;
  /**
  the status bar at the time of printing, or null before the game starts
  */
  status: GameStatus | null;
}

export interface PromptOptions {
  status: GameStatus | null;
}

/**
 * A front end for the game.
 *
 * Every method may reject with `QuitGame` to end the game: the game stops at
 * that point and `main` resolves.
 */
export interface GameIO {
  /**
  Show the messages one after the other, waiting `seconds` after each.
  */
  print(messages: readonly Message[], options: PrintOptions): Promise<void>;
  /**
  Let the player pick one of `choices` and resolve with it, exactly as given.
  */
  choose(
    prompt: string,
    choices: readonly string[],
    options: PromptOptions
  ): Promise<string>;
  /**
  Ask the player to type something and resolve with what they typed.
  */
  ask(prompt: string, options: PromptOptions): Promise<string>;
  /**
  The player got hurt: ring a bell, shake the screen, or nothing.
  */
  bell?(): void;
}

/**
Thrown (or rejected with) to end the game early: the player chose Quit.
*/
export class QuitGame extends Error {
  constructor() {
    super('The player quit the game.');
    this.name = 'QuitGame';
  }
}

/**
The installed front end (an object, so the setters don't reassign a module variable).
*/
const slot: { io: GameIO | null } = { io: null };

/**
Install the front end the game talks to.
*/
export function setIO(io: GameIO | null): void {
  slot.io = io;
}

/**
The installed front end, or null when there is none.
*/
export function currentIO(): GameIO | null {
  return slot.io;
}

/**
The installed front end; throws when there is none.
*/
export function getIO(): GameIO {
  if (!slot.io) {
    throw new Error(
      'thehouse: no GameIO installed. Call main(io) or setIO(io) first.'
    );
  }
  return slot.io;
}
