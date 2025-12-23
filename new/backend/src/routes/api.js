const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// 获取所有用户（带分页）
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 获取总数
    const [totalRows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const total = totalRows[0].count;

    // 获取分页数据
    const [rows] = await pool.execute(
      `SELECT id, username, email, full_name, role, avatar_url, 
       created_at, last_login, status 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: '获取用户列表成功'
    });
  } catch (error) {
    console.error('查询失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '查询数据失败'
    });
  }
});

// 注册新用户（修正密码字段名）
router.post('/submit', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('收到注册请求:', req.body);

    // 简单验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码是必填项'
      });
    }

    // 检查重复
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      const [userWithUsername] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );
      
      const [userWithEmail] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (userWithUsername.length > 0) {
        return res.status(409).json({
          success: false,
          message: '用户名已存在'
        });
      }
      
      if (userWithEmail.length > 0) {
        return res.status(409).json({
          success: false,
          message: '邮箱已被注册'
        });
      }
    }

    // 修正：使用 password_hash 字段存储密码
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password] // 实际项目应加密存储
    );
    
    // 获取新用户（不返回密码）
    const [newUser] = await pool.execute(
      'SELECT id, username, email, full_name, role, avatar_url, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newUser[0],
      message: '注册成功'
    });
    
  } catch (error) {
    console.error('注册错误:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 获取单个用户
router.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, username, email, full_name, role, avatar_url, 
       created_at, last_login, status 
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该用户'
      });
    }
    
    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('查询失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '查询失败'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    console.log('收到登录请求:', req.body);
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码是必填项'
      });
    }

    // 查询用户
    const [users] = await pool.execute(
      'SELECT id, username, email, password_hash, role, full_name, avatar_url FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[0];

    // 修正：应该使用 bcrypt 比较密码
    // 暂时先用明文比较（实际项目一定要加密）
    if (user.password_hash !== password) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    // 更新最后登录时间
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // 生成 token
    const token = `token_${user.id}_${Date.now()}`;

    // 返回安全数据（不含密码）
    const { password_hash: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: '登录成功'
    });

  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除用户（修正路径）
router.delete('/users/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该用户'
      });
    }
    
    return res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

// 更新用户信息（修正路径）
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, full_name, role, status } = req.body;
    
    // 验证必要字段
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: '用户名和邮箱是必填项'
      });
    }

    const [result] = await pool.execute(
      'UPDATE users SET username = ?, email = ?, full_name = ?, role = ?, status = ? WHERE id = ?',
      [username, email, full_name, role, status || 'active', req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该用户'
      });
    }
    
    const [updatedUser] = await pool.execute(
      `SELECT id, username, email, full_name, role, avatar_url, 
       created_at, last_login, status 
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    
    return res.json({
      success: true,
      data: updatedUser[0],
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
});

module.exports = router;