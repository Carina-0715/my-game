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

// 生成九九乘法表
function generateMultiplicationTable() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = '';  // 清空現有內容

  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.innerHTML = i * j;
      gameBoard.appendChild(cell);
    }
  }
}

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
