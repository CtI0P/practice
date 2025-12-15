<template>
    <div class="successMessage">
        <div class="success-card">
            <div class="success-header">
                <i class="fas fa-check-circle"></i>
                <h3>重置链接已发送</h3>
            </div>
            <div class="success-body">
                <p>我们已向 <strong>{{ email }}</strong> 发送了密码重置链接。请在24小时内查看您的电子邮件并按照说明操作。</p>
                <p class="tip">
                    <i class="fas fa-info-circle"></i> 如果没有收到邮件，请检查垃圾邮件文件夹或稍后重试。
                </p>
            </div>
            <button @click="$emit('back-to-login')" class="back-button">
                <i class="fas fa-arrow-left"></i>
                返回登录
            </button>
            <!-- <router-link to="/"  class="back-button">
                <i class="fas fa-arrow-left"></i>
                返回登录
            </router-link> -->
        </div>
    </div>
</template>

<script>
    export default{
        name:"SuccessMessage",
        props:{
            email:{
                type:String,
                required:true
            },
        },
        emits:['back-to-login']
    }
</script>

<style scoped>
    .success-message-container {
        animation: fadeIn 0.5s ease-out;
    }

    .success-card {
        background-color: #e7f7ef;
        border-left: 4px solid #27ae60;
        padding: 25px;
        border-radius: 10px;
        margin-top: 30px;
    }

    .success-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
    }

    .success-header i {
        color: #27ae60;
        font-size: 28px;
        margin-right: 15px;
    }

    .success-header h3 {
        color: #2c3e50;
        margin: 0;
        font-size: 20px;
    }

    .success-body p {
        color: #555;
        line-height: 1.5;
        margin-bottom: 10px;
    }

    .success-body .tip {
        color: #7f8c8d;
        font-size: 14px;
        margin-top: 15px;
    }

    .success-body .tip i {
        margin-right: 8px;
    }

    .back-button {
        width: auto;
        padding: 12px 25px;
        background: #4a6cf7;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 20px;
    }

    .back-button:hover {
        background: #3a5ce5;
        transform: translateX(-3px);
    }
</style>