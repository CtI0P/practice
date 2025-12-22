<!-- 顶部搜索栏 -->
<template>
    <header>
        <div class="header-content">
            <div class="logo">
                <i class="fas fa-blog"></i>
                <span>我的博客</span>
            </div>
            
            <div class="search-bar">
                <form id="searchForm" @submit.prevent="handleSubmit">
                    <input 
                        type="text" 
                        placeholder="搜索文章、标签或作者..." 
                        v-model="searchInput"
                    >
                    <button type="submit"><i class="fas fa-search"></i> 搜索</button>
                </form>
            </div>
            
            
            <div class="user-info">
                <img 
                    :src="userInfo.avatar" 
                    alt="用户头像"
                >
                <span>{{ userInfo.name }}</span>
            </div>
        </div>
    </header>
</template>

<script>
    export default{
        name:"HeaderBar",
        data(){
            return {
                searchInput:'',
            }
        },
        props:{
            userInfo:{
                type:Object,
                required:true
            }
        },
        methods:{
            handleSubmit(){
                if(this.searchInput.trim()){
                    this.$emit('search',this.searchInput)
                    this.searchInput=''
                }
            }
        }
    }
</script>

<style scoped>
    .header {
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        padding: 1.5rem 2rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
    }

    .logo {
        display: flex;
        align-items: center;
        font-size: 1.8rem;
        font-weight: 700;
    }

    .logo i {
        margin-right: 10px;
        font-size: 2rem;
    }

    .search-bar {
        flex-grow: 1;
        max-width: 600px;
        margin: 0 2rem;
    }

    .search-bar form {
        display: flex;
    }

    .search-bar input {
        flex-grow: 1;
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 30px 0 0 30px;
        font-size: 1rem;
        outline: none;
    }

    .search-bar button {
        background-color: #ff7e5f;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 0 30px 30px 0;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }

    .search-bar button:hover {
        background-color: #ff6b47;
    }

    .user-info {
        display: flex;
        align-items: center;
    }

    .user-info img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
        border: 2px solid rgba(255, 255, 255, 0.5);
    }

    /* 响应式设计 */
    @media (max-width: 992px) {
        .header-content {
            flex-wrap: wrap;
        }
    
        .search-bar {
            order: 3;
            margin: 1rem 0 0 0;
            max-width: 100%;
        }
    }

    @media (max-width: 768px) {
        .header-content {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .logo {
            margin-bottom: 1rem;
        }
    
        .user-info {
            position: absolute;
            top: 1.5rem;
            right: 2rem;
        }
        
        .search-bar {
            width: 100%;
        }
    }
</style>