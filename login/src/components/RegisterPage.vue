<template>
    <div class="container">
        <RegisterInfo></RegisterInfo>
        <RegisterForm @registration-success="handleRegistrationSuccess" @back-to-login="$emit('backToLogin')" ></RegisterForm>   
    </div>
</template>

<script>
    import RegisterForm from './RegisterForm.vue';
    import RegisterInfo from './RegisterInfo.vue';

    export default{
        name:"RegisterPage",
        components:{
            RegisterForm,
            RegisterInfo,
        },
        emits: ['backToLogin'],
        methods: {
            handleRegistrationSuccess(formData) {
                console.log('注册成功:', formData);
                // 这里可以处理注册成功后的逻辑
            }
        }
    }

</script>

<style>
    .container {
        display: flex;
        max-width: 1000px;
        width: 100%;
        background-color: white;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        min-height: 600px;
    }

    /* 响应式适配 */
    @media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
    }
</style>