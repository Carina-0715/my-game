// gameState.js
let gameState = {};

function initGame(roomID) {
  gameState[roomID] = {
    players: [],
    round: 0,
    cards: [],
    stamina: 20,
  };
}

function updatePlayerState(roomID, playerID, stamina) {
  if (gameState[roomID]) {
    const player = gameState[roomID].players.find(p => p.id === playerID);
    if (player) player.stamina = stamina;
  }
}

function getGameState(roomID) {
  return gameState[roomID];
}

module.exports = { initGame, updatePlayerState, getGameState };
