const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // 靜態文件夾（放置前端檔案）

// 存儲房間數據
let rooms = {};

io.on('connection', (socket) => {
  console.log('玩家已連線', socket.id);

  // 玩家創建房間
  socket.on('createRoom', ({ playerID, roomMode, allowSpectators }) => {
    const roomID = generateRoomID();
    rooms[roomID] = { 
      host: playerID, 
      mode: roomMode, 
      spectatorsAllowed: allowSpectators, 
      players: [playerID], 
      spectators: [] 
    };
    socket.join(roomID);
    io.to(socket.id).emit('roomCreated', { roomID, success: true });
    console.log(`房間 ${roomID} 已被玩家 ${playerID} 創建`);
  });

  // 玩家加入房間
  socket.on('joinRoom', ({ playerID, roomID }) => {
    if (rooms[roomID]) {
      rooms[roomID].players.push(playerID);
      socket.join(roomID);
      io.to(roomID).emit('playerJoined', { playerID });
      console.log(`玩家 ${playerID} 加入房間 ${roomID}`);
    } else {
      io.to(socket.id).emit('joinError', { message: '房間不存在！' });
    }
  });

  // 玩家離開
  socket.on('disconnect', () => {
    console.log('玩家已斷線', socket.id);
    // 處理玩家離線邏輯（如移除房間等）
  });
});

// 生成唯一房間ID
function generateRoomID() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

server.listen(3000, () => {
  console.log('伺服器運行於 http://localhost:3000');
});
