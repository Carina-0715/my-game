const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};  // 儲存已註冊的玩家ID
const chatInput = document.getElementById("chat-input");
const chatSendButton = document.getElementById("chat-send");

// 綁定按鈕的點擊事件
chatSendButton.addEventListener("click", () => {
  const message = chatInput.value.trim();
  if (message) {
    socket.emit("sendMessage", { roomID: currentRoomId, message });
    chatInput.value = ""; // 清空輸入框
  }
});
socket.on("sendMessage", (data) => {
  const { roomId, message } = data;
  if (rooms[roomId]) {
    // 保存訊息
    rooms[roomId].messages.push({ playerId: socket.id, message });

    // 廣播給房間內所有玩家
    io.to(roomId).emit("receiveMessage", { playerId: socket.id, message });
  }
});

// 支援按下 Enter 發送訊息
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    chatSendButton.click();
  }
});


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

  // 創建房間
  socket.on('createRoom', (data) => {
    const roomID = Math.random().toString(36).substr(2, 6);  // 隨機生成房間ID
    rooms[roomID] = { players: [data.playerID], allowSpectators: data.allowSpectators, roomMode: data.roomMode };
    socket.emit('roomCreated', { success: true, roomID });
    io.emit('roomListUpdated', rooms);  // 更新房間列表給所有玩家
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

  
// 伺服器監聽 3000 埠
server.listen(3000, () => {
  console.log('伺服器正在執行中，埠號為 3000');
});
