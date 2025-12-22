<template>
  <div id="app">
    <LoginPage 
      v-if="currentPage === 'login'" 
      @showForgotPassword="switchToForgotPassword" 
      @toRegister="switchToRegister"
      @toContent="switchToContent"
    />
    <ForgotPasswordPage v-else-if="currentPage === 'forgot-password'" @backToLogin="switchToLogin" />
    <RegisterPage v-else-if="currentPage === 'register'" @backToLogin="switchToLogin"></RegisterPage>
    <ContentPage v-else @logout="switchToLogin" />
  </div>

  
</template>

<script>
import LoginPage from './components/login/LoginPage.vue'
import ForgotPasswordPage from './components/login/ForgotPasswordPage.vue'
import RegisterPage from './components/login/RegisterPage.vue'
import ContentPage from './components/content/ContentPage.vue'

export default {
  name: 'App',
  components: {
    LoginPage,
    ForgotPasswordPage,
    RegisterPage,
    ContentPage
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
    },
    switchToContent(){
      this.currentPage= 'content';
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