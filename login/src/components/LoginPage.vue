<!-- 主页面容器 -->
<template>
  <div class="login-page">
    <LoginBox @forgotPassword="$emit('showForgotPassword')" @register="$emit('toRegister')"/>
  </div>
</template>

<script>
import LoginBox from './LoginBox.vue'

export default {
  name: 'LoginPage',
  components: {
    LoginBox
  },
  emits:['showForgotPassword','toRegister']
}
</script>

<style scoped>
.login-page {
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>