const socket = io();

// 創建房間
document.getElementById('createRoom').addEventListener('click', () => {
  const playerID = document.getElementById('playerID').value;
  socket.emit('createRoom', { playerID, roomMode: 'public', allowSpectators: true });
});

// 加入房間
document.getElementById('joinRoom').addEventListener('click', () => {
  const playerID = document.getElementById('playerID').value;
  const roomID = prompt('輸入房間ID:');
  socket.emit('joinRoom', { playerID, roomID });
});

// 房間創建回應
socket.on('roomCreated', (data) => {
  if (data.success) {
    alert(`房間創建成功！房間ID: ${data.roomID}`);
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
  }
});

// 房間加入回應
socket.on('playerJoined', (data) => {
  alert(`玩家 ${data.playerID} 加入了房間`);
  document.getElementById('player-id').textContent = data.playerID;
});

// 更新房間列表
socket.on('roomListUpdated', (rooms) => {
  const roomList = document.getElementById('roomList');
  roomList.innerHTML = '';
  for (const roomID in rooms) {
    const room = rooms[roomID];
    const roomElement = document.createElement('div');
    roomElement.textContent = `房間ID: ${roomID} - 玩家數: ${room.players.length}`;
    roomList.appendChild(roomElement);
  }
});
