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
const spectators = {}; // 紀錄每個房間的觀戰者列表

// 當觀戰者加入房間
socket.on('joinSpectator', ({ roomId }) => {
  if (!spectators[roomId]) spectators[roomId] = [];
  spectators[roomId].push(socket.id);

  socket.join(roomId);
  socket.emit('spectatorJoined', { roomId });
});

// 當玩家移動，通知觀戰者
socket.on('playerMoved', ({ roomId, gameState }) => {
  // gameState 包含玩家位置、體力與數字表狀態
  io.to(roomId).emit('updateSpectators', { gameState });
});
// 公頻聊天
socket.on('publicChat', ({ message }) => {
  io.emit('updatePublicChat', { message, sender: socket.id });
});

// 房間內聊天 (私聊或觀戰)
socket.on('roomChat', ({ roomId, message }) => {
  io.to(roomId).emit('updateRoomChat', { message, sender: socket.id });
});
// 公頻聊天顯示
socket.on('updatePublicChat', ({ message, sender }) => {
  const chatBox = document.getElementById('public-chat');
  chatBox.innerHTML += `<p><b>${sender}:</b> ${message}</p>`;
});

// 房間內聊天顯示
socket.on('updateRoomChat', ({ message, sender }) => {
  const chatBox = document.getElementById('room-chat');
  chatBox.innerHTML += `<p><b>${sender}:</b> ${message}</p>`;
});
// 玩家移動時只同步必要數據
socket.on('playerMove', ({ roomId, playerId, newPosition }) => {
  // 更新遊戲狀態
  if (rooms[roomId]) {
    rooms[roomId].players[playerId].position = newPosition;

    // 廣播數據變化
    socket.to(roomId).emit('updateGameState', {
      playerId,
      newPosition,
      stamina: rooms[roomId].players[playerId].stamina,
    });
  }
});

// 確認事件是否成功傳遞
socket.on('eventAck', ({ eventId }) => {
  console.log(`事件 ${eventId} 已確認`);
});
// 玩家移動更新
socket.on('updateGameState', ({ playerId, newPosition, stamina }) => {
  const playerElement = document.querySelector(`#player-${playerId}`);
  movePlayerTo(playerElement, newPosition); // 更新玩家位置
  updateStamina(playerId, stamina); // 更新體力
});

// 發送事件並確認回傳
function sendPlayerMove(roomId, playerId, newPosition) {
  socket.emit('playerMove', { roomId, playerId, newPosition }, (response) => {
    console.log('伺服器已接收玩家移動事件');
  });
}
