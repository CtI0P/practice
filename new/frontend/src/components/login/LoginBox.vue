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
        v-model="loginInfo.username"
        @focus="clearError"
      />
      
      <InputField 
        label="密码"
        type="password"
        placeholder="请输入密码"
        v-model="loginInfo.password"
        @focus="clearError"
        :hasError="hasError"
        :errorMessage="errorMessage"
      />

      <!-- <div class="input-group">
        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #333;">
          用户名 / 邮箱
        </label>
        <input
          type="text"
          placeholder="请输入用户名或邮箱"
          v-model="loginInfo.username"
          @focus="clearError"
          style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
        />
      </div>
      
      <div class="input-group" style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-size: 14px; color: #333;">
          密码
        </label>
        <input
          type="password"
          placeholder="请输入密码"
          v-model="loginInfo.password"
          @focus="clearError"
          style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
        />
      </div> -->
      
      <!-- 移除 v-model:rememberMe，使用 :rememberMe 和 @update:rememberMe -->
      <LoginOptions 
        :rememberMe="loginInfo.rememberMe"
        @update:rememberMe="loginInfo.rememberMe = $event"
        @forgotPassword="$emit('forgotPassword')"
        @register="$emit('toRegister')"
      />
      
      <button 
        class="login-button" 
        @click="login"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">登录</span>
        <span v-else>登录中...</span>
      </button>
      
      <div class="login-footer">
        还没有账户？<a href="#" style="color: #4776E6;" @click.prevent="$emit('register')">立即注册</a>
      </div>

      <!-- 登录成功提示 -->
      <div v-if="showSuccessMessage" class="success-message">
        <i class="fas fa-check-circle"></i> 登录成功！
      </div>
    </div>
  </div>
</template>

<script>
import InputField from './InputField.vue'
import LoginOptions from './LoginOptions.vue'
import {apiService} from '../../services/api'

export default {
  name: 'LoginBox',
  components: {
    InputField,
    LoginOptions
  },
  // login-success ???
  emits:['forgotPassword','register','login-success'],
  data() {
    return {
      loginInfo:{
        username: '',
        // email:'', 
        password: '',
        rememberMe: false,
      },
      hasError: false,
      errorMessage: '',
      isLoading: false,
      showSuccessMessage: false
    }
  },
  methods: {
    async login() {
      console.log('登录尝试 - username:', this.loginInfo.username, 'password:', this.loginInfo.password);
      if(!this.loginInfo.username || !this.loginInfo.password){
        this.hasError = true;
        this.errorMessage = '请输入用户名/邮箱和密码';
        return;
      }

      this.isLoading = true;
      this.hasError = false;
      this.errorMessage = '';

      try{
        const response = await apiService.loginUser({
          usernameOrEmail: this.loginInfo.username,
          password: this.loginInfo.password
        });

        console.log('登录响应:', response);

        

        if (response.success) {

          console.log('获取到的JWT Token:', response.data.token);
          // 登录成功
          this.showSuccessMessage = true;
          
          // 保存登录状态（实际项目中应该保存 token 到 localStorage 或 Vuex）
          const userData = response.data.user;
          const token = response.data.token;
          
          // 保存到 localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', token);
          
          if (this.loginInfo.rememberMe) {
            // 记住我：保存用户名/邮箱
            localStorage.setItem('rememberedUsername', this.loginInfo.username);
          } else {
            // 不记住我：清除保存的用户名
            localStorage.removeItem('rememberedUsername');
          }
          
          // 通知父组件登录成功
          this.$emit('login-success', {
            user: userData,
            token: token
          });
          
          // 1.5秒后重置表单
          setTimeout(() => {
            this.resetForm();
            this.showSuccessMessage = false;
          }, 1500);
          
        } else {
          // 登录失败（后端返回了错误）
          this.hasError = true;
          this.errorMessage = response.message || '登录失败';
        }
      }catch (error) {
        console.error('登录失败:', error);
        this.hasError = true;
        
        // 根据错误状态码显示不同的错误信息
        if (error.response) {
          switch (error.response.status) {
            case 400:
              this.errorMessage = '请填写完整信息';
              break;
            case 401:
              this.errorMessage = '密码错误';
              break;
            case 404:
              this.errorMessage = '用户不存在';
              break;
            case 500:
              this.errorMessage = '服务器错误，请稍后重试';
              break;
            default:
              this.errorMessage = '登录失败，请检查网络连接';
          }
        } else {
          this.errorMessage = '网络错误，请检查网络连接';
        }
        
      } finally {
        this.isLoading = false;
      }
      
    },
    handleForgotPassword() {
      alert('跳转到忘记密码页面');
      // 实际项目中这里会跳转到忘记密码页面
    },
    clearError() {
      this.hasError = false;
    },
    resetForm(){
      this.loginInfo = {
        password: '',
      };
    }
  },

  mounted() {
    // 如果之前选择了"记住我"，加载用户名/邮箱
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      this.loginInfo.username = rememberedUsername;
      this.loginInfo.rememberMe = true;
    }
  }
  
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