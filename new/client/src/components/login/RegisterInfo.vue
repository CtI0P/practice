<template>
    <div class="left-panel">
        <div class="logo">
            <i class="fas fa-cube"></i>
            <span>zzZ</span>
        </div>
        <h1 class="welcome-text">加入我们的社区</h1>
        <p class="welcome-desc">创建一个账户，解锁全部功能和专属内容，与我们一同成长。</p>
        
        <ul class="benefits">
            <li v-for="(benefit,index) in benefits" :key="index"><i class="fas fa-check"></i> {{ benefit.content }}</li>
        </ul>
    </div>
</template>

<script>
    export default {
        name:"RegisterInfo",
        data(){
            return {
                benefits:[
                    {
                        index:1,
                        content:"访问独家内容和功能",
                    },
                    {
                        index:2,
                        content:"个性化推荐和设置",
                    },
                    {
                        index:3,
                        content:"加入专业社区交流",
                    },
                    {
                        index:4,
                        content:"获得技术支持与更新",
                    }
                ]
            }
        },
    }
</script>

<style>
    .left-panel {
        flex: 1;
        background: linear-gradient(rgba(44, 83, 158, 0.85), rgba(44, 83, 158, 0.9)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80');
        background-size: cover;
        background-position: center;
        color: white;
        padding: 50px 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .logo {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
    }
    
    .logo i {
        margin-right: 10px;
        background-color: rgba(255, 255, 255, 0.2);
        padding: 10px;
        border-radius: 10px;
    }
    
    .welcome-text {
        font-size: 36px;
        font-weight: 700;
        margin-bottom: 15px;
        line-height: 1.2;
    }
    
    .welcome-desc {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 30px;
    }
    
    .benefits {
        list-style: none;
        margin-top: 30px;
    }
    
    .benefits li {
        margin-bottom: 15px;
        display: flex;
        align-items: center;
    }
    
    .benefits i {
        margin-right: 12px;
        background-color: rgba(255, 255, 255, 0.2);
        padding: 8px;
        border-radius: 50%;
        font-size: 14px;
    }

    /* 响应式适配 */
    @media (max-width: 768px) {
        .left-panel {
            padding: 40px 30px;
        }
        .welcome-text {
            font-size: 28px;
        }
    }
</style>