// room.js
function handleRoomSocket(io, socket) {
  console.log(`玩家進入房間：${socket.id}`);

  // 註冊玩家進入房間
  socket.on('registerInRoom', (roomID, playerID) => {
    socket.join(roomID);
    console.log(`玩家 ${playerID} 進入房間 ${roomID}`);
  });

  // 處理遊戲內訊息
  socket.on('sendMessage', (data) => {
    const { roomID, playerID, message } = data;
    io.to(roomID).emit('receiveMessage', { sender: playerID, message });
  });

  // 玩家斷開連接時，從房間中移除
  socket.on('disconnect', () => {
    console.log(`玩家已斷開連接：${socket.id}`);
    for (let roomID in rooms) {
      if (rooms[roomID].players.includes(socket.id)) {
        rooms[roomID].players = rooms[roomID].players.filter(id => id !== socket.id);
        io.to(roomID).emit('playerLeft', { playerID: socket.id });
      }
    }
  });
}

module.exports = { handleRoomSocket };
// room.js
const { emitMove } = require('./socket');

document.getElementById('move-button').addEventListener('click', () => {
  const roomID = 'room1'; // 假設房間ID
  const playerID = 'player1'; // 假設玩家ID
  const move = 'card1'; // 假設卡牌移動

  emitMove(roomID, playerID, move);
});
socket.on('gameUpdate', (gameState) => {
  document.getElementById('current-turn').textContent = gameState.turn;
  document.getElementById('player1-stamina').textContent = gameState.stamina['player1'];
  document.getElementById('player2-stamina').textContent = gameState.stamina['player2'];
});
