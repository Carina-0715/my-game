const socket = io(); // 與伺服器建立連線

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
