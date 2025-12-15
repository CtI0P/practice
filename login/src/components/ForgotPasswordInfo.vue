<!-- 左侧信息区域 -->
<template>
    <div class="info-section">
        <div class="logo">
            <i class="fas fa-shield-alt"></i>
            <span>安全中心</span>
        </div>
        
        <h1>忘记密码？<br>让我们帮您恢复账户</h1>
        <p>请输入您注册时使用的电子邮件地址，我们将向您发送重置密码的链接。</p>
        
        <div class="steps">
            <div class="step" v-for="(step,index) in steps" :key="index">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-text">
                    <h3>{{ step.title }}</h3>
                    <p>{{ step.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default{
        name:"ForgotPasswordInfo",
        data(){
            return{
                steps:[
                    {
                        title: '输入您的电子邮件',
                        description: '输入您账户关联的电子邮件地址'
                    },
                    {
                        title: '检查您的收件箱',
                        description: '我们会发送包含重置链接的邮件'
                    },
                    {
                        title: '创建新密码',
                        description: '点击邮件中的链接创建新密码'
                    }
                ]
            }
        }
    }
</script>

<style scoped>
    /* 左侧信息区域 */
    .info-section {
        flex: 1;
        background: linear-gradient(to bottom right, #4a6cf7, #2f4fd9);
        color: white;
        padding: 50px 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .logo {
        display: flex;
        align-items: center;
        margin-bottom: 40px;
        font-size: 24px;
        font-weight: 700;
    }
    
    .logo i {
        margin-right: 10px;
        font-size: 28px;
    }
    
    .info-section h1 {
        font-size: 32px;
        margin-bottom: 20px;
        line-height: 1.3;
    }
    
    .info-section p {
        font-size: 16px;
        line-height: 1.6;
        opacity: 0.9;
        margin-bottom: 30px;
    }
    
    .steps {
        margin-top: 30px;
    }
    
    .step {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
    }
    
    .step-number {
        width: 36px;
        height: 36px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-weight: 600;
        font-size: 16px;
    }
    
    .step-text h3 {
        font-size: 17px;
        margin-bottom: 5px;
    }
    
    .step-text p {
        font-size: 14px;
        margin-bottom: 0;
        opacity: 0.8;
    }

    @media (max-width: 768px) {
        .info-section {
            padding: 40px 30px;
        }
        
        .info-section h1 {
            font-size: 28px;
        }
    }

    @media (max-width: 480px) {
        .info-section {
            padding: 30px 20px;
        }
        
        .info-section h1 {
            font-size: 24px;
        }
        
        .step {
            margin-bottom: 20px;
        }
    }
</style>