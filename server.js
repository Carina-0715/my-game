const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { handleLobbySocket } = require('./src/lobby');
const { handleRoomSocket } = require('./src/room');
const { handleChatSocket } = require('./src/chat');
const { handleGameLogic } = require('./src/gameLogic');
const { createRoom, joinRoom, startGame, getRoomState } = require('./src/roomController');
const { registerPlayer, loginPlayer } = require('./src/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static('public')); // 靜態資源

// 監聽玩家連接
io.on('connection', (socket) => {
  // 玩家進入大廳的邏輯
  handleLobbySocket(io, socket);
  
  // 玩家進入房間的邏輯
  handleRoomSocket(io, socket);

  // 玩家進行聊天的邏輯
  handleChatSocket(io, socket);

  // 遊戲邏輯
  handleGameLogic(io, socket);

  // 註冊、登入玩家
  socket.on('registerPlayer', (playerID) => {
    registerPlayer(playerID);
  });

  socket.on('loginPlayer', (playerID) => {
    loginPlayer(playerID);
  });

  // 房間管理
  socket.on('createRoom', (roomID, settings) => {
    createRoom(roomID, settings);
  });

  socket.on('joinRoom', (roomID, playerID) => {
    joinRoom(roomID, playerID);
  });

  socket.on('startGame', (roomID) => {
    startGame(roomID);
  });

  // 房間狀態查詢
  socket.on('getRoomState', (roomID) => {
    const roomState = getRoomState(roomID);
    socket.emit('roomState', roomState);
  });
});

server.listen(PORT, () => {
  console.log(`伺服器已啟動，監聽埠口 ${PORT}`);
});
