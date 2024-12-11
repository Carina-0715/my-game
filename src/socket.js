// socket.js
const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000');

function handleSocketEvents() {
  // 玩家進入遊戲房間
  socket.on('joinRoom', (roomID, playerID) => {
    console.log(`${playerID} 加入了房間 ${roomID}`);
  });

  // 監聽遊戲開始
  socket.on('startGame', (roomID) => {
    console.log(`遊戲在房間 ${roomID} 開始`);
  });

  // 玩家移動後的回合更新
  socket.on('nextTurn', (roomID, turn) => {
    console.log(`現在是玩家 ${turn} 的回合`);
  });

  // 遊戲結束時的勝者通知
  socket.on('gameOver', (winner) => {
    console.log(`遊戲結束，玩家 ${winner} 勝出`);
  });
}

function emitMove(roomID, playerID, move) {
  socket.emit('playerMove', roomID, playerID, move);
}

module.exports = { handleSocketEvents, emitMove };
// socket.js - 處理玩家訊息發送
const { sendPublicMessage, sendPrivateMessage, sendSpectatorMessage } = require('./chat');

io.on('connection', (socket) => {
  // 玩家發送公共訊息
  socket.on('sendPublicMessage', (playerID, message) => {
    sendPublicMessage(playerID, message);
  });

  // 玩家發送私密訊息
  socket.on('sendPrivateMessage', (fromPlayerID, toPlayerID, message) => {
    sendPrivateMessage(fromPlayerID, toPlayerID, message);
  });

  // 觀戰者發送訊息
  socket.on('sendSpectatorMessage', (spectatorID, message) => {
    sendSpectatorMessage(spectatorID, message);
  });
});
