// 連接 Socket.io 伺服器
const socket = io();

// 儲存玩家ID
let playerID = '';

// 確認玩家ID
document.getElementById('confirmPlayerID').addEventListener('click', () => {
  playerID = document.getElementById('playerID').value;
  if (playerID) {
    socket.emit('confirmPlayerID', { playerID });
    document.getElementById('player-id').textContent = playerID;
    document.getElementById('createRoom').disabled = false;
    document.getElementById('joinRoom').disabled = false;
  } else {
    alert('請輸入玩家ID');
  }
});

// 創建房間
document.getElementById('createRoom').addEventListener('click', () => {
  const roomID = prompt('輸入房間ID:');
  socket.emit('createRoom', { playerID, roomID });
});

// 加入房間
document.getElementById('joinRoom').addEventListener('click', () => {
  const roomID = prompt('輸入房間ID:');
  socket.emit('joinRoom', { playerID, roomID });
});

// 接收房間創建回應
socket.on('roomCreated', (data) => {
  if (data.success) {
    alert(`房間創建成功！房間ID: ${data.roomID}`);
    startGame(data.roomID);
  }
});

// 玩家加入房間回應
socket.on('playerJoined', (data) => {
  alert(`玩家 ${data.playerID} 加入了房間`);
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

// 生成九九乘法表格
function generateMultiplicationTable() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = ''; // 清空之前的內容

  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.textContent = i * j; // 顯示乘法表的數字
      gameBoard.appendChild(cell);
    }
  }
}

// 隨機選擇兩個位置放置玩家和對手
function placePlayersOnBoard() {
  const cells = document.querySelectorAll('.cell');
  const randomPlayerIndex = Math.floor(Math.random() * cells.length);
  const randomOpponentIndex = Math.floor(Math.random() * cells.length);

  // 確保玩家和對手不會出現在同一格
  while (randomOpponentIndex === randomPlayerIndex) {
    randomOpponentIndex = Math.floor(Math.random() * cells.length);
  }

  // 顯示玩家和對手
  const playerCell = cells[randomPlayerIndex];
  const opponentCell = cells[randomOpponentIndex];

  playerCell.classList.add('player'); // 標記玩家的格子
  opponentCell.classList.add('opponent'); // 標記對手的格子
}

// 初始化遊戲
function initGame() {
  generateMultiplicationTable();
  placePlayersOnBoard();
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
