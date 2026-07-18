// games/index.js — registry of playable games. GameManager looks games up here.
// This repo ships one U.S. History Unit 2 game: Washington's War.

import usWashingtonsWar from './usWashingtonsWar.js';

export const GAMES = {
  [usWashingtonsWar.id]: usWashingtonsWar,
};

export function getGame(id) {
  return GAMES[id] || null;
}
