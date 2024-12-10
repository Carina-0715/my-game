import { io } from 'socket.io-client';
const socket = io();  // 用來連接到後端的 socket.io 服務器

// 儲存房間資料
const rooms = [];

// 顯示創建房間界面
document.getElementById('createRoom').addEventListener('click', () => {
  // 顯示創建房間設置表單
  document.getElementById('create-room-screen').style.display = 'block';
  // 隱藏原本的創建房間按鈕
  document.getElementById('createRoom').style.display = 'none';
});

// 創建房間
document.getElementById('create-room-btn').addEventListener('click', () => {
  const roomID = prompt('輸入房間ID:');
  const roomMode = document.getElementById('room-mode').value;  // 獲取選擇的房間模式
  const spectatorSetting = document.getElementById('spectator-setting').value;  // 獲取選擇的觀戰功能 
  if (roomID) {
    // 發送創建房間請求到伺服器
    socket.emit('createRoom', { playerID, roomID, roomMode, spectatorSetting });
  }
});




// 接收房間創建回應
socket.on('roomCreated', (data) => {
  if (data.success) {
    alert(`房間創建成功！房間ID: ${data.roomID}`);

    // 更新房間列表
    const newRoom = {
      id: data.roomID,
      name: `房間 ${data.roomID}`,
      status: 'available', // 設為空閒
      mode: data.roomMode,  // 取得房間模式
      spectatorSetting: data.spectatorSetting  // 取得觀戰設置
    };
    rooms.push(newRoom);  // 把新創建的房間添加到房間數組中
    renderRooms(); // 重新渲染房間列表

    // 隱藏創建房間設置表單，並顯示創建房間按鈕
    document.getElementById('create-room-screen').style.display = 'none';
    document.getElementById('createRoom').style.display = 'block';
  }
});
console.log('Before rendering rooms:', rooms);
renderRooms(rooms);
console.log('After rendering rooms:', rooms);

// 渲染房間列表
const roomListElement = document.getElementById('roomList');
let previousRooms = [];

function renderRooms(rooms) {
  const roomListContainer = document.getElementById('room-list');

  console.log('Before rendering rooms:', rooms);

  // 如果房間資料為空，顯示 "No rooms available"
  if (!rooms || rooms.length === 0) {
    console.log('No rooms available');
    roomListContainer.innerHTML = '<p>No rooms available</p>';
    return;
  }

  // 比較當前資料和上一輪渲染的資料
  if (JSON.stringify(rooms) === JSON.stringify(previousRooms)) {
    console.log('Rooms data has not changed, skipping render.');
    return;  // 如果資料未改變，就跳過渲染
  }

  // 清空房間列表
  roomListContainer.innerHTML = '';

  rooms.forEach(room => {
    const roomElement = document.createElement('div');
    roomElement.classList.add('room');
    roomElement.innerHTML = `
      <div class="room-name">${room.name}</div>
      <div class="room-status">${room.status}</div>
      <div class="room-mode">${room.mode}</div>
      <div class="spectator">${room.spectatorSetting ? 'Spectators allowed' : 'No spectators'}</div>
    `;
    roomListContainer.appendChild(roomElement);
  });

  // 更新上一輪的房間資料
  previousRooms = rooms;

  console.log('After rendering rooms:', rooms);
}


// 假設資料來自某個函數
function fetchRooms() {
  socket.emit('getRooms');
}

socket.on('roomsData', (data) => {
  console.log('Received rooms data:', data);  // 確認資料是否正確接收
  renderRooms(data);  // 資料更新後才調用渲染函數
});

socket.on('roomsList', (rooms) => {
   console.log('Received rooms data:', rooms);  // 打印從伺服器接收到的房間資料
  if (Array.isArray(rooms) && rooms.length > 0) {
    renderRooms(rooms);
  } else {
    console.log('No rooms available');
  }
});

console.log('Before rendering rooms:', rooms);
renderRooms(rooms);
console.log('After rendering rooms:', rooms);

// 儲存玩家ID
let playerID = '';

// 確認玩家ID
document.getElementById('confirmPlayerID').addEventListener('click', () => {
  playerID = document.getElementById('playerID').value;
  if (playerID) {
    // 發送玩家ID到伺服器，進行唯一性檢查
    socket.emit('checkPlayerID', playerID);
  } else {
    alert('請輸入玩家ID');
  }
});

// 接收伺服器檢查結果
socket.on('checkPlayerIDResult', (data) => {
  if (data.success) {
    document.getElementById('player-id').textContent = playerID;
    document.getElementById('createRoom').disabled = false;
    document.getElementById('joinRoom').disabled = false;
    alert(`歡迎，玩家 ${data.playerID}！`);
  } else {
    alert('玩家ID已存在，請重新輸入！');
  }
});


// 加入房間
document.getElementById('joinRoom').addEventListener('click', () => {
  const roomID = prompt('輸入房間ID:');
  if (roomID) {
    socket.emit('joinRoom', { playerID, roomID });
  }
});



// 玩家加入房間回應
socket.on('playerJoined', (data) => {
  alert(`玩家 ${data.playerID} 加入了房間`);
  // 進入遊戲畫面
  startGame(data.roomID);
});

// 開始遊戲
function startGame(roomID) {
  document.getElementById('lobby').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('player-hand').style.display = 'block';
  document.getElementById('move-direction').style.display = 'block';

  generateMultiplicationTable();
  socket.emit('startGame', { roomID });
}

