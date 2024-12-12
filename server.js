const express = require('express');
const app = express();

// 提供 public 資料夾中的靜態檔案
app.use(express.static('public'));

app.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
const port = process.env.PORT || 3001;  // 嘗試更改為其他端口號
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
