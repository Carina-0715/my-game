// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // 提供靜態文件

io.on("connection", (socket) => {
  console.log("用戶已連線");

  // 處理從客戶端接收的消息
  socket.on("message", (data) => {
    console.log(`收到消息: ${data}`);
    // 廣播消息到所有連線的用戶
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("用戶已斷開連線");
  });
});

server.listen(3000, () => {
  console.log("伺服器運行於 http://localhost:3000");
});




const crypto = require("crypto");
const PORT = process.env.PORT || 3000;

// 儲存遊戲房間資料
const rooms = {};

// 提供靜態文件
app.use(express.static("public"));

// 建立 WebSocket 通訊
io.on("connection", (socket) => {
  console.log("玩家已連線:", socket.id);

  // 玩家創建房間
  socket.on("createRoom", ({ playerId, inviteOnly, spectatorsAllowed }, callback) => {
    const roomId = crypto.randomBytes(4).toString("hex");
    rooms[roomId] = {
      players: [{ id: playerId, socketId: socket.id }],
      inviteOnly,
      spectatorsAllowed,
      spectators: [],
    };

    socket.join(roomId);
    console.log(`房間 ${roomId} 已創建`);
    callback({ success: true, roomId });
  });

  // 玩家加入房間
  socket.on("joinRoom", ({ roomId, playerId }, callback) => {
    const room = rooms[roomId];
    if (!room) return callback({ success: false, message: "房間不存在" });

    // 驗證邀請模式
    if (room.inviteOnly && room.players.length >= 2) {
      return callback({ success: false, message: "房間為邀請模式，無法加入" });
    }

    room.players.push({ id: playerId, socketId: socket.id });
    socket.join(roomId);
    console.log(`玩家 ${playerId} 加入房間 ${roomId}`);
    callback({ success: true });
  });

  // 觀戰功能
  socket.on("spectateRoom", ({ roomId }, callback) => {
    const room = rooms[roomId];
    if (!room || !room.spectatorsAllowed) {
      return callback({ success: false, message: "無法觀戰此房間" });
    }

    room.spectators.push(socket.id);
    socket.join(roomId);
    console.log(`觀戰者加入房間 ${roomId}`);
    callback({ success: true });
  });

  // 公頻聊天
  socket.on("publicChat", (message) => {
    io.emit("publicMessage", message);
  });

  // 玩家離線
  socket.on("disconnect", () => {
    console.log("玩家已斷線:", socket.id);

    // 從所有房間中移除玩家或觀戰者
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter((p) => p.socketId !== socket.id);
      room.spectators = room.spectators.filter((sid) => sid !== socket.id);

      // 如果房間內無人，則刪除房間
      if (room.players.length === 0 && room.spectators.length === 0) {
        delete rooms[roomId];
        console.log(`房間 ${roomId} 已刪除`);
      }
    }
  });
});

// 啟動伺服器
server.listen(PORT, () => {
  console.log(`伺服器已在 http://localhost:${PORT} 運行`);
});
