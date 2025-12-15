<template>
  <div id="app">
    <LoginPage v-if="currentPage === 'login'" @showForgotPassword="switchToForgotPassword" @toRegister="switchToRegister"/>
    <ForgotPasswordPage v-else-if="currentPage === 'forgot-password'" @backToLogin="switchToLogin" />
    <RegisterPage v-else @backToLogin="switchToLogin"></RegisterPage>
  </div>

  
</template>

<script>
import LoginPage from './components/LoginPage.vue'
import ForgotPasswordPage from './components/ForgotPasswordPage.vue'
import RegisterPage from './components/RegisterPage.vue';

export default {
  name: 'App',
  components: {
    LoginPage,
    ForgotPasswordPage,
    RegisterPage
  },
  data(){
    return{
      currentPage:'login',
    }
  },
  methods:{
    switchToForgotPassword() {
      this.currentPage = 'forgot-password';
    },
    switchToLogin() {
      this.currentPage = 'login';
    },
    switchToRegister(){
      this.currentPage= 'register';
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

body {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>