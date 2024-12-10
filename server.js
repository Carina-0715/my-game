const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};  // 儲存房間資料
let players = {};  // 儲存已註冊的玩家ID

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

  // 創建房間
  socket.on('createRoom', (data) => {
    const roomID = Math.random().toString(36).substr(2, 6);  // 隨機生成房間ID
    rooms[roomID] = { players: [data.playerID], allowSpectators: data.allowSpectators, roomMode: data.roomMode };
    socket.emit('roomCreated', { success: true, roomID });
    io.emit('roomListUpdated', rooms);  // 更新房間列表給所有玩家
  });

  // 玩家加入房間
  socket.on('joinRoom', (data) => {
    const { playerID, roomID } = data;
    if (rooms[roomID]) {
      rooms[roomID].players.push(playerID);
      socket.emit('playerJoined', { playerID, roomID });
      io.emit('roomListUpdated', rooms);  // 更新房間列表
    } else {
      socket.emit('error', { message: '房間不存在' });
    }
  });

  socket.on('disconnect', () => {
    console.log('玩家已斷開連接');
  });
});

// 伺服器監聽 3000 埠
server.listen(3000, () => {
  console.log('伺服器正在執行中，埠號為 3000');
});
