/**
ASCII banner rendering helper using figlet (Catwalk font).
*/

import figlet from 'figlet';

/**
 * Render ASCII art banner text using the Catwalk figlet font.
 */
export function renderBanner(text: string): string {
  return figlet.textSync(text, { font: 'Catwalk' });
}
