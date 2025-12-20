<template>
    <div class="right-panel">
        <div class="form-header">
            <h2>创建账户</h2>
            <p>填写以下信息完成注册</p>
        </div>
        
        <form @submit.prevent="handleSubmit">
            <div class="form-group" v-for="field in formFields" :key="field.id">
                <label :for="field.id">{{ field.label }}</label>
                <div class="input-with-icon">
                    <i :class="field.icon"></i>
                    <input 
                        :type="field.type" 
                        :id="field.id" 
                        :placeholder="field.placeholder" 
                        :required="field.required"
                        v-model="field.value"
                        @blur="validateField(field)"
                        @input="clearError(field)"
                        :class="{ 'error': field.error, 'success': field.success }"
                    >
                    <!-- 
                        @blur失去焦点就触发
                        @input在输入框内容发生变化后触发（在界面加载数据以前）
                    -->
                    <button
                        v-if="field.hasToggle"
                        type="button" 
                        class="password-toggle" 
                        @click="togglePasswordVisibility(field)"
                    >
                        <i :class="field.toggleIcon"></i>
                    </button>
                </div>
                <div v-if="field.error" class="error-message" :id="field.errorId">{{ field.errorMessage }}</div>
            </div>
            
            <div class="terms">
                <input type="checkbox" id="agreeTerms" required v-model="agreeTerms">
                <label for="agreeTerms">我已阅读并同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a></label>
            </div>
            
            <button type="submit" class="submit-btn" id="submitBtn" :disabled="isSubmitting">
                <span id="btnText">立即注册</span>
            </button>
            
            <div class="success-message" id="successMessage" v-if="showSuccessMessage">
                <i class="fas fa-check-circle"></i> 注册成功！正在跳转到登录页面...
            </div>
            
            <div class="login-link">
                已有账户？ <a href="#" @click.prevent="$emit('back-to-login')">立即登录</a>
            </div>
        </form>
    </div>
</template>

<script>
    import {apiService} from '../../services/api'
    export default {
        name:"RegisterForm",
        data(){
            return {
                formFields:[
                    {
                        id:"username",
                        label:"用户名",
                        type: 'text',
                        icon: 'fas fa-user',
                        placeholder: '请输入用户名',
                        required: true,
                        errorId: 'username-error',
                        errorMessage: '用户名必须为3-20个字符，只能包含字母、数字和下划线',
                        error: false,
                        value: '',
                        validation: (value) => /^[a-zA-Z0-9_]{3,20}$/.test(value)
                    },
                    {
                        id: 'email',
                        label: '电子邮箱',
                        type: 'email',
                        icon: 'fas fa-envelope',
                        placeholder: '请输入电子邮箱',
                        required: true,
                        errorId: 'email-error',
                        errorMessage: '请输入有效的电子邮箱地址',
                        error: false,
                        value: '',
                        validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    },
                    {
                        id: 'password',
                        label: '密码',
                        type: 'password',
                        icon: 'fas fa-lock',
                        placeholder: '请输入密码',
                        required: true,
                        errorId: 'password-error',
                        errorMessage: '密码必须至少8个字符，包含字母和数字',
                        error: false,
                        value: '',
                        hasToggle: true,
                        toggleIcon: 'fas fa-eye',
                        showPassword: false,
                        validation: (value) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value)
                    },
                    {
                        id: 'confirmPassword',
                        label: '确认密码',
                        type: 'password',
                        icon: 'fas fa-lock',
                        placeholder: '请再次输入密码',
                        required: true,
                        errorId: 'confirmPassword-error',
                        errorMessage: '两次输入的密码不一致',
                        error: false,
                        value: '',
                        hasToggle: true,
                        toggleIcon: 'fas fa-eye',
                        showPassword: false,
                        validation: (value, fields) => {
                            const passwordField = fields.find(f => f.id === 'password');
                            return value === passwordField.value;
                        }
                    }
                ],
                agreeTerms: false,
                isSubmitting: false,
                showSuccessMessage: false
            }
        },
        methods: {
            togglePasswordVisibility(field) {
                field.showPassword = !field.showPassword;
                field.type = field.showPassword ? 'text' : 'password';
                field.toggleIcon = field.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            },
            
            validateField(field) {
                if (!field.value.trim()) {
                    field.error = true;
                    field.success = false;
                    return false;
                }
            
                let isValid;
                if (field.id === 'confirmPassword') {
                    isValid = field.validation(field.value, this.formFields);
                } else {
                    isValid = field.validation(field.value);
                }
            
                field.error = !isValid;
                field.success = isValid;
                
                return isValid;
            },
            
            clearError(field) {
                if (field.error) {
                    field.error = false;
                    field.success = false;
                }
            
                // 如果修改了密码，重新验证确认密码
                if (field.id === 'password') {
                    const confirmField = this.formFields.find(f => f.id === 'confirmPassword');
                    if (confirmField.value) {
                    this.validateField(confirmField);
                    }
                }
            },
            
            validateForm() {
                let isValid = true;
                this.formFields.forEach(field => {
                    const fieldValid = this.validateField(field);
                    if (!fieldValid) isValid = false;
                });
            
                if (!this.agreeTerms) {
                    alert("请阅读并同意服务条款和隐私政策");
                    return false;
                }
                
                return isValid;
            },
            
            async handleSubmit() {
                if (!this.validateForm()) {
                    return;
                }
                
                this.isSubmitting = true;
                
                try {
                    await apiService.submitForm({
                        username: this.formFields.find(f => f.id === 'username').value,
                        email: this.formFields.find(f => f.id === 'email').value,
                        password: this.formFields.find(f => f.id === 'password').value
                    });
                    
                    this.showSuccessMessage = true;
                    
                    // 准备表单数据传递给父组件
                    const formData = this.formFields.reduce((data, field) => {
                        data[field.id] = field.value;
                        return data;
                    }, {});
                    
                    // 向父组件发送成功事件
                    this.$emit('registration-success', formData);
                    
                    // 3秒后重置表单
                    setTimeout(() => {
                        this.resetForm();
                        this.isSubmitting = false;
                        this.showSuccessMessage = false;
                    }, 3000);
                    
                } catch (error) {
                    console.error('注册失败:', error);
                    this.isSubmitting = false;
                    alert('注册失败，请稍后重试');
                }
            },
            
            // mockRegistrationApi() {
            //     return new Promise((resolve) => {
            //         setTimeout(() => {
            //         resolve({ success: true });
            //         }, 2000);
            //     });
            // },
            
            resetForm() {
                this.formFields.forEach(field => {
                    field.value = '';
                    field.error = false;
                    field.success = false;
                    if (field.hasToggle) {
                        field.type = 'password';
                        field.toggleIcon = 'fas fa-eye';
                        field.showPassword = false;
                    }
                });
                this.agreeTerms = false;
            }
        }
    }
