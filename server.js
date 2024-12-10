const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

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
// 當有玩家連線時
// 當有玩家連線時
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // 註冊玩家
  socket.on('registerPlayer', (playerID) => {
    players[playerID] = socket.id;  // 儲存玩家 ID 和 Socket ID
    console.log(`Player registered: ${playerID} with socket id ${socket.id}`);
  });

  // 當接收到玩家發送的訊息時
  socket.on('sendMessage', (data) => {
    const { type, playerID, message } = data;

    // 根據訊息的類型來處理訊息發送
    switch (type) {
      case 'public':
        // 發送給所有玩家（公開訊息）
        io.emit('receiveMessage', {
          type: 'public',
          sender: playerID,
          message: message
        });
        break;

      case 'private':
        // 發送給特定玩家（私密訊息）
        const targetSocketID = players[playerID];  // 查找對方玩家的 Socket ID
        if (targetSocketID) {
          io.to(targetSocketID).emit('receiveMessage', {
            type: 'private',
            sender: playerID,
            message: message
          });
        } else {
          console.log(`Player ${playerID} not found.`);
        }
        break;

      case 'game':
        // 發送給所有玩家（對戰訊息）
        io.emit('receiveMessage', {
          type: 'game',
          sender: playerID,
          message: message
        });
        break;

      case 'spectator':
        // 發送給觀戰玩家（觀戰訊息）
        io.emit('receiveMessage', {
          type: 'spectator',
          sender: playerID,
          message: message
        });
        break;

      default:
        console.log('Unknown message type:', type);
        break;
    }
  });

  // 當玩家斷線時
  socket.on('disconnect', () => {
    // 刪除已斷線的玩家
    for (let playerID in players) {
      if (players[playerID] === socket.id) {
        delete players[playerID];
        console.log(`Player disconnected: ${playerID}`);
        break;
      }
    }
  });
});
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
    const roomID = Math.random().toString(36).substring(2, 10); // 隨機生成房間ID
  const roomName = data.roomName; // 使用前端傳來的房間名稱
      // 儲存房間資訊
  rooms[roomID] = {
    id: roomID,
    name: roomName, // 使用者指定的名稱
    mode: data.roomMode,
    spectatorsAllowed: data.spectatorSetting === 'allow',
    players: [],
  };

     // 回傳給創建者
  socket.emit('roomCreated', {
    success: true,
    roomID,            // 隨機生成的房間ID
    roomName,          // 使用者指定的房間名稱
    roomMode: data.roomMode,
    spectatorSetting: data.spectatorSetting,
  });
});
  socket.on("createRoom", (data) => {
  const { roomID, playerId } = data;
  if (!rooms[roomID]) {
    rooms[roomID] = { players: [playerId], messages: [] };
    socket.join(roomID);
    io.emit("updateRoomList", rooms); // 廣播房間列表
    broadcastRoomState(roomID); // 同步房間狀態
  }
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
socket.on("joinRoom", (data) => {
  const { roomID, playerID } = data;
  if (rooms[roomID] && !rooms[roomID].players.includes(playerID)) {
    rooms[roomID].players.push(playerID);
    socket.join(roomID);
    broadcastRoomState(roomID); // 同步房間狀態
  }
});
  socket.on('disconnect', () => {
    console.log('玩家已斷開連接');
  });
});

  
server.listen(PORT, () => {
  console.log(`伺服器已啟動，監聽埠口 ${PORT}`);
});