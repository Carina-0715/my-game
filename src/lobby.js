// lobby.js
const { Server } = require('socket.io');

const players = {};
const rooms = {};

function handleLobbySocket(io, socket) {
  console.log(`玩家已連接：${socket.id}`);

  // 玩家註冊
  socket.on('registerPlayer', (playerID) => {
    players[socket.id] = playerID;
    console.log(`玩家已註冊：${playerID}`);
  });

  // 創建房間
  socket.on('createRoom', (data) => {
    const roomID = Math.random().toString(36).substring(2, 10); // 隨機生成房間ID
    rooms[roomID] = {
      id: roomID,
      name: data.roomName,
      players: [],
    };
    socket.emit('roomCreated', { roomID, roomName: data.roomName });
    io.emit('updateRoomList', rooms); // 廣播房間列表更新
  });

  // 玩家加入房間
  socket.on('joinRoom', (data) => {
    const { roomID, playerID } = data;
    if (rooms[roomID]) {
      rooms[roomID].players.push(playerID);
      socket.join(roomID);
      io.emit('updateRoomList', rooms);  // 更新房間列表
      io.to(roomID).emit('playerJoined', { playerID }); // 更新房間內玩家狀態
    } else {
      socket.emit('error', { message: '房間不存在' });
    }
  });

  // 玩家斷開連接時，清除玩家資料
  socket.on('disconnect', () => {
    console.log(`玩家已斷開連接：${socket.id}`);
    delete players[socket.id];
  });
}

module.exports = { handleLobbySocket };