</script>

<style scoped>
    .right-panel {
        flex: 1;
        padding: 50px 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .form-header {
        margin-bottom: 30px;
    }

    .form-header h2 {
        font-size: 28px;
        font-weight: 700;
        color: #2c539e;
        margin-bottom: 8px;
    }

    .form-header p {
        color: #666;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
    }

    .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;
    }

    /* .input-with-icon i {
        position: absolute;
        left: 15px;
        color: #999;
        font-size: 16px;
    } */

    .input-with-icon i {
        position: absolute;
        left: 15px;
        color: #999;
        font-size: 16px;
        top: 50%;
        transform: translateY(-50%);
    }

    /* .input-with-icon input {
        width: 100%;
        padding: 12px 12px 12px 45px;
        border: 2px solid #e1e5eb;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.3s;
    } */

    .input-with-icon input {
        width: 100%;
        padding: 12px 12px 12px 45px;
        border: 2px solid #e1e5eb;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.3s;
    }

    .input-with-icon input:focus {
        outline: none;
        border-color: #2c539e;
    }

    .input-with-icon input.error {
        border-color: #e74c3c;
    }

    .input-with-icon input.success {
        border-color: #2ecc71;
    }

    /* .password-toggle {
        position: absolute;
        right: 10px;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 5px;
    } */

    .password-toggle {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 5px;
    }

    .error-message {
        color: #e74c3c;
        font-size: 14px;
        margin-top: 5px;
    }

    .terms {
        display: flex;
        align-items: center;
        margin: 20px 0 30px;
    }

    .terms input {
        margin-right: 10px;
    }

    .terms label {
        font-size: 14px;
        color: #666;
    }

    .terms a {
        color: #2c539e;
        text-decoration: none;
    }

    .terms a:hover {
        text-decoration: underline;
    }

    .submit-btn {
        background-color: #2c539e;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 15px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s;
        width: 100%;
    }

    .submit-btn:hover:not(:disabled) {
        background-color: #1e3d6f;
    }

    .submit-btn:disabled {
        background-color: #95a5c9;
        cursor: not-allowed;
    }

    .success-message {
        margin-top: 20px;
        padding: 12px;
        background-color: #d4edda;
        color: #155724;
        border-radius: 8px;
        text-align: center;
    }

    .login-link {
        margin-top: 25px;
        text-align: center;
        color: #666;
    }

    .login-link a {
        color: #2c539e;
        text-decoration: none;
        font-weight: 600;
    }

    .login-link a:hover {
        text-decoration: underline;
    }

    /* 响应式适配 */
    @media (max-width: 768px) {
        .right-panel {
            padding: 40px 30px;
        }
    }
</style>