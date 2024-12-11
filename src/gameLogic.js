// gameLogic.js
function handleGameLogic(io, socket) {
  console.log(`遊戲邏輯處理：${socket.id}`);

  // 進行回合計算
  socket.on('playTurn', (data) => {
    const { roomID, playerID, cards } = data;

    // 假設卡片處理邏輯
    const result = calculateTurn(cards); // 這是你需要根據實際規則寫的邏輯
    io.to(roomID).emit('turnResult', { playerID, result });
  });

  // 遊戲結束處理
  socket.on('endGame', (roomID) => {
    const winner = determineWinner(roomID); // 根據遊戲邏輯判定勝者
    io.to(roomID).emit('gameEnded', { winner });
  });

  // 玩家移動邏輯
  socket.on('movePlayer', (data) => {
    const { roomID, playerID, direction } = data;
    // 根據方向更新玩家位置
    const moveResult = updatePlayerPosition(roomID, playerID, direction); 
    io.to(roomID).emit('playerMoved', { playerID, moveResult });
  });

  // 其他遊戲邏輯
  function calculateTurn(cards) {
    // 根據卡片計算結果（例如：乘法運算或其他邏輯）
    return cards[0] * cards[1];
  }

  function determineWinner(roomID) {
    // 根據遊戲狀態判斷勝者
    return 'Player1'; // 假設返回一個勝者ID
  }

  function updatePlayerPosition(roomID, playerID, direction) {
    // 根據玩家選擇的方向更新其位置
    return { x: 5, y: 5 }; // 假設返回一個位置
  }
}

module.exports = { handleGameLogic };
// gameLogic.js
let gameStates = {};  // 儲存所有遊戲狀態

function initGame(roomID) {
  // 初始化遊戲狀態
  gameStates[roomID] = {
    players: [],
    turn: 0,  // 當前回合
    stamina: {},
    cards: {},
    gameOver: false,
    winner: null
  };
}

function updateGameState(roomID, state) {
  if (gameStates[roomID]) {
    gameStates[roomID] = { ...gameStates[roomID], ...state };
  }
}

function nextTurn(roomID) {
  const gameState = gameStates[roomID];
  if (gameState) {
    gameState.turn = (gameState.turn + 1) % gameState.players.length;
    updateGameState(roomID, { turn: gameState.turn });
  }
}

// 在遊戲邏輯中更新玩家移動後的狀態
function playMove(roomID, playerID, move) {
  const gameState = gameStates[roomID];
  if (gameState && gameState.players[gameState.turn] === playerID) {
    const staminaCost = 1;
    const stamina = gameState.stamina[playerID] - staminaCost;
    
    if (stamina >= 0) {
      gameState.stamina[playerID] = stamina;
      nextTurn(roomID);
      io.emit('gameUpdate', gameState); // 通知所有玩家遊戲狀態
    } else {
      console.log(`玩家 ${playerID} 沒有足夠的耐力`);
    }
  }
}


function checkGameOver(roomID) {
  const gameState = gameStates[roomID];
  if (gameState) {
    const playerStamina = gameState.stamina;
    for (const playerID in playerStamina) {
      if (playerStamina[playerID] <= 0) {
        gameState.gameOver = true;
        gameState.winner = Object.keys(playerStamina).find(
          (id) => playerStamina[id] > 0
        );
        break;
      }
    }
  }
}

module.exports = { initGame, updateGameState, playMove, nextTurn, checkGameOver };
