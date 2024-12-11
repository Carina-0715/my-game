const { initGame, updateGameState, playMove, nextTurn, checkGameOver } = require('./gameLogic');

// 創建房間時初始化遊戲
function createRoom(roomID, settings) {
  if (!rooms[roomID]) {
    rooms[roomID] = { settings, players: [] };
    initGame(roomID);
    console.log(`房間 ${roomID} 創建成功`);
  } else {
    console.log(`房間 ${roomID} 已存在`);
  }
}

// 玩家加入房間並初始化卡牌和耐力
function joinRoom(roomID, playerID) {
  if (rooms[roomID]) {
    rooms[roomID].players.push({ id: playerID });
    // 初始耐力設置
    rooms[roomID].stamina[playerID] = 20;
    // 發送遊戲開始訊息
    console.log(`${playerID} 加入了房間 ${roomID}`);
  } else {
    console.log(`房間 ${roomID} 不存在`);
  }
}

// 處理玩家的移動
function playerMove(roomID, playerID, move) {
  playMove(roomID, playerID, move);
  checkGameOver(roomID);  // 檢查遊戲是否結束
}

module.exports = { createRoom, joinRoom, playerMove };
