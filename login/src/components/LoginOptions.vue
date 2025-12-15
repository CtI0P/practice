<!-- 选项组件 -->
<template>
  <div class="login-options">
    <div class="remember-me">
      <input 
        type="checkbox" 
        id="remember" 
        :checked="rememberMe"
        @change="$emit('update:rememberMe', $event.target.checked)"
      >
      <label for="remember">记住密码</label>
    </div>
    <a href="#" class="forgot-password" @click.prevent="$emit('forgotPassword')">忘记密码？</a>
    
    <!-- <router-link to="/forgot-password" class="forgot-password">忘记密码？</router-link> -->

  </div>
</template>

<script>
export default {
  name: 'LoginOptions',
  props: {
    rememberMe: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:rememberMe', 'forgotPassword'],
  // emits: ['update:rememberMe'],
}
</script>

<style scoped>
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password {
  color: #4776E6;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #8E54E9;
  text-decoration: underline;
}
</style>