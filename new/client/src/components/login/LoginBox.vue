<!-- 登录框组件 -->
<template>
  <div class="login-container">
    <div class="login-header">
      <h1>欢迎回来</h1>
      <p>请登录您的账户</p>
    </div>
    
    <div class="login-body">
      <InputField 
        label="用户名 / 邮箱"
        type="text"
        placeholder="请输入用户名或邮箱"
        v-model="username"
        @focus="clearError"
      />
      
      <InputField 
        label="密码"
        type="password"
        placeholder="请输入密码"
        v-model="password"
        @focus="clearError"
        :hasError="hasError"
        :errorMessage="errorMessage"
      />
      
      <!-- 移除 v-model:rememberMe，使用 :rememberMe 和 @update:rememberMe -->
      <LoginOptions 
        :rememberMe="rememberMe"
        @update:rememberMe="rememberMe = $event"
        @forgotPassword="$emit('forgotPassword')"
        @register="$emit('toRegister')"
      />
      
      <button class="login-button" @click="login">登录</button>
      
      <div class="login-footer">
        还没有账户？<a href="#" style="color: #4776E6;" @click.prevent="$emit('register')">立即注册</a>
      </div>
    </div>
  </div>
</template>

<script>
import InputField from './InputField.vue'
import LoginOptions from './LoginOptions.vue'

export default {
  name: 'LoginBox',
  components: {
    InputField,
    LoginOptions
  },
  emits:['forgotPassword','register'],
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      hasError: false,
      errorMessage: ''
    }
  },
  methods: {
    login() {
      // 简单的验证逻辑
      if (!this.username || !this.password) {
        this.hasError = true;
        this.errorMessage = '请输入用户名和密码';
        return;
      }
      
      // 模拟登录成功
      this.hasError = false;
      alert(`登录成功！\n用户名: ${this.username}\n记住密码: ${this.rememberMe ? '是' : '否'}`);
    },
    handleForgotPassword() {
      alert('跳转到忘记密码页面');
      // 实际项目中这里会跳转到忘记密码页面
    },
    clearError() {
      this.hasError = false;
    }
  },
  
}
</script>

<style scoped>
.login-container {
  width: 420px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.login-header {
  background: linear-gradient(to right, #4776E6, #8E54E9);
  color: white;
  padding: 25px 20px;
  text-align: center;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.9;
}

.login-body {
  padding: 25px;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #4776E6, #8E54E9);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
}

.login-button:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #666;
}
</style>