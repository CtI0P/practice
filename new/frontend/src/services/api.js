import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('API Error:', error.response || error.message);
    
    // 处理认证错误
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API方法
export const apiService = {
  // 用户注册
  async registerUser(data) {
    return api.post('/submit', data); // 注意：后端注册接口是 /submit
  },

  // 用户登录
  async loginUser(data) {
    return api.post('/login', data);
  },
  
  // 获取所有用户（带分页）
  async getUsers(page = 1, limit = 10) {
    return api.get('/users', {
      params: { page, limit }
    });
  },
  
  // 获取单个用户
  async getUser(id) {
    return api.get(`/users/${id}`);
  },
  
  // 更新用户信息
  async updateUser(id, data) {
    return api.put(`/users/${id}`, data);
  },
  
  // 删除用户
  async deleteUser(id) {
    return api.delete(`/users/${id}`);
  },

  // 提交表单数据
  async submitForm(data) {
    return api.post('/submit', data);
  },
  
  // 获取所有提交
  async getSubmissions() {
    return api.get('/submissions');
  },
  
  // 获取单个提交
  async getSubmission(id) {
    return api.get(`/submissions/${id}`);
  },
  
  // 获取当前登录用户信息
  async getCurrentUser() {
    return api.get('/user/profile');
  },
  
  // 注销登录
  async logout() {
    return api.post('/logout');
  },

  // ====================== 课程相关（修正变量名+统一风格） ======================
  // 获取课程列表
  async getCourses() {
    return api.get('/courses');
  },
  
  // 获取单个课程详情
  async getCourseDetail(courseId) {
    return api.get(`/courses/${courseId}`);
  },
  
  // 新增课程
  async addCourse(courseData) {
    return api.post('/courses', courseData);
  },
  
  // 编辑课程
  async updateCourse(courseId, courseData) {
    return api.put(`/courses/${courseId}`, courseData);
  },
  
  // 删除课程
  async deleteCourse(courseId) {
    return api.delete(`/courses/${courseId}`);
  },
  
  // 获取课程下的课时列表
  async getCourseLessons(courseId) {
    return api.get(`/courses/${courseId}/lessons`);
  },

  // 获取社区帖子列表（带评论）
  async getCommunityPosts() {
    return api.get('/posts');
  },

  // 创建新帖子
  async createPost(postData) {
    return api.post('/posts', postData);
  },

  // 为帖子添加评论
  async createComment(postId, commentData) {
    return api.post(`/posts/${postId}/comments`, commentData);
  },

  // 删除帖子
  async deletePost(postId) {
    return api.delete(`/posts/${postId}`);
  },

  // 删除评论
  async deleteComment(commentId) {
    return api.delete(`/comments/${commentId}`);
  }
};

export default apiService;