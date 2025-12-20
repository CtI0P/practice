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