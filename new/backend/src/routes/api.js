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
    // 1. 获取并校验分页参数（和前端分页按钮联动）
    const currentPage = validateNumber(req.query.page, 1, 1); // 当前页，默认1
    const pageSize = validateNumber(req.query.limit, 10, 1); // 每页条数，默认10
    const offset = Math.max(0, (currentPage - 1) * pageSize); // 偏移量

    // 2. 查询用户总数（用于前端显示「共XX个用户」）
    const [totalRows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalRows[0].count || 0;
    const totalPages = Math.ceil(totalUsers / pageSize); // 总页数

    // 3. 查询分页用户数据（修复：补充缺失的日期、状态字段，使用动态分页参数）
    const [userRows] = await pool.query(
      `SELECT 
        id, 
        username, 
        email, 
        full_name, 
        role, 
        avatar_url,
        is_active,   
        created_at,     
        updated_at       
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`, 
      [pageSize, offset]  // 传入分页参数
    );

    // 4. 格式化数据（适配前端组件，修复字段映射错误）
    const userList = userRows.map(user => ({
      ...user,
      // 用is_active（数据库字段）替代status
      status: user.is_active ? 'active' : 'inactive',
      // 用created_at/updated_at生成日期，且做空值判断
      joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未记录',
      lastLogin: user.updated_at ? new Date(user.updated_at).toLocaleString('zh-CN') : '未登录',
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
    const { title, category, description } = req.body;

    // ✅ 最基本校验（和你前端一致）
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: '课程名称和分类为必填项'
      });
    }

    // ✅ 临时方案：写死 instructor_id
    // ⚠️ 后期可以替换为 req.user.id
    const instructor_id = 1;

    const [result] = await pool.execute(
      `
      INSERT INTO courses
        (title, description, instructor_id, category, price, status, cover_image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description || '',
        instructor_id,
        category,
        0.00,          // price
        'draft',       // status
        ''              // cover_image
      ]
    );

    const [newCourse] = await pool.execute(
      'SELECT * FROM courses WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: { course: newCourse[0] },
      message: '课程创建成功'
    });
  } catch (error) {
    console.error('新增课程失败:', error);
    res.status(500).json({
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
    const { title, description, category, level } = req.body;

    // 基本校验
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: '课程标题、分类为必填项'
      });
    }

    const [result] = await pool.execute(
      `
      UPDATE courses
      SET
        title = ?,
        category = ?,
        description = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        title,
        category,
        description || '',
        courseId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    return res.json({
      success: true,
      data: { course: rows[0] },
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

// ========== 发布课程 ==========
router.post('/courses/:id/publish', async (req, res) => {
  const courseId = req.params.id;

  const [result] = await pool.execute(
    `UPDATE courses SET status = 'published' WHERE id = ?`,
    [courseId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: '课程不存在' });
  }

  res.json({ success: true, message: '课程已发布' });
});

// ========== 下线课程 ==========
router.post('/courses/:id/offline', async (req, res) => {
  const courseId = req.params.id;

  const [result] = await pool.execute(
    `UPDATE courses SET status = 'archived' WHERE id = ?`,
    [courseId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: '课程不存在' });
  }

  res.json({ success: true, message: '课程已下线' });
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

// 获取帖子列表（包含评论）
router.get('/posts', async (req, res) => {
  try {
    // 获取所有帖子，关联users表获取作者名
    const [posts] = await pool.execute(`
      SELECT 
        p.id,
        p.content,
        p.created_at,
        u.username as author_name,
        u.full_name,
        u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    // 为每个帖子获取评论（同样关联users表）
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const [comments] = await pool.execute(`
          SELECT 
            c.id,
            c.content,
            c.created_at,
            u.username as author_name,
            u.full_name,
            u.avatar_url
          FROM comments c
          LEFT JOIN users u ON c.user_id = u.id
          WHERE c.post_id = ?
          ORDER BY c.created_at ASC
        `, [post.id]);

        return {
          ...post,
          comments: comments || []
        };
      })
    );

    return res.json({
      success: true,
      data: postsWithComments,
      message: '获取帖子列表成功'
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取帖子列表失败'
    });
  }
});

// 创建新帖子
router.post('/posts', async (req, res) => {
  try {
    const { user_id, content } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({
        success: false,
        message: '用户ID和内容不能为空'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, content) VALUES (?, ?)',
      [user_id, content]
    );

    // 获取新创建的帖子（关联users表获取作者信息）
    const [newPost] = await pool.execute(`
      SELECT 
        p.id,
        p.content,
        p.created_at,
        u.username as author_name,
        u.full_name,
        u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [result.insertId]);

    return res.json({
      success: true,
      data: newPost[0],
      message: '帖子发布成功'
    });
  } catch (error) {
    console.error('发布帖子失败:', error);
    return res.status(500).json({
      success: false,
      message: '发布帖子失败'
    });
  }
});

// 添加评论
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { user_id, content } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({
        success: false,
        message: '用户ID和内容不能为空'
      });
    }

    // 检查帖子是否存在
    const [postExists] = await pool.execute(
      'SELECT id FROM posts WHERE id = ?',
      [postId]
    );

    if (postExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, user_id, content]
    );

    // 获取新创建的评论（关联users表获取作者信息）
    const [newComment] = await pool.execute(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.username as author_name,
        u.full_name,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    return res.json({
      success: true,
      data: newComment[0],
      message: '评论发表成功'
    });
  } catch (error) {
    console.error('发表评论失败:', error);
    return res.status(500).json({
      success: false,
      message: '发表评论失败'
    });
  }
});

