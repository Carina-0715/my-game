const socket = io();
// DOM 元素
const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// 發送消息到伺服器
sendButton.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("message", message); // 發送消息
    messageInput.value = ""; // 清空輸入框
  }
});

// 接收伺服器廣播的消息
socket.on("message", (data) => {
  const messageElement = document.createElement("div");
  messageElement.textContent = data;
  chat.appendChild(messageElement); // 將消息顯示在聊天框
  chat.scrollTop = chat.scrollHeight; // 滾動到最新消息
});

// 創建房間
document.getElementById("createRoom").addEventListener("click", () => {
  const playerId = prompt("輸入你的玩家ID:");
  const inviteOnly = confirm("是否啟用邀請模式？");
  const spectatorsAllowed = confirm("是否允許觀戰？");

  socket.emit("createRoom", { playerId, inviteOnly, spectatorsAllowed }, (response) => {
    if (response.success) {
      alert(`房間創建成功！房間ID: ${response.roomId}`);
    } else {
      alert("創建房間失敗");
    }
  });
});

// 加入房間
document.getElementById("joinRoom").addEventListener("click", () => {
  const roomId = prompt("輸入房間ID:");
  const playerId = prompt("輸入你的玩家ID:");

  socket.emit("joinRoom", { roomId, playerId }, (response) => {
    if (response.success) {
      alert("成功加入房間！");
    } else {
      alert(response.message);
    }
  });
});

// 觀戰房間
document.getElementById("spectateRoom").addEventListener("click", () => {
  const roomId = prompt("輸入房間ID:");

  socket.emit("spectateRoom", { roomId }, (response) => {
    if (response.success) {
      alert("成功加入觀戰！");
    } else {
      alert(response.message);
    }
  });
});

// 公頻聊天
document.getElementById("sendMessage").addEventListener("click", () => {
  const message = document.getElementById("chatInput").value;
  socket.emit("publicChat", message);
  document.getElementById("chatInput").value = "";
});

socket.on("publicMessage", (message) => {
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML += `<div>${message}</div>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
