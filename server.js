const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// 創建 Express 應用程式
const app = express();
const server = http.createServer(app); // 創建 HTTP 伺服器
const io = new Server(server); // 將 Socket.io 附加到伺服器

// 提供靜態文件 (前端)
app.use(express.static("public"));

// 當有用戶連線時
io.on("connection", (socket) => {
  console.log("用戶已連線");

  // 當用戶發送消息時
  socket.on("message", (data) => {
    console.log(`收到消息: ${data}`);
    // 廣播消息給所有用戶
    io.emit("message", data);
  });

  // 用戶斷線時
  socket.on("disconnect", () => {
    console.log("用戶已斷開連線");
  });
});

// 啟動伺服器
server.listen(3000, () => {
  console.log("伺服器運行於 http://localhost:3000");
});

const rooms = {}; // 儲存所有房間

// 監聽客戶端連線
io.on("connection", (socket) => {
  console.log("用戶連線：", socket.id);

  // 創建房間
  socket.on("createRoom", (roomData) => {
    const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;
    const newRoom = {
      id: roomId,
      name: roomData.roomName,
      host: roomData.host,
      allowSpectators: roomData.allowSpectators,
      inviteOnly: roomData.inviteOnly,
      members: [roomData.host], // 房主自動加入房間
    };

    rooms[roomId] = newRoom; // 儲存房間資訊
    socket.join(roomId); // 加入房間
    io.to(socket.id).emit("roomCreated", newRoom); // 回傳房間資訊給房主

    // 廣播新的房間訊息
    io.emit("roomListUpdate", Object.values(rooms));
  });

  // 玩家斷線
  socket.on("disconnect", () => {
    console.log("用戶斷線：", socket.id);
    // TODO: 處理玩家離開房間的邏輯
  });
});
// 廣播房間列表更新
function broadcastRoomList() {
  io.emit("roomListUpdate", Object.values(rooms)); // 傳送所有房間資料給所有連線的客戶端
}

// 在創建房間後廣播房間列表
socket.on("createRoom", (roomData) => {
  const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;
  const newRoom = {
    id: roomId,
    name: roomData.roomName,
    host: roomData.host,
    allowSpectators: roomData.allowSpectators,
    inviteOnly: roomData.inviteOnly,
    members: [roomData.host],
  };

  rooms[roomId] = newRoom;
  socket.join(roomId);
  io.to(socket.id).emit("roomCreated", newRoom);

  broadcastRoomList(); // 房間創建後立即廣播
});
