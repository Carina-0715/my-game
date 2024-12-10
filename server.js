const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};  // 儲存已註冊的玩家ID
const rooms = [
  { id: 'zz845d', name: '房間 zz845d', status: 'available', mode: 'someMode', spectatorSetting: true },
  { id: 'fvza05', name: '房間 fvza05', status: 'available', mode: 'someMode', spectatorSetting: false }
];

// 打印房間資料以檢查
console.log('Rooms to be sent:', rooms);



// 伺服器靜態資源路徑設定
app.use(express.static('public'));

// 廣播房間狀態
function broadcastRoomState(roomId) {
  if (rooms[roomId]) {
    io.to(roomId).emit("updateRoomState", {
      players: rooms[roomId].players,
      messages: rooms[roomId].messages,
    });
  }
}

// 監聽玩家連接
io.on('connection', (socket) => {
  console.log('玩家已連接：' + socket.id);

  // 玩家ID唯一性檢查
  socket.on('checkPlayerID', (playerID) => {
    if (players[playerID]) {
      socket.emit('checkPlayerIDResult', { success: false });
    } else {
      players[playerID] = true;  // 註冊玩家
      socket.emit('checkPlayerIDResult', { success: true, playerID });
    }
  });

  // 創建房間
  socket.on('createRoom', (data) => {
    const roomID = Math.random().toString(36).substr(2, 6);  // 隨機生成房間ID
    rooms[roomID] = { 
      players: [data.playerID], 
      allowSpectators: data.allowSpectators, 
      roomMode: data.roomMode,
      messages: [] 
    };
    socket.emit('roomCreated', { success: true, roomID });
    io.emit('roomListUpdated', rooms);  // 更新房間列表給所有玩家
    socket.join(roomID);  // 玩家加入房間
    broadcastRoomState(roomID); // 廣播房間狀態
  });
  // 發送房間資料
socket.emit('roomsList', rooms);

  // 玩家加入房間
  socket.on('joinRoom', (data) => {
    const { playerID, roomID } = data;
    if (rooms[roomID] && !rooms[roomID].players.includes(playerID)) {
      rooms[roomID].players.push(playerID);
      socket.join(roomID);
      socket.emit('playerJoined', { playerID, roomID });
      io.emit('roomListUpdated', rooms);  // 更新房間列表
      broadcastRoomState(roomID); // 廣播房間狀態
    } else {
      socket.emit('error', { message: '房間不存在或已滿' });
    }
  });

  // 開始遊戲
  socket.on('startGame', (data) => {
    const { roomID } = data;
    // 遊戲邏輯可以在這裡進行
    io.to(roomID).emit('gameStarted', { roomID });
  });

  // 玩家斷開連接
  socket.on('disconnect', () => {
    console.log('玩家已斷開連接');
  });
});

// 伺服器監聽 3000 埠
server.listen(3000, () => {
  console.log('伺服器正在執行中，埠號為 3000');
});
