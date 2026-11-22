/**
Game-wide constants for item names and shared types.
*/

export const HOUSE_KEY_1 = 'THE HOUSE KEY 1' as const;
export const HOUSE_KEY_2 = 'THE HOUSE KEY 2' as const;
export const HOUSE_KEY_3 = 'THE HOUSE KEY 3' as const;
export const STUDIO_KEY = 'THE STUDIO KEY' as const;
export const PASSEPARTOUT = 'PASSEPARTOUT' as const;
export const KNIFE = 'KNIFE' as const;

export type ItemName =
  | typeof HOUSE_KEY_1
  | typeof HOUSE_KEY_2
  | typeof HOUSE_KEY_3
  | typeof STUDIO_KEY
  | typeof PASSEPARTOUT
  | typeof KNIFE
  | (string & {});

export type RoomName =
  | 'bedroom'
  | 'diningroom'
  | 'hall'
  | 'hallway'
  | 'kitchen'
  | 'livingroom'
  | 'studio';
