const express = require('express');
const router = express.Router();
const {pool} =require('../config/database')

// 获取所有提交
router.get('/submissions',async(req, res) => {
  try{
    const [rows]=await pool.execute(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
    )

    return res.json({
      success: true,
      data: rows,
      message: '获取数据成功'
    });
  }catch(error){
    console.error('查询失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '查询数据失败'
    });
  }  
});

// 提交数据
router.post('/submit', async(req, res) => {

  try {
    const { username, email, password } = req.body;

    console.log('收到注册请求:', req.body);

    // 简单的数据验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '姓名和邮箱是必填项'
      });
    }

    // 检查用户名和邮箱是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      // 检查具体是哪个重复
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

    // 插入新用户（注意：实际项目中密码应该加密存储）
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    
    // 获取新插入的用户信息（不返回密码）
    const [newUser] = await pool.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newUser[0],
      message: '注册成功'
    });
    
  } catch (error) {
    console.error('服务器错误:', error);

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

// 获取单个提交
router.get('/submissions/:id',async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
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

    // 验证数据
    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名/邮箱和密码都是必填项'
      });
    }

    console.log('正在查询用户:', usernameOrEmail);

    // 查询用户 - 支持用户名或邮箱登录
    const [users] = await pool.execute(
      'SELECT id, username, email, password FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    console.log('查询结果:', users.length, '条记录');

    // 用户不存在
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在，请检查用户名或邮箱'
      });
    }

    const user = users[0];
    console.log('找到用户:', user.username);

    // 验证密码（注意：实际项目中应该使用加密比较，这里直接比较明文仅用于演示）
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    console.log('✅ 登录成功，用户ID:', user.id);

    // 登录成功，不返回密码
    const { password: _, ...userWithoutPassword } = user;

    // 生成 token（简化版，实际项目中应该使用 JWT）
    const token = `token_${user.id}_${Date.now()}`;

    // 返回用户信息和 token
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

// 删除用户
router.delete('/submissions/:id', async (req, res) => {
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

// 更新用户信息
router.put('/submissions/:id', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该用户'
      });
    }
    
    const [updatedUser] = await pool.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
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