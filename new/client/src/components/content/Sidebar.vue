<!-- 左侧导航栏 -->
<template>
    <aside class="sidebar">
        <div class="nav-section">
            <h3 class="nav-title">导航菜单</h3>
            <ul class="nav-links">
                <li 
                    v-for="item in navItems" 
                    :key="item.id"
                    @click=" handleNavClick(navItem)"
                >
                    <a href="#" :class="{active:item.active}">
                            <i :class="item.icon"></i> 
                            {{ item.text }}
                    </a>
                </li>
            </ul>
        </div>
        
        <div class="nav-section">
            <h3 class="nav-title">文章分类</h3>
            <ul class="nav-links">
                <li 
                    v-for="category in categories"
                    :key="category.id"
                    @click="handleCategoryClick(category.text)"
                >
                    <a href="#">
                        <i class="fas fa-code"></i> 
                        {{ category.text }}
                        <span class="count">(12)</span>
                    </a>
                </li>
            </ul>
        </div>
        
        <div class="blog-stats">
            <h3 class="nav-title">博客统计</h3>
            <div class="stat-item" v-for="stat in blogStats" :key="stat.id">
                <span>{{ stat.stat }}</span>
                <strong>{{ stat.total }}</strong>
            </div>
        </div>
    </aside>
</template>

<script>
    export default{
        name:'Siderbar',
        props:{
            navItems: {
                type: Array,
                required: true
            },
            categories: {
                type: Array,
                required: true
            },
            blogStats: {
                type: Array,
                required: true
            }
        },
        data(){
            return{
                selectedCategory: null
            }
        },
        methods:{
            handleNavClick(navItem){
                this.$emit('nav-click',navItem)
            },
             handleCategoryClick(category){
                this.selectedCategory=category
                this.$emit('category-click',category)
            },
        }
    }
</script>

<style scoped>
    .sidebar {
        width: 250px;
        background-color: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        margin-right: 2rem;
        height: fit-content;
    }

    .nav-section {
        margin-bottom: 2rem;
    }

    .nav-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #6a11cb;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #f0f0f0;
    }

    .nav-links {
        list-style: none;
    }

    .nav-links li {
        margin-bottom: 0.8rem;
        cursor: pointer;
    }

    .nav-links a {
        display: flex;
        align-items: center;
        color: #555;
        text-decoration: none;
        padding: 0.6rem 0.8rem;
        border-radius: 8px;
        transition: all 0.3s;
    }

    .nav-links a:hover {
        background-color: #f0f5ff;
        color: #6a11cb;
        transform: translateX(5px);
    }

    .nav-links a.active {
        background-color: #eef2ff;
        color: #6a11cb;
        font-weight: 600;
    }

    .nav-links i {
        margin-right: 10px;
        width: 20px;
        text-align: center;
    }

    .count {
        margin-left: auto;
        font-size: 0.9rem;
        color: #888;
    }

    .blog-stats {
        background: linear-gradient(to right, #fdfcfb, #f1f7ff);
        padding: 1rem;
        border-radius: 10px;
        margin-top: 2rem;
        border-left: 4px solid #6a11cb;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
    }

    /* 响应式设计 */
    @media (max-width: 992px) {
        .sidebar {
            width: 100%;
            margin-right: 0;
            margin-bottom: 2rem;
        }
    }
</style>