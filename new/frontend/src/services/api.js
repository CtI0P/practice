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
    // 可以在这里添加token等
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
    return Promise.reject(error);
  }
);

// API方法
export const apiService = {

  // 用户注册
  async registerUser(data) {
    return api.post('/register', data);
  },

  // 用户登录
  async loginUser(data) {
    return api.post('/login', data);
  },
  
  // 获取所有用户
  async getUsers() {
    return api.get('/submissions');
  },
  
  // 获取单个用户
  async getUser(id) {
    return api.get(`/submissions/${id}`);
  },
  
  // 删除用户
  async deleteUser(id) {
    return api.delete(`/submissions/${id}`);
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
  }
};

export default apiService;