const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};  // 儲存房間資料

app.use(express.static('public'));  // 提供靜態資源

io.on('connection', (socket) => {
  console.log('玩家已連接：' + socket.id);
const playerIDs = new Set(); // 儲存已註冊的玩家ID

// 檢查玩家ID唯一性
socket.on('checkPlayerID', (playerID) => {
  if (playerIDs.has(playerID)) {
    socket.emit('playerIDChecked', { success: false });
  } else {
    playerIDs.add(playerID);
    socket.emit('playerIDChecked', { success: true, playerID });
  }
});
  // 創建房間
  socket.on('createRoom', (data) => {
    const roomID = Math.random().toString(36).substr(2, 6);  // 隨機生成房間ID
    rooms[roomID] = { players: [data.playerID], allowSpectators: data.allowSpectators, roomMode: data.roomMode };
    socket.emit('roomCreated', { success: true, roomID });
    io.emit('roomListUpdated', rooms);  // 更新房間列表
  });

  // 玩家加入房間
  socket.on('joinRoom', (data) => {
    const { playerID, roomID } = data;
    if (rooms[roomID]) {
      rooms[roomID].players.push(playerID);
      const opponentID = rooms[roomID].players.find(id => id !== playerID);
      socket.emit('playerJoined', { playerID, opponentID });
      io.emit('roomListUpdated', rooms);
    } else {
      socket.emit('error', { message: '房間不存在' });
    }
  });

  socket.on('disconnect', () => {
    console.log('玩家已離開：' + socket.id);
  });
});

server.listen(3000, () => {
  console.log('伺服器正在運行，監聽端口 3000');
});
