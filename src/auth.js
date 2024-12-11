// auth.js
let players = {};  // 儲存玩家信息

function validatePlayer(playerID) {
  if (players[playerID]) {
    return true;  // 玩家存在
  }
  return false;  // 玩家不存在
}

function registerPlayer(playerID) {
  if (!players[playerID]) {
    players[playerID] = { id: playerID, status: 'online' };
    console.log(`玩家 ${playerID} 註冊成功`);
  } else {
    console.log(`玩家 ${playerID} 已經註冊`);
  }
}

function loginPlayer(playerID) {
  if (validatePlayer(playerID)) {
    console.log(`玩家 ${playerID} 登錄成功`);
    return true;
  } else {
    console.log(`玩家 ${playerID} 登錄失敗`);
    return false;
  }
}

module.exports = { validatePlayer, registerPlayer, loginPlayer };
