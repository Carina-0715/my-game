// chat.js
function handleChatSocket(io, socket) {
  console.log(`玩家進入聊天：${socket.id}`);

  // 公共聊天室
  socket.on('sendPublicMessage', (data) => {
    const { playerID, message } = data;
    io.emit('receivePublicMessage', { sender: playerID, message });
  });

  // 房間內聊天
  socket.on('sendInGameMessage', (data) => {
    const { roomID, playerID, message } = data;
    io.to(roomID).emit('receiveInGameMessage', { sender: playerID, message });
  });

  // 觀察者聊天
  socket.on('sendSpectatorMessage', (data) => {
    const { roomID, playerID, message } = data;
    io.to(roomID).emit('receiveSpectatorMessage', { sender: playerID, message });
  });

  // 玩家斷開連接時，清除聊天室資料
  socket.on('disconnect', () => {
    console.log(`玩家已斷開連接：${socket.id}`);
  });
}

module.exports = { handleChatSocket };
// chat.js - 處理聊天室邏輯
let publicChats = [];
let privateChats = {};  // 存儲玩家間的私密聊天
let spectatorChats = {}; // 存儲觀戰者的聊天

function sendPublicMessage(playerID, message) {
  publicChats.push({ playerID, message });
  // 發送公共訊息給所有玩家
  io.emit('publicMessage', { playerID, message });
}

function sendPrivateMessage(fromPlayerID, toPlayerID, message) {
  if (!privateChats[fromPlayerID]) privateChats[fromPlayerID] = {};
  if (!privateChats[toPlayerID]) privateChats[toPlayerID] = {};

  privateChats[fromPlayerID][toPlayerID] = message;
  privateChats[toPlayerID][fromPlayerID] = message;

  // 發送私密訊息
  io.emit('privateMessage', { fromPlayerID, toPlayerID, message });
}

function sendSpectatorMessage(spectatorID, message) {
  spectatorChats[spectatorID] = message;
  // 發送觀戰者訊息
  io.emit('spectatorMessage', { spectatorID, message });
}

module.exports = { sendPublicMessage, sendPrivateMessage, sendSpectatorMessage };
