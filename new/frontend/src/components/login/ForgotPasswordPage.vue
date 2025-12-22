<template>
    <div class="forgot-password-page">
        <div class="container">
            <ForgotPasswordInfo />
            <ForgotPasswordForm @back-to-login="$emit('backToLogin')" />
        </div>
    </div>
</template>

<script>
    import ForgotPasswordInfo from './ForgotPasswordInfo.vue'
    import ForgotPasswordForm from './ForgotPasswordForm.vue'

    export default {
        name: 'ForgotPasswordPage',
        components: {
            ForgotPasswordInfo,
            ForgotPasswordForm
        },
        emits: ['backToLogin']
    }
</script>

<style scoped>
    .forgot-password-page {
        width: 100%;
        max-width: 1000px;
        animation: fadeIn 0.5s ease-out;
    }

    .container {
        display: flex;
        width: 100%;
        min-height: 600px;
        background-color: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
        .container {
            flex-direction: column;
            max-width: 500px;
        }
    }

    @media (max-width: 480px) {
        .container {
            min-height: auto;
        }
    }
</style>