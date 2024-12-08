const socket = io();
let playerId = null;

// 聊天相關 DOM 元素
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// 提示輸入玩家ID
function promptForPlayerId() {
  while (!playerId) {
    playerId = prompt("請輸入你的玩家ID：");
    if (!playerId) alert("玩家ID 是必要的！");
  }
}
  
// 發送聊天消息
sendButton.addEventListener("click", () => {
  if (!playerId) {
    promptForPlayerId(); // 確保玩家ID已經設置
  }

  const message = messageInput.value.trim();
  if (message) {
    socket.emit("publicChat", { playerId, message });
    messageInput.value = "";
  }
});


// 接收伺服器廣播的消息
socket.on("publicMessage", (message) => {
  const messageElement = document.createElement("div");
  messageElement.textContent = `${message.sender}: ${message.message} [${message.timestamp}]`; // 顯示發送者ID
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// 創建房間
document.getElementById("createRoom").addEventListener("click", () => {
  if (!playerId) {
    promptForPlayerId(); // 確保玩家ID已經設置
  }

  const inviteOnly = confirm("是否啟用邀請模式？");
  const spectatorsAllowed = confirm("是否允許觀戰？");

  socket.emit("createRoom", { playerId, inviteOnly, spectatorsAllowed }, (response) => {
    if (response && response.success) {
      alert(`房間創建成功！房間ID: ${response.roomId}`);
    } else {
      alert(response && response.message ? response.message : "創建房間失敗");
    }
  });
});

// 加入房間
document.getElementById("joinRoom").addEventListener("click", () => {
  if (!playerId) {
    promptForPlayerId(); // 確保玩家ID已經設置
  }

  const roomId = prompt("輸入房間ID:");

  socket.emit("joinRoom", { roomId, playerId }, (response) => {
    if (response && response.success) {
      alert("成功加入房間！");
    } else {
      alert(response && response.message ? response.message : "加入房間失敗");
    }
  });
});

// 觀戰房間
document.getElementById("spectateRoom").addEventListener("click", () => {
  if (!playerId) {
    promptForPlayerId(); // 確保玩家ID已經設置
  }

  const roomId = prompt("輸入房間ID:");

  socket.emit("spectateRoom", { roomId }, (response) => {
    if (response && response.success) {
      alert("成功加入觀戰！");
    } else {
      alert(response && response.message ? response.message : "觀戰失敗");
    }
  });
});