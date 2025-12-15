<!-- 右侧信息区域 -->
<template>
    <div class="form-section">
        <div class="form-header">
            <h2>重置密码</h2>
            <p>请输入您的电子邮件地址以接收密码重置链接</p>
        </div>
        
        <form @click.prevent="submitForm" v-if="!isSubmitted">
            <div class="form-group">
                <label for="email">电子邮件地址</label>
                <div class="input-with-icon">
                    <i class="fas fa-envelope"></i>
                    <input 
                        type="email" 
                        id="email" 
                        v-model="email"
                        placeholder="example@domain.com" 
                        required
                        @input="validateEmail"
                    >
                </div>
                <div class="error-message" :class="{show:hasError}">{{ errorMessage }}</div>
                <div class="success-message" :class="{show:hasSuccess}">{{ successMessage }}</div>
            </div>
            
            <button type="submit" :disabled="isSubmitting">
                <i :class="submitIcon"></i>
                {{ submitText }}
            </button>
        </form>

        <!-- 成功消息区域 -->
        <SuccessMessage
            v-else
            :email="email"
            @back-to-login="$emit('back-to-login')" 
        />
        
        <div class="back-to-login" v-if="!isSubmitted">
            <p>记起密码了？
                <a href="#" @click.prevent="$emit('back-to-login')">返回登录</a>
                <!-- <router-link to="/">返回登陆</router-link> -->
            </p>
        </div>
    </div>
</template>

<script>
    import SuccessMessage from './SuccessMessage.vue';

    export default{
        name:"ForgotPasswordForm",
        components:{
            SuccessMessage,
        },
        data(){
            return{
                email: '',
                hasError: false,
                hasSuccess: false,
                errorMessage: '',
                successMessage: '',
                isSubmitting: false,
                isSubmitted: false,
                exampleEmails: ['user@example.com', 'customer@domain.com', 'test@test.org']
            }
        },
        computed:{
            submitText() {
                return this.isSubmitting ? '发送中...' : '发送重置链接'
            },
            submitIcon() {
                return this.isSubmitting ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'
            }
        },
        methods: {
            validateEmail() {
                const email = this.email.trim();
                
                if (email === '') {
                    this.hasError = false;
                    this.hasSuccess = false;
                    return;
                }
                
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                
                if (isValid) {
                    this.hasSuccess = true;
                    this.hasError = false;
                    this.successMessage = '电子邮件地址格式正确';
                } else {
                    this.hasError = true;
                    this.hasSuccess = false;
                    this.errorMessage = '请输入有效的电子邮件地址';
                }
            },
            
            submitForm() {
                const email = this.email.trim();
                
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    this.hasError = true;
                    this.errorMessage = '请输入有效的电子邮件地址';
                    return;
                }
                
                this.isSubmitting = true;
                
                // 模拟API请求
                setTimeout(() => {
                    this.isSubmitting = false;
                    this.isSubmitted = true;
                    
                    // 在实际应用中，这里会调用API
                    console.log('发送重置链接到:', email);
                }, 1500);
            },
        },
        emits: ['back-to-login']
    }
</script>

<style scoped>
    /* 右侧表单区域 */
    .form-section {
        flex: 1;
        padding: 50px 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .form-header {
        margin-bottom: 40px;
    }
    
    .form-header h2 {
        color: #2c3e50;
        font-size: 28px;
        margin-bottom: 10px;
    }
    
    .form-header p {
        color: #7f8c8d;
        font-size: 15px;
    }
    
    .form-group {
        margin-bottom: 25px;
        position: relative;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        color: #2c3e50;
        font-weight: 600;
        font-size: 15px;
    }
    
    .input-with-icon {
        position: relative;
    }
    
    .input-with-icon i {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #95a5a6;
        font-size: 18px;
    }
    
    input {
        width: 100%;
        padding: 15px 15px 15px 50px;
        border: 2px solid #e8f0fe;
        border-radius: 10px;
        font-size: 16px;
        transition: all 0.3s;
        background-color: #f9fafe;
    }
    
    input:focus {
        outline: none;
        border-color: #4a6cf7;
        background-color: white;
        box-shadow: 0 5px 15px rgba(74, 108, 247, 0.1);
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 14px;
        margin-top: 5px;
        display: none;
    }
    
    .success-message {
        color: #27ae60;
        font-size: 14px;
        margin-top: 5px;
        display: none;
    }
    
    button {
        width: 100%;
        padding: 16px;
        background: linear-gradient(to right, #4a6cf7, #2f4fd9);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    button:hover {
        background: linear-gradient(to right, #3a5ce5, #1f3fc7);
        box-shadow: 0 7px 20px rgba(74, 108, 247, 0.3);
        transform: translateY(-2px);
    }
    
    button:active {
        transform: translateY(0);
    }
    
    button i {
        margin-right: 8px;
    }
    
    .back-to-login {
        text-align: center;
        margin-top: 30px;
        color: #7f8c8d;
        font-size: 15px;
    }
    
    .back-to-login a {
        color: #4a6cf7;
        text-decoration: none;
        font-weight: 600;
    }
    
    .back-to-login a:hover {
        text-decoration: underline;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
        .form-section {
            padding: 40px 30px;
        }
    }

    @media (max-width: 480px) {
        .form-section {
            padding: 30px 20px;
        }
        
        .form-header h2 {
            font-size: 24px;
        }
    }
</style>