const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
// 新增：参数校验工具函数（解决 validateNumber is not defined 错误）
const validateNumber = (value, defaultValue = 1, min = 1) => {
  const num = parseInt(value);
  return isNaN(num) || num < min ? defaultValue : num;
};

// ========== 核心：分页获取用户列表（适配前端用户管理组件） ==========
router.get('/users', async (req, res) => {
  try {
    console.log("nhao");
    // 1. 获取并校验分页参数（和前端分页按钮联动）
    const currentPage = validateNumber(req.query.page, 1, 1); // 当前页，默认1
    const pageSize = validateNumber(req.query.limit, 10, 1); // 每页条数，默认10
    const offset = Math.max(0, (currentPage - 1) * pageSize); // 偏移量

    // 2. 查询用户总数（用于前端显示「共XX个用户」）
    const [totalRows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalRows[0].count || 0;
    const totalPages = Math.ceil(totalUsers / pageSize); // 总页数

    // 3. 查询分页用户数据（严格匹配数据库字段，适配前端展示）
    const [userRows] = await pool.execute(
      `SELECT 
        id, 
        username, 
        email, 
        full_name, 
        role, 
        avatar_url
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 5 OFFSET 0`
      // [offset]
    );

    // 4. 格式化数据（适配前端组件）
    const userList = userRows.map(user => ({
      ...user,
      // 统一 status 格式：数据库 is_active 是布尔值，转为前端的 'active'/'inactive'
      status: user.status ? 'active' : 'inactive',
      // 格式化时间（前端友好显示）
      joinDate: new Date(user.joinDate).toLocaleDateString('zh-CN'),
      lastLogin: new Date(user.lastLogin).toLocaleString('zh-CN'),
      // 补全前端需要的字段（如果数据库中为 null）
      full_name: user.full_name || '未设置',
      avatar_url: user.avatar_url || ''
    }));

    // 5. 返回前端需要的完整数据结构
    return res.json({
      success: true,
      data: {
        userList,        // 用户列表（前端 props）
        totalUsers,      // 总用户数（前端 props）
        currentPage,     // 当前页（前端 props）
        totalPages       // 总页数（前端 props）
      },
      message: '获取用户列表成功'
    });

  } catch (error) {
    console.error('查询用户列表失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '查询用户列表失败',
      error: error.message
    });
  }
});

// ========== 修复现有接口的字段错误 ==========
// 1. 获取单个用户（修复 last_login、status 字段）
router.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        username as name, 
        email, 
        full_name, 
        role, 
        avatar_url, 
        created_at as joinDate, 
        is_active as status, 
        updated_at as lastLogin 
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该用户'
      });
    }

    // 格式化单个用户数据
    const user = {
      ...rows[0],
      status: rows[0].status ? 'active' : 'inactive',
      joinDate: new Date(rows[0].joinDate).toLocaleDateString('zh-CN'),
      lastLogin: new Date(rows[0].lastLogin).toLocaleString('zh-CN')
    };
    
    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('查询失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '查询失败'
    });
  }
});

// 2. 更新用户信息（修复 status 字段为 is_active）
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

    // 转换 status 为数据库的布尔值
    const is_active = status === 'active' ? true : false;

    const [result] = await pool.execute(
      'UPDATE users SET username = ?, email = ?, full_name = ?, role = ?, is_active = ? WHERE id = ?',
      [username, email, full_name, role, is_active, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该用户'
      });
    }
    
    // 查询更新后的用户（返回格式化数据）
    const [updatedUser] = await pool.execute(
      `SELECT 
        id, 
        username as name, 
        email, 
        full_name, 
        role, 
        avatar_url, 
        created_at as joinDate, 
        is_active as status, 
        updated_at as lastLogin 
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    
    return res.json({
      success: true,
      data: {
        ...updatedUser[0],
        status: updatedUser[0].status ? 'active' : 'inactive',
        joinDate: new Date(updatedUser[0].joinDate).toLocaleDateString('zh-CN'),
        lastLogin: new Date(updatedUser[0].lastLogin).toLocaleString('zh-CN')
      },
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

// ========== 保留原有接口（注册/登录/删除） ==========
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
      'UPDATE users SET updated_at = NOW() WHERE id = ?',
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

// 工具函数：格式化时长（秒 → X小时）
const formatDuration = (totalSeconds) => {
  const hours = Math.ceil(totalSeconds / 3600);
  return `${hours}小时`;
};

// 工具函数：模拟课程难度等级（可根据业务扩展）
const getCourseLevel = (category, price) => {
  if (price <= 99) return '初级';
  if (price <= 199) return '中级';
  return '高级';
};

// 工具函数：模拟课程完成进度（可根据课时发布数/总课时计算）
const getCourseProgress = (courseId) => {
  // 测试数据固定进度，生产环境可关联lessons表计算
  const progressMap = { 1: 78, 2: 45, 3: 92, 4: 30 };
  return progressMap[courseId] || Math.floor(Math.random() * 100);
};

// ========== 核心接口：获取课程列表（适配前端CourseManagementContent） ==========
router.get('/courses', async (req, res) => {
  try {
    // 多表关联查询：课程+选课人数+课时总时长
    const [courses] = await pool.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.price,
        c.cover_image AS image,
        c.status,
        -- 统计选课人数
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS students,
        -- 统计课时总时长（秒）
        (SELECT COALESCE(SUM(duration_sec), 0) FROM lessons l WHERE l.course_id = c.id) AS total_seconds
      FROM courses c
      ORDER BY c.created_at DESC
    `);

    // 格式化数据适配前端组件
    const courseList = courses.map(course => ({
      id: course.id,
      image: course.image || 'https://via.placeholder.com/300x150/4361ee/FFFFFF?text=默认课程图',
      category: course.category,
      level: getCourseLevel(course.category, course.price), // 难度等级
      title: course.title,
      description: course.description,
      students: course.students, // 选课人数
      duration: formatDuration(course.total_seconds), // 格式化时长
      progress: getCourseProgress(course.id) // 课程完成进度
    }));

    return res.json({
      success: true,
      data: { courseList },
      message: '获取课程列表成功'
    });
  } catch (error) {
    console.error('获取课程列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取课程列表失败',
      error: error.message
    });
  }
});