// ========== 获取测试/测验列表 ==========
router.get('/quizzes', async (req, res) => {
  try {
    console.log("获取测试列表请求:", req.query);
    
    // 获取并校验分页参数
    const currentPage = validateNumber(req.query.page, 1, 1);
    const pageSize = validateNumber(req.query.limit, 10, 1);
    const offset = Math.max(0, (currentPage - 1) * pageSize);
    
    // 获取筛选参数（仅保留存在的course_id）
    const { course_id } = req.query;
    
    // 构建查询条件
    let query = `
      SELECT 
        q.id,
        q.course_id,
        q.title,
        q.description,
        q.time_limit_min,
        q.passing_score,
        q.created_at,
        c.title as course_title,
        -- 新增：统计该测试的题目数量（关联questions表）
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count
      FROM quizzes q
      LEFT JOIN courses c ON q.course_id = c.id
      WHERE 1=1
    `;
    
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM quizzes q
      WHERE 1=1
    `;
    
    const params = [];
    const countParams = [];
    
    // 仅保留course_id的筛选（表中存在该字段）
    if (course_id) {
      query += ' AND q.course_id = ?';
      countQuery += ' AND q.course_id = ?';
      params.push(course_id);
      countParams.push(course_id);
    }
    
    // 分页逻辑（占位符数量与参数匹配）
    query += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);
    
    // 查询总数
    const [totalRows] = await pool.query(countQuery, countParams);
    const totalQuizzes = totalRows[0].count || 0;
    const totalPages = Math.ceil(totalQuizzes / pageSize);
    
    // 查询分页数据
    const [quizzes] = await pool.query(query, params);
    
    // 格式化数据（适配前端展示，使用真实的question_count）
    const quizList = quizzes.map(quiz => ({
      id: quiz.id,
      courseId: quiz.course_id,
      courseTitle: quiz.course_title || '未关联课程',
      title: quiz.title,
      description: quiz.description || '暂无描述',
      question_count: quiz.question_count, // 从子查询获取真实题目数
      duration: quiz.time_limit_min, // 前端需要的字段名（和前端保持一致）
      participants: 0, // 可后续关联submissions表统计
      passing_score: quiz.passing_score,
      createdAt: new Date(quiz.created_at).toLocaleString('zh-CN')
    }));
    
    return res.json({
      success: true,
      data: {
        quizzes: quizList, // 注意：前端代码中用的是tests，这里要和前端保持字段名一致！
        totalQuizzes,
        currentPage,
        totalPages
      },
      message: '获取测试列表成功'
    });
    
  } catch (error) {
    console.error('获取测试列表失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '获取测试列表失败',
      error: error.message,
      sqlError: error.sqlMessage
    });
  }
});

// ========== 获取单个测试详情 ==========
router.get('/quizzes/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    
    const [quizzes] = await pool.execute(
      `SELECT 
        q.*,
        c.title as course_title,
        u.username as instructor_name
       FROM quizzes q
       LEFT JOIN courses c ON q.course_id = c.id
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE q.id = ?`,
      [quizId]
    );
    
    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该测试'
      });
    }
    
    const quiz = quizzes[0];
    
    // 获取该测试的所有问题
    const [questions] = await pool.query(
      `SELECT 
        id,
        question_text,
        question_type,
        option_a,  -- 新增
        option_b,  -- 新增
        option_c,  -- 新增
        option_d,  -- 新增
        correct_answer,  -- 新增
        points,
        order_index
      FROM questions 
      WHERE quiz_id = ?
      ORDER BY order_index ASC`,
      [quizId]
    );
    
    // 格式化选项为数组（供前端渲染）
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: [q.option_a, q.option_b, q.option_c, q.option_d]  // 把4个选项转为数组
    }));
    
    // 格式化测试详情
    const quizDetail = {
      id: quiz.id,
      courseId: quiz.course_id,
      courseTitle: quiz.course_title,
      instructorName: quiz.instructor_name || '未知讲师',
      title: quiz.title,
      description: quiz.description || '',
      timeLimit: quiz.time_limit_min,
      passingScore: quiz.passing_score,
      createdAt: new Date(quiz.created_at).toLocaleString('zh-CN'),
      totalQuestions: questions.length,
      questions: formattedQuestions,
      // 计算总分
      totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0)
    };
    
    return res.json({
      success: true,
      data: quizDetail,
      message: '获取测试详情成功'
    });
    
  } catch (error) {
    console.error('获取测试详情失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '获取测试详情失败',
      error: error.message
    });
  }
});

// ========== 创建新测试 ==========
router.post('/quizzes', async (req, res) => {
  try {
    console.log('后端收到的创建测试参数：', req.body);
    const { title, description, time_limit_min, passing_score } = req.body;

    // 1. 先查询 courses 表的所有有效 id
    const [courses] = await pool.execute('SELECT id FROM courses');
    if (courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: '暂无有效课程，请先创建课程'
      });
    }

    // 2. 随机选一个 course_id
    const randomCourseId = courses[Math.floor(Math.random() * courses.length)].id;
    console.log('随机选中的 course_id：', randomCourseId);

    // 3. 校验必填项（无需前端传 course_id）
    if (title === undefined || title === '') {
      return res.status(400).json({
        success: false,
        message: '测试标题是必填项'
      });
    }

    // 4. 插入数据（使用随机有效 course_id）
    const defaultDescription = description || '';
    const defaultTimeLimit = time_limit_min === undefined ? 0 : time_limit_min;
    const defaultPassingScore = passing_score === undefined ? 60 : passing_score;

    const [result] = await pool.execute(
      'INSERT INTO quizzes (course_id, title, description, time_limit_min, passing_score) VALUES (?, ?, ?, ?, ?)',
      [randomCourseId, title, defaultDescription, defaultTimeLimit, defaultPassingScore]
    );

    const [newQuiz] = await pool.execute(
      'SELECT * FROM quizzes WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newQuiz[0],
      message: '测试创建成功'
    });

  } catch (error) {
    console.error('创建测试失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '创建测试失败',
      error: error.message
    });
  }
});

// ========== 更新测试 ==========
router.put('/quizzes/:id', async (req, res) => {
  try {
    // 1. 获取参数并转换 quizId 类型
    const quizId = Number(req.params.id); // 转为数字类型
    const { course_id, title, description, time_limit_min, passing_score } = req.body;
    
    //  仅校验必填项（title）+ 有效 quizId 
    if (isNaN(quizId) || quizId <= 0) {
      return res.status(400).json({
        success: false,
        message: '无效的测试ID（必须是有效数字）'
      });
    }
    if (!title || title.trim() === '') { // 仅校验标题非空（去除首尾空格）
      return res.status(400).json({
        success: false,
        message: '测试标题不能为空'
      });
    }

    // 先查询测试是否存在（避免无效更新）
    const [existingQuiz] = await pool.execute(
      'SELECT * FROM quizzes WHERE id = ?',
      [quizId]
    );
    if (existingQuiz.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该测试'
      });
    }

    // 参数兜底（沿用原有值，前端不传则不修改）
    const finalCourseId = course_id !== undefined ? course_id : existingQuiz[0].course_id;
    const finalDescription = description !== undefined ? description : existingQuiz[0].description;
    const finalTimeLimit = time_limit_min !== undefined ? time_limit_min : existingQuiz[0].time_limit_min;
    const finalPassingScore = passing_score !== undefined ? passing_score : existingQuiz[0].passing_score;

    // 2. 执行更新操作
    const [result] = await pool.execute(
      'UPDATE quizzes SET course_id = ?, title = ?, description = ?, time_limit_min = ?, passing_score = ? WHERE id = ?',
      [finalCourseId, title, finalDescription, finalTimeLimit, finalPassingScore, quizId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该测试'
      });
    }
    
    // 获取更新后的测试
    const [updatedQuiz] = await pool.execute(
      'SELECT * FROM quizzes WHERE id = ?',
      [quizId]
    );
    
    return res.json({
      success: true,
      data: updatedQuiz[0],
      message: '测试更新成功'
    });
    
  } catch (error) {
    console.error('更新测试失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '更新测试失败',
      error: error.message
    });
  }
});

// ========== 删除测试 ==========
router.delete('/quizzes/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // 先删除关联的问题（如果有级联删除则不需要）
    await pool.execute('DELETE FROM questions WHERE quiz_id = ?', [quizId]);
    
    const [result] = await pool.execute('DELETE FROM quizzes WHERE id = ?', [quizId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该测试'
      });
    }
    
    return res.json({
      success: true,
      message: '测试删除成功'
    });
    
  } catch (error) {
    console.error('删除测试失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '删除测试失败',
      error: error.message
    });
  }
});

// ========== 获取测试问题 ==========
router.get('/quizzes/:id/questions', async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // 修正SQL：删除不存在的created_at字段，同时保留你需要的有效字段
    const [questions] = await pool.execute(
      `SELECT 
        id,
        quiz_id,
        question_text,
        question_type,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        points,
        order_index
      FROM questions 
      WHERE quiz_id = ?
      ORDER BY order_index ASC`,
      [quizId]
    );
    
    // 格式化选项：转为前端需要的{text: 内容}对象数组，过滤空选项
    const formattedQuestions = questions.map(q => {
      const rawOptions = [
        { text: q.option_a },
        { text: q.option_b },
        { text: q.option_c },
        { text: q.option_d }
      ];
      const validOptions = rawOptions.filter(opt => opt.text && opt.text.trim() !== '');
      
      return {
        ...q,
        options: validOptions,
        // 移除多余的单个选项字段（可选，优化返回数据）
        option_a: undefined,
        option_b: undefined,
        option_c: undefined,
        option_d: undefined
      };
    });
    
    return res.json({
      success: true,
      data: { questions: formattedQuestions }, // 匹配前端接口期望格式
      message: '获取测试问题成功'
    });
    
  } catch (error) {
    console.error('获取测试问题失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '获取测试问题失败',
      error: error.message
    });
  }
});

// ========== 提交测试 ==========
router.post('/quizzes/submit', async (req, res) => {
  try {
    // 获取前端提交的数据
    const { quiz_id, answers, time_spent } = req.body;
    // 测试阶段：手动指定用户ID（替换为你的实际测试用户ID，比如 1，后续上线替换为 req.user.id）
    const userId = 1; 

    // 1. 验证必填参数
    if (!quiz_id || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: '参数错误：缺少测试ID或答题数据'
      });
    }

    // 2. 查询该测试的所有题目及正确答案（和你获取测试详情的SQL保持一致，只取需要的字段）
    const [questions] = await pool.query(
      `SELECT 
        id,
        correct_answer,
        question_type,
        points
       FROM questions 
       WHERE quiz_id = ?
       ORDER BY order_index ASC`,
      [quiz_id]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '该测试不存在或无题目'
      });
    }

    // 3. 批改答案计算总分
    let totalScore = 0;
    // 构建题目ID映射表，方便快速查找
    const questionMap = new Map(questions.map(q => [q.id, q]));

    answers.forEach(userAnswer => {
      // 兜底：跳过无效答题数据
      if (!userAnswer || !userAnswer.question_id) return;
      
      const question = questionMap.get(userAnswer.question_id);
      if (!question) return; // 跳过不存在的题目

      const { correct_answer, question_type, points } = question;
      const userAns = userAnswer.answer;

      // console.log(`
      //   题目ID：${userAnswer.question_id}
      //   题目类型：${question_type}
      //   数据库正确答案：${correct_answer}
      //   用户提交答案：${JSON.stringify(userAns)}
      //   用户答案第一个元素：${userAns[0]}
      // `);

      // 兜底：防止用户答案为空，导致访问 [0] 报错
      if (!userAns || (Array.isArray(userAns) && userAns.length === 0)) return;

      // 按题型对比答案
      let isCorrect = false;
      switch (question_type) {
        case 'single_choice':
        case 'true_false':
          // 单选/判断：直接对比字符串
          isCorrect = userAns[0] === correct_answer;
          break;
        case 'multiple_choice':
          // 多选：排序后对比（避免["A","B"]和["B","A"]判定为错误）
          const userAnsSorted = Array.isArray(userAns) ? userAns.sort().join(',') : '';
          const correctAnsSorted = correct_answer.split(',').sort().join(',');
          isCorrect = userAnsSorted === correctAnsSorted;
          break;
        case 'short_answer':
          // 简答：精确匹配（可按需改为模糊匹配）
          isCorrect = userAns[0] === correct_answer;
          break;
        default:
          isCorrect = false;
      }

      // 正确则加分
      if (isCorrect) {
        totalScore += points || 0;
      }
    });

    // 4. 存储/更新测试结果（INSERT ... ON DUPLICATE KEY UPDATE：存在则更新，不存在则新增）
    await pool.execute(
      `INSERT INTO quiz_results (user_id, quiz_id, score, submitted_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
       score = ?,
       submitted_at = NOW()`,
      [userId, quiz_id, totalScore, totalScore] // 后一个 totalScore 对应更新的 score
    );

    // 5. 格式化返回数据（和你获取测试详情的返回格式保持一致）
    return res.json({
      success: true,
      message: '测试提交成功',
      data: {
        result: {
          score: totalScore,
          quiz_id: quiz_id,
          submitted_at: new Date().toLocaleString('zh-CN'), // 和你获取详情的时间格式一致
          time_spent: time_spent || 0
        }
      }
    });

  } catch (error) {
    console.error('提交测试失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '提交测试失败',
      error: error.message
    });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const { quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, points, order_index } = req.body;

    // 参数校验
    if (!quiz_id || !question_text || !question_type || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: '测试ID、题目内容、题目类型、正确答案为必填项'
      });
    }

    // 插入数据库
    const [result] = await pool.execute(
      `INSERT INTO questions (quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, points, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quiz_id, question_text, question_type, option_a || '', option_b || '', option_c || '', option_d || '', correct_answer, points || 1, order_index || 0]
    );

    // 返回新创建的题目
    const [newQuestion] = await pool.execute('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      data: { question: newQuestion[0] },
      message: '题目创建成功'
    });
  } catch (error) {
    console.error('创建题目失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '创建题目失败',
      error: error.message
    });
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
    const { quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, points, order_index } = req.body;

    // 参数校验
    if (!quiz_id || !question_text || !question_type || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: '测试ID、题目内容、题目类型、正确答案为必填项'
      });
    }

    // 更新数据库
    const [result] = await pool.execute(
      `UPDATE questions 
       SET quiz_id = ?, question_text = ?, question_type = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, points = ?, order_index = ?
       WHERE id = ?`,
      [quiz_id, question_text, question_type, option_a || '', option_b || '', option_c || '', option_d || '', correct_answer, points || 1, order_index || 0, questionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }

    // 返回更新后的题目
    const [updatedQuestion] = await pool.execute('SELECT * FROM questions WHERE id = ?', [questionId]);
    return res.json({
      success: true,
      data: { question: updatedQuestion[0] },
      message: '题目更新成功'
    });
  } catch (error) {
    console.error('更新题目失败:', error.message);
    return res.status(500).json({
      success: false,
      message: '更新题目失败',
      error: error.message
    });
  }
});

module.exports = router;