// 隨機圖示列表
const icons = ['🐶', '🐱', '🦊', '🐯', '🦁', '🐺', '🐭', '🐹', '🐰', '🐻‍❄️', '🐨', '🐔', '🐧', '🦉', '🐸', '🐳', '🦀', '🦞', '🦈', '🐙', '🦭', '🐣', '🪼', '🦖', '🐲', '🦕', '🐞', '🐜', '🐝', '🦗', '☃️', '🌞', '🌟', '🌩️', '🌈', '🍓', '🍉', '🍎', '🍊', '🍒', '🥝', '🍍', '🍌', '🍇', '🌶️'];

let playerIcon = getRandomIcon(); // 默認隨機圖示

function selectIcon(icon) {
  playerIcon = icon; // 更新玩家選擇的圖示
  console.log(`選擇的圖示: ${icon}`);
}
// 隨機選擇圖示
function getRandomIcon() {
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

// 生成九九乘法表格並隨機放置玩家與對手
function generateMultiplicationTable() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = ''; // 清空之前的內容

  const seenNumbers = new Set(); // 用來儲存已經顯示過的數字

  // 創建 9x9 乘法表格
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      const num = i * j; // 計算乘法表的數字

      // 如果這個數字已經出現過，則跳過
      if (!seenNumbers.has(num)) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = num; // 顯示乘法表的數字
        gameBoard.appendChild(cell);
        seenNumbers.add(num); // 將這個數字加入已顯示數字的集合
      }
    }
  }

  // 隨機選擇兩個格子來放置玩家和對手
  placePlayersOnBoard();
}

// 隨機放置玩家與對手
function placePlayersOnBoard() {
  const cells = document.querySelectorAll('.cell');
  const randomPlayerIndex = Math.floor(Math.random() * cells.length);
  let randomOpponentIndex = Math.floor(Math.random() * cells.length);

  // 確保玩家和對手不會出現在同一格
  while (randomOpponentIndex === randomPlayerIndex) {
    randomOpponentIndex = Math.floor(Math.random() * cells.length);
  }

  // 取得玩家與對手的圖示
  const playerIcon = getRandomIcon();
  const opponentIcon = getRandomIcon();

  // 設定玩家與對手圖示
  const playerCell = cells[randomPlayerIndex];
  const opponentCell = cells[randomOpponentIndex];

  playerCell.classList.add('player');
  playerCell.innerHTML = playerIcon; // 顯示玩家圖示

  opponentCell.classList.add('opponent');
  opponentCell.innerHTML = opponentIcon; // 顯示對手圖示
}

// 初始化遊戲
function initGame() {
  generateMultiplicationTable();
}

// 呼叫初始化遊戲
initGame();
// 顯示手牌
function displayHand(cards) {
  const handCardsDiv = document.getElementById('hand-cards');
  handCardsDiv.innerHTML = '';  // 清空現有手牌
  cards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.textContent = card;
    cardDiv.addEventListener('click', () => {
      cardDiv.classList.toggle('selected');
    });
    handCardsDiv.appendChild(cardDiv);
  });
}

// 接收並顯示玩家手牌
socket.on('handCards', (cards) => {
  displayHand(cards);
});

// 提交手牌
document.getElementById('submit-cards').addEventListener('click', () => {
  const selectedCards = [];
  document.querySelectorAll('#hand-cards .selected').forEach(cardDiv => {
    selectedCards.push(cardDiv.textContent);
  });
  socket.emit('submitCards', { playerID, selectedCards });
});

// 移動選項
document.querySelectorAll('#move-direction button').forEach(button => {
  button.addEventListener('click', () => {
    const direction = button.getAttribute('data-direction');
    socket.emit('move', { playerID, direction });
  });
});
// 設置初始遊戲狀態
let playerHand = [];
let playerStamina = 20;
let opponentStamina = 20;

// 定義一副牌（每張牌由花色和數字組成，這裡用Unicode字符來表示花色）
const suits = ['♥️', '♠️', '♦️', '♣️'];  // 花色使用Unicode字符
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// 隨機發牌函數
function dealCards() {
  playerHand = [];
  for (let i = 0; i < 3; i++) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    playerHand.push({ suit, value });
  }
  updateHandDisplay();
}

// 顯示手牌
function updateHandDisplay() {
  const handCardsContainer = document.getElementById('hand-cards');
  handCardsContainer.innerHTML = '';
  playerHand.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.classList.add(card.suit);

    // 更新卡片顯示內容
    cardDiv.innerHTML = `
      <div class="top-left">${card.value}</div>  <!-- 左上角顯示數字 -->
      <div class="center">${card.suit}</div>    <!-- 中間顯示符號 -->
    `;

    cardDiv.onclick = () => selectCard(index);
    handCardsContainer.appendChild(cardDiv);
  });
}


// 選擇卡牌
let selectedCards = [];
function selectCard(index) {
  const card = playerHand[index];
  const cardDiv = document.querySelectorAll('#hand-cards .card')[index];
  
  // 如果已經選擇過該卡牌則取消選擇
  if (selectedCards.includes(card)) {
    selectedCards = selectedCards.filter(c => c !== card);
    cardDiv.classList.remove('selected');
  } else {
    if (selectedCards.length < 2) {  // 只允許選擇兩張牌
      selectedCards.push(card);
      cardDiv.classList.add('selected');
    }
  }
}

// 出牌並補充新卡
function playCards() {
  if (selectedCards.length === 2) {
    // 扣除體力
    playerStamina -= 1;
    opponentStamina -= 1;

    // 清空選擇卡
    selectedCards = [];

    // 顯示新體力
    document.getElementById('player-stamina').innerText = playerStamina;
    document.getElementById('opponent-stamina').innerText = opponentStamina;

    // 補充兩張卡
    dealCards();
  } else {
    alert('請選擇兩張卡牌!');
  }
}

// 初始發牌
dealCards();

// 設置出牌按鈕
document.getElementById('submit-cards').addEventListener('click', playCards);
