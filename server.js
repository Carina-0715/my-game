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
