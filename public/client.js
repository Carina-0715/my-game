// 與伺服器建立連線
const socket = io();

// DOM 元素
const playerIdInput = document.getElementById("playerIdInput");
const setPlayerIdButton = document.getElementById("setPlayerIdButton");
const chatContainer = document.getElementById("chatContainer");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const createRoomButton = document.getElementById("createRoom");
const joinRoomButton = document.getElementById("joinRoom");
const spectateRoomButton = document.getElementById("spectateRoom");

// 玩家 ID 狀態
let playerId = null;

// 設定玩家 ID
setPlayerIdButton.addEventListener("click", () => {
  const id = playerIdInput.value.trim();
  if (id) {
    playerId = id; // 設定玩家 ID
    playerIdInput.disabled = true; // 禁用輸入框
    setPlayerIdButton.disabled = true; // 禁用按鈕
    alert(`玩家 ID 已設定為：${playerId}`);
  } else {
    alert("請輸入有效的玩家 ID！");
  }
});

// 發送消息
sendButton.addEventListener("click", () => {
  if (!playerId) {
    alert("請先設定玩家 ID！");
    return;
  }

  const message = messageInput.value.trim();
  if (message) {
    const fullMessage = `${playerId}: ${message}`; // 包含玩家 ID
    socket.emit("message", fullMessage); // 發送消息到伺服器
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


// 房間創建 DOM 元素
const createRoomModal = document.getElementById("createRoomModal");
const roomNameInput = document.getElementById("roomNameInput");
const allowSpectatorsCheckbox = document.getElementById("allowSpectators");
const inviteOnlyCheckbox = document.getElementById("inviteOnly");
const confirmCreateRoomButton = document.getElementById("confirmCreateRoom");
const cancelCreateRoomButton = document.getElementById("cancelCreateRoom");

// 房間資料
let currentRoom = null;

// 點擊「創建房間」按鈕，顯示彈出框
createRoomButton.addEventListener("click", () => {
  if (!playerId) {
    alert("請先設定玩家 ID！");
    return;
  }
  createRoomModal.style.display = "block";
});

// 取消創建房間
cancelCreateRoomButton.addEventListener("click", () => {
  createRoomModal.style.display = "none";
  roomNameInput.value = "";
  allowSpectatorsCheckbox.checked = false;
  inviteOnlyCheckbox.checked = false;
});

// 確認創建房間
confirmCreateRoomButton.addEventListener("click", () => {
  const roomName = roomNameInput.value.trim() || `房間-${Math.floor(Math.random() * 1000)}`;
  const allowSpectators = allowSpectatorsCheckbox.checked;
  const inviteOnly = inviteOnlyCheckbox.checked;

  // 發送房間創建請求到伺服器
  socket.emit("createRoom", { roomName, allowSpectators, inviteOnly, host: playerId });

  // 清空輸入框並隱藏彈窗
  createRoomModal.style.display = "none";
  roomNameInput.value = "";
  allowSpectatorsCheckbox.checked = false;
  inviteOnlyCheckbox.checked = false;
});

// 接收伺服器確認房間已創建
socket.on("roomCreated", (room) => {
  currentRoom = room; // 設定目前所在的房間
  alert(`房間「${room.name}」創建成功！`);
});
