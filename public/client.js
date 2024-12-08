const socket = io();
let playerId = null;

// 頁面加載時輸入玩家ID
window.onload = () => {
  while (!playerId) {
    playerId = prompt("請輸入你的玩家ID：");
    if (!playerId) alert("玩家ID 是必要的！");
  }
};

// 聊天相關 DOM 元素
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// 發送聊天消息
function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return alert("請輸入有效的消息！");
  socket.emit("publicChat", { playerId, message });
  messageInput.value = "";
}

// 接收伺服器廣播的消息
socket.on("publicMessage", ({ sender, message, timestamp }) => {
  const messageElement = document.createElement("div");
  messageElement.textContent = `[${timestamp}] ${sender}: ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// 創建房間
function createRoom() {
  const inviteOnly = confirm("是否啟用邀請模式？");
  const spectatorsAllowed = confirm("是否允許觀戰？");

  socket.emit("createRoom", { playerId, inviteOnly, spectatorsAllowed }, (response) => {
    if (response?.success) {
      alert(`房間創建成功！房間ID: ${response.roomId}`);
    } else {
      alert(response?.message || "創建房間失敗，請稍後重試。");
    }
  });
}

// 加入房間
function joinRoom() {
  const roomId = prompt("輸入房間ID：");
  if (!roomId) return alert("房間ID 是必要的！");

  socket.emit("joinRoom", { roomId, playerId }, (response) => {
    if (response?.success) {
      alert("成功加入房間！");
    } else {
      alert(response?.message || "加入房間失敗，請稍後重試。");
    }
  });
}

// 觀戰房間
function spectateRoom() {
  const roomId = prompt("輸入房間ID：");
  if (!roomId) return alert("房間ID 是必要的！");

  socket.emit("spectateRoom", { roomId }, (response) => {
    if (response?.success) {
      alert("成功加入觀戰！");
    } else {
      alert(response?.message || "觀戰失敗，請稍後重試。");
    }
  });
}

// 按鈕事件綁定
document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("createRoom").addEventListener("click", createRoom);
document.getElementById("joinRoom").addEventListener("click", joinRoom);
document.getElementById("spectateRoom").addEventListener("click", spectateRoom);
