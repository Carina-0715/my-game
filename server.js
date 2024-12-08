const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// 創建 Express 應用程式
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {}; // 儲存房間的資料

// 廣播更新房間列表
function broadcastRoomList() {
  io.emit("roomListUpdate", Object.values(rooms));
}

// 當用戶連接到伺服器時
io.on("connection", (socket) => {
  console.log("用戶已連接:", socket.id);

  // 公共聊天功能
  socket.on("publicChat", ({ playerId, message }) => {
    const timestamp = new Date().toLocaleTimeString();
    io.emit("publicMessage", { sender: playerId, message, timestamp });
  });

socket.on("createRoom", ({ roomName, playerId, inviteOnly, spectatorsAllowed }, callback) => {
  const roomId = `room-${Math.random().toString(36).substr(2, 8)}`;
  const newRoom = {
    id: roomId,
    name: roomName || "未命名房間",
    host: playerId,
    inviteOnly: !!inviteOnly,
    spectatorsAllowed: !!spectatorsAllowed,
    members: [playerId],
  };

  rooms[roomId] = newRoom; // 將房間加入到全局房間列表
  socket.join(roomId); // 將創建者加入該房間
  console.log(`${playerId} 創建了房間: ${roomId}`);
  broadcastRoomList(); // 廣播最新的房間列表
  callback({ success: true, roomId });
});
  
  // 加入房間
  socket.on("joinRoom", ({ roomId, playerId }, callback) => {
    const room = rooms[roomId];
    if (!room) return callback({ success: false, message: "房間不存在" });

    if (room.inviteOnly && room.members.length >= 2) {
      return callback({ success: false, message: "該房間僅限邀請玩家加入" });
    }

    room.members.push(playerId); // 添加玩家到房間成員列表
    socket.join(roomId);
    console.log(`${playerId} 加入了房間: ${roomId}`);
    callback({ success: true });
    broadcastRoomList(); // 更新房間列表
  });

  // 觀戰房間
  socket.on("spectateRoom", ({ roomId }, callback) => {
    const room = rooms[roomId];
    if (!room) return callback({ success: false, message: "房間不存在" });

    if (!room.spectatorsAllowed) {
      return callback({ success: false, message: "該房間不允許觀戰" });
    }

    socket.join(roomId);
    console.log(`${socket.id} 開始觀戰房間: ${roomId}`);
    callback({ success: true });
  });

  // 用戶發送消息
  socket.on("message", (data) => {
    console.log(`收到消息: ${data}`);
    io.emit("message", data); // 廣播給所有連線用戶
  });

  // 用戶斷線
  socket.on("disconnect", () => {
    console.log("用戶已斷開:", socket.id);

    // 從所有房間中移除該用戶
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.members = room.members.filter((member) => member !== socket.id);

      // 如果房間空了，刪除房間
      if (room.members.length === 0) {
        delete rooms[roomId];
        console.log(`房間已刪除: ${roomId}`);
      }
    }

    broadcastRoomList(); // 更新房間列表
  });
});

// 提供靜態文件 (前端)
app.use(express.static("public"));

// 啟動伺服器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`伺服器運行中，訪問 http://localhost:${PORT}`);
});
