// 與伺服器建立連線
const socket = io();

// DOM 元素
const chatContainer = document.getElementById("chatContainer");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const createRoomButton = document.getElementById("createRoom");
const joinRoomButton = document.getElementById("joinRoom");
const spectateRoomButton = document.getElementById("spectateRoom");

// 發送消息
sendButton.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("message", message); // 發送消息到伺服器
    messageInput.value = ""; // 清空輸入框
  }
});

// 接收伺服器發送的消息
socket.on("message", (data) => {
  const messageElement = document.createElement("div");
  messageElement.textContent = data;
  chatMessages.appendChild(messageElement); // 添加消息到對話框內部

  // 自動滾動到底部
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

// 房間功能（範例）
createRoomButton.addEventListener("click", () => {
  alert("創建房間功能開發中...");
});

joinRoomButton.addEventListener("click", () => {
  alert("加入房間功能開發中...");
});

spectateRoomButton.addEventListener("click", () => {
  alert("觀戰功能開發中...");
});
