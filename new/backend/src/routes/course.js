const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

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
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
router.get('/:id/lessons', async (req, res) => {
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