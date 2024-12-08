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


const rooms = {}; // 儲存房間資料

// 當用戶連接時
io.on("connection", (socket) => {
  console.log("有新用戶連接：", socket.id);

  // 用戶創建房間
  socket.on("createRoom", (roomData) => {
    const roomId = `room-${Math.random().toString(36).substr(2, 6)}`; // 唯一房間ID
    const newRoom = {
      id: roomId,
      name: roomData.roomName || "未命名房間",
      host: roomData.host || socket.id,
      allowSpectators: roomData.allowSpectators || true,
      inviteOnly: roomData.inviteOnly || false,
      members: [socket.id], // 成員列表，加入創建者
    };

    rooms[roomId] = newRoom; // 儲存房間資料
    socket.join(roomId); // 加入房間
    console.log(`房間已創建：${roomId}`, newRoom);

    // 回應創建者並廣播更新房間列表
    socket.emit("roomCreated", newRoom);
    broadcastRoomList();
  });

  // 用戶加入房間
  socket.on("joinRoom", ({ roomId, playerId }) => {
    const room = rooms[roomId];
    if (room) {
      room.members.push(playerId);
      socket.join(roomId);
      console.log(`${playerId} 加入房間：${roomId}`);
      socket.emit("roomJoined", room);
      broadcastRoomList();
    } else {
      socket.emit("error", { message: "房間不存在！" });
    }
  });

  // 廣播房間列表更新
  function broadcastRoomList() {
    io.emit("roomListUpdate", Object.values(rooms)); // 傳送房間列表
  }

  // 用戶斷開連接
  socket.on("disconnect", () => {
    console.log("用戶斷開連接：", socket.id);

    // 從房間中移除該用戶
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.members = room.members.filter((member) => member !== socket.id);
      if (room.members.length === 0) {
        delete rooms[roomId]; // 如果房間空了，刪除
      }
    }

    broadcastRoomList(); // 更新房間列表
  });
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`伺服器運行中，訪問 http://localhost:${PORT}`);
});
