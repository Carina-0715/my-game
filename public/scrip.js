function generateMultiplicationTable() {
  const board = document.getElementById('game-board');
  board.innerHTML = ''; // 清空舊的表格

  const table = [];
  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      const product = i * j;
      const cell = document.createElement('div');
      cell.id = `cell-${i}-${j}`;
      cell.textContent = product;
      board.appendChild(cell);

      table.push({ value: product, x: i, y: j });
    }
  }

  return table; // 返回表格數據
}

// 隨機分配玩家位置
function assignPlayerPositions(table) {
  const randomIndex1 = Math.floor(Math.random() * table.length);
  let randomIndex2;
  do {
    randomIndex2 = Math.floor(Math.random() * table.length);
  } while (randomIndex1 === randomIndex2);

  const player1Position = table[randomIndex1];
  const player2Position = table[randomIndex2];

  document.getElementById(`cell-${player1Position.x}-${player1Position.y}`).classList.add('player');
  document.getElementById(`cell-${player2Position.x}-${player2Position.y}`).classList.add('opponent');

  return { player1Position, player2Position };
}

// 初始化遊戲畫面
const table = generateMultiplicationTable();
const positions = assignPlayerPositions(table);
console.log('玩家初始位置:', positions);
// 生成手牌
function generateHand() {
  const handCards = [];
  for (let i = 0; i < 3; i++) {
    handCards.push(Math.floor(Math.random() * 9) + 1);
  }
  return handCards;
}

// 顯示手牌
function displayHand(hand) {
  const handDiv = document.getElementById('hand-cards');
  handDiv.innerHTML = '';

  hand.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.textContent = card;
    cardDiv.dataset.index = index;
    handDiv.appendChild(cardDiv);

    // 點擊選擇卡片
    cardDiv.addEventListener('click', () => {
      cardDiv.classList.toggle('selected');
      updateSelectedCards();
    });
  });
}

let selectedCards = [];
function updateSelectedCards() {
  const selected = document.querySelectorAll('#hand-cards .selected');
  selectedCards = Array.from(selected).map((el) => parseInt(el.textContent));
  console.log('選中的卡片:', selectedCards);
}

// 提交出牌
document.getElementById('submit-cards').addEventListener('click', () => {
  if (selectedCards.length !== 2) {
    alert('請選擇兩張卡片！');
    return;
  }
  const product = selectedCards[0] * selectedCards[1];
  alert(`你選擇了 ${selectedCards.join(' 和 ')}，乘積為 ${product}`);
  // TODO: 根據乘積更新玩家位置
});

// 初始化手牌
const hand = generateHand();
displayHand(hand);
function movePlayer(player, direction, steps) {
  const currentCell = document.querySelector(`#cell-${player.x}-${player.y}`);
  currentCell.classList.remove(player.type); // 移除舊位置的圖標

  switch (direction) {
    case 'up':
      player.x = Math.max(player.x - steps, 1);
      break;
    case 'down':
      player.x = Math.min(player.x + steps, 9);
      break;
    case 'left':
      player.y = Math.max(player.y - steps, 1);
      break;
    case 'right':
      player.y = Math.min(player.y + steps, 9);
      break;
  }

  const newCell = document.querySelector(`#cell-${player.x}-${player.y}`);
  if (newCell.classList.contains('opponent') || newCell.classList.contains('player')) {
    alert('目標格子已被佔用，請重新選擇方向！');
    return false; // 移動失敗
  }

  newCell.classList.add(player.type); // 更新新位置的圖標
  return true; // 移動成功
}

// 玩家移動按鈕事件
document.querySelectorAll('#move-direction button').forEach((button) => {
  button.addEventListener('click', () => {
    if (selectedCards.length !== 2) {
      alert('請先選擇兩張卡片！');
      return;
    }

    const steps = selectedCards[0] * selectedCards[1];
    const direction = button.getAttribute('data-direction');
    const success = movePlayer(player1, direction, steps);

    if (success) {
      player1Stamina--;
      updateStaminaDisplay();
      checkGameOver();
      // TODO: 讓對手執行移動邏輯 (AI 或玩家操作)
    }
  });
});
let player1Stamina = 20;
let player2Stamina = 20;

function updateStaminaDisplay() {
  document.getElementById('player-stamina').textContent = player1Stamina;
  document.getElementById('opponent-stamina').textContent = player2Stamina;
}

function checkGameOver() {
  if (player1Stamina <= 0) {
    alert('你輸了！');
    endGame('opponent');
  } else if (player2Stamina <= 0) {
    alert('你贏了！');
    endGame('player');
  }
}

function endGame(winner) {
  const message = winner === 'player' ? '恭喜，你獲勝了！' : '很遺憾，你輸了！';
  alert(message);
  // 返回遊戲大廳或重置遊戲
  window.location.reload(); // 暫時用重新加載頁面作為結束
}
function opponentMove() {
  // 隨機選擇兩張卡片
  const card1 = Math.floor(Math.random() * 9) + 1;
  const card2 = Math.floor(Math.random() * 9) + 1;
  const steps = card1 * card2;

  // 隨機選擇移動方向
  const directions = ['up', 'down', 'left', 'right'];
  let direction;
  let success = false;

  while (!success) {
    direction = directions[Math.floor(Math.random() * directions.length)];
    success = movePlayer(player2, direction, steps);
  }

  player2Stamina--;
  updateStaminaDisplay();
  checkGameOver();
}
function updateStaminaBar(playerStamina, opponentStamina) {
  document.querySelector('.stamina-bar.player span').style.width = `${(playerStamina / 20) * 100}%`;
  document.querySelector('.stamina-bar.opponent span').style.width = `${(opponentStamina / 20) * 100}%`;
}
