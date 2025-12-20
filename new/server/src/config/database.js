const mysql = require('mysql2/promise');

// 加载环境变量（可选 quiet: true）
require('dotenv').config({ quiet: true });

// 数据库配置  
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'MySQL@123',
    database: process.env.DB_NAME || 'mydb',
    port: parseInt(process.env.DB_PORT) || 3306
};

// 创建连接池
const pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试连接
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL 数据库连接成功');
        connection.release();
    } catch (error) {
        console.error('❌ MySQL 连接失败:', error.message);
        process.exit(1);
    }
};

// 初始化数据库表
const initDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        
        // 创建表
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(50) NOT NULL UNIQUE,
              email VARCHAR(100) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('数据库表已初始化');
        // connection.release();
    } catch (error) {
        console.error('数据库初始化失败:', error.message);
    }
};

module.exports = {
    pool,
    testConnection,
    initDatabase
};
