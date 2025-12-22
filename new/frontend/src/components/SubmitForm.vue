<template>
  <div class="submit-form">
    <h2>提交表单</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">姓名：</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          required
          placeholder="请输入姓名"
        />
      </div>
      
      <div class="form-group">
        <label for="email">邮箱：</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          required
          placeholder="请输入邮箱"
        />
      </div>
      
      <div class="form-group">
        <label for="message">留言：</label>
        <textarea
          id="message"
          v-model="formData.message"
          rows="4"
          placeholder="请输入留言内容"
        ></textarea>
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? '提交中...' : '提交' }}
      </button>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script>
import { apiService } from '../services/api';

export default {
  name: 'SubmitForm',
  data() {
    return {
      formData: {
        name: '',
        email: '',
        message: ''
      },
      loading: false,
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      try {
        const response = await apiService.submitForm(this.formData);
        
        if (response.success) {
          this.successMessage = `提交成功！ID: ${response.data.id}`;
          this.formData = { name: '', email: '', message: '' };
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || '提交失败，请重试';
        console.error('提交错误:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.submit-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  background-color: #42b983;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
}
</style>