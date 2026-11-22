/**
The House — interactive horror adventure.

This entry point has no Node.js or DOM dependencies: pass `main` a `GameIO`
to play it anywhere. The terminal front end lives in
`@dcdavidev/thehouse/terminal`.
*/

export * from './characters/index.js';
export * from './helpers/index.js';
export * from './io.js';
export { main } from './play.js';
export * from './rooms/index.js';
export { type HouseRooms, TheHouse } from './thehouse.js';
