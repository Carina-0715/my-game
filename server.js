const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);



let players = {};  // 儲存已註冊的玩家ID


const rooms = {
  // 範例結構
  // roomId: { players: [], messages: [] }
};
function broadcastRoomState(roomId) {
  if (rooms[roomId]) {
    // 廣播該房間的玩家列表和對話框訊息
    io.to(roomId).emit("updateRoomState", {
      players: rooms[roomId].players,
      messages: rooms[roomId].messages,
    });
  }
}

// 伺服器靜態資源路徑設定
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('玩家已連接：' + socket.id);

  // 玩家ID唯一性檢查
  socket.on('checkPlayerID', (playerID) => {
    if (players[playerID]) {
      // 如果玩家ID已存在
      socket.emit('checkPlayerIDResult', { success: false });
    } else {
      // 玩家ID可用
      players[playerID] = true;  // 將玩家ID加入已註冊的列表
      socket.emit('checkPlayerIDResult', { success: true, playerID });
    }
  });

  // 當玩家創建新房間時
  socket.on('createRoom', (roomData) => {
    const { roomId, playerId } = roomData;
    rooms[roomId] = { players: [playerId] }; // 創建新房間並加入玩家
    players[playerId] = { socketId: socket.id, roomId, isSpectator: false };
    io.emit('updateRoomList', Object.keys(rooms)); // 廣播更新房間列表
  });

  // 當玩家加入房間時
  socket.on('joinRoom', (roomData) => {
    const { roomId, playerId } = roomData;
    if (rooms[roomId]) {
      rooms[roomId].players.push(playerId); // 加入玩家到房間
      players[playerId] = { socketId: socket.id, roomId, isSpectator: false };
      io.emit('updateRoomList', Object.keys(rooms)); // 廣播更新房間列表
      io.to(roomId).emit('playerJoined', { playerId }); // 廣播有玩家加入房間
    }
  });

  // 玩家發送消息（公共、私密或遊戲內）
  socket.on('sendMessage', (messageData) => {
    const { roomId, message, playerId, toPlayerId, type } = messageData;
    if (type === 'public') {
      io.emit('receiveMessage', { message, playerId }); // 公共對話框消息
    } else if (type === 'private') {
      const recipientSocket = players[toPlayerId]?.socketId;
      if (recipientSocket) {
        io.to(recipientSocket).emit('receiveMessage', { message, playerId }); // 私密對話框消息
      }
    } else if (type === 'inGame') {
      io.to(roomId).emit('receiveMessage', { message, playerId }); // 遊戲內對話框消息
    }
  });

  // 玩家退出房間
  socket.on('disconnect', () => {
    // 從玩家列表中移除
    for (let playerId in players) {
      if (players[playerId].socketId === socket.id) {
        const roomId = players[playerId].roomId;
        rooms[roomId].players = rooms[roomId].players.filter((id) => id !== playerId); // 移除玩家
        io.to(roomId).emit('playerLeft', { playerId }); // 廣播有玩家離開
        delete players[playerId];
        break;
      }
    }
  });
});
  
// 啟動服務器
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});