// ========== 获取单个课程详情 ==========
router.get('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    // 关联查询课程+讲师信息+课时列表
    const [courseRows] = await pool.execute(`
      SELECT 
        c.*,
        u.username AS instructor_name,
        u.full_name AS instructor_fullname
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
    `, [courseId]);

    if (courseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 查询课程下的课时列表
    const [lessons] = await pool.execute(`
      SELECT * FROM lessons 
      WHERE course_id = ? 
      ORDER BY order_index ASC
    `, [courseId]);

    // 格式化课程详情
    const course = {
      ...courseRows[0],
      image: courseRows[0].cover_image || 'https://via.placeholder.com/300x150/4361ee/FFFFFF?text=默认课程图',
      level: getCourseLevel(courseRows[0].category, courseRows[0].price),
      duration: formatDuration(lessons.reduce((sum, l) => sum + l.duration_sec, 0)),
      lessons: lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        videoUrl: lesson.video_url,
        duration: formatDuration(lesson.duration_sec),
        orderIndex: lesson.order_index
      }))
    };

    return res.json({
      success: true,
      data: { course },
      message: '获取课程详情成功'
    });
  } catch (error) {
    console.error('获取课程详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取课程详情失败',
      error: error.message
    });
  }
});

// ========== 新增课程 ==========
router.post('/courses', async (req, res) => {
  try {
    const { title, description, instructor_id, category, price, status, cover_image } = req.body;

    // 参数校验
    if (!title || !instructor_id || !category) {
      return res.status(400).json({
        success: false,
        message: '课程标题、讲师ID、分类为必填项'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO courses (title, description, instructor_id, category, price, status, cover_image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description || '', instructor_id, category, price || 0.00, status || 'draft', cover_image || '']);

    // 获取新增课程
    const [newCourse] = await pool.execute('SELECT * FROM courses WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      data: { course: newCourse[0] },
      message: '课程创建成功'
    });
  } catch (error) {
    console.error('新增课程失败:', error);
    return res.status(500).json({
      success: false,
      message: '新增课程失败',
      error: error.message
    });
  }
});

// ========== 编辑课程 ==========
router.put('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, instructor_id, category, price, status, cover_image } = req.body;

    // 参数校验
    if (!title || !instructor_id || !category) {
      return res.status(400).json({
        success: false,
        message: '课程标题、讲师ID、分类为必填项'
      });
    }

    const [result] = await pool.execute(`
      UPDATE courses 
      SET title = ?, description = ?, instructor_id = ?, category = ?, price = ?, status = ?, cover_image = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, description || '', instructor_id, category, price || 0.00, status || 'draft', cover_image || '', courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 获取更新后的课程
    const [updatedCourse] = await pool.execute('SELECT * FROM courses WHERE id = ?', [courseId]);

    return res.json({
      success: true,
      data: { course: updatedCourse[0] },
      message: '课程编辑成功'
    });
  } catch (error) {
    console.error('编辑课程失败:', error);
    return res.status(500).json({
      success: false,
      message: '编辑课程失败',
      error: error.message
    });
  }
});

// ========== 删除课程 ==========
router.delete('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;

    // 外键关联：删除课程会自动删除课时/选课记录（数据库级联删除）
    const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    return res.json({
      success: true,
      message: '课程删除成功'
    });
  } catch (error) {
    console.error('删除课程失败:', error);
    return res.status(500).json({
      success: false,
      message: '删除课程失败',
      error: error.message
    });
  }
});

// ========== 管理课程内容（课时） ==========
router.get('/courses/:id/lessons', async (req, res) => {
  try {
    const courseId = req.params.id;
    const [lessons] = await pool.execute(`
      SELECT * FROM lessons 
      WHERE course_id = ? 
      ORDER BY order_index ASC
    `, [courseId]);

    return res.json({
      success: true,
      data: { lessons },
      message: '获取课程课时成功'
    });
  } catch (error) {
    console.error('获取课程课时失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取课程课时失败',
      error: error.message
    });
  }
});

module.exports = router;