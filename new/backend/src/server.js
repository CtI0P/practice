const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection, initDatabase } = require('./src/config/database'); // 引入数据库配置

const app = express();
const PORT = 3001;

// 中间件
app.use(cors()); // 允许跨域
app.use(bodyParser.json()); // 解析JSON请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析URL编码请求体

// 导入路由
const apiRoutes = require('./src/routes/api');
app.use('/api', apiRoutes);

// // 启动服务器
// app.listen(PORT, () => {
//   console.log(`服务器运行在 http://localhost:${PORT}`);
// });

// 启动前检查数据库连接
const startServer = async () => {
  try {
    await testConnection();
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    process.exit(1);
  }
};

startServer();