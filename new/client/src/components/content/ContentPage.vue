<template>
    <div class="container">
        <HeaderBar 
            :user-info="userInfo" 
            @search="handleSearch"
        />
        
        <div class="main-content">
            <Sidebar 
                :nav-items="navItems" 
                :categories="categories" 
                :blog-stats="blogStats"
                @category-click="handleCategoryClick"
                @nav-click="handleNavClick"
            />
            <ContentArea
                :posts="filteredPosts" 
                @new-post="handleNewPost"
            />
        </div>
    </div>
</template>

<script>
    import HeaderBar from './HeaderBar.vue';
    import Sidebar from './Sidebar.vue';
    import ContentArea from './ContentArea.vue';

    export default{
        name:"ContentPage",
        components:{
            HeaderBar,
            Sidebar,
            ContentArea,
        },
        data(){
            return{
                userInfo:{
                    name:'',
                    avatar:'',
                },
                navItems:[
                    { id: 1, icon: 'fas fa-home', text: '首页', active: true },
                    { id: 2, icon: 'fas fa-pen', text: '写文章' },
                    { id: 3, icon: 'fas fa-folder', text: '文章分类' },
                    { id: 4, icon: 'fas fa-tags', text: '标签管理' },
                    { id: 5, icon: 'fas fa-comments', text: '评论管理' },
                    { id: 6, icon: 'fas fa-chart-bar', text: '数据统计' },
                    { id: 7, icon: 'fas fa-cog', text: '系统设置' }
                ],
                categories: [
                    // 后面再改成动态的
                    { id: 1, icon: 'fas fa-code', text: '编程技术', count: 12 },
                    { id: 2, icon: 'fas fa-paint-brush', text: '设计艺术', count: 8 },
                    { id: 3, icon: 'fas fa-book', text: '读书笔记', count: 5 },
                    { id: 4, icon: 'fas fa-plane', text: '旅行见闻', count: 7 },
                    { id: 5, icon: 'fas fa-utensils', text: '美食生活', count: 4 }
                ],
                blogStats: [
                    // 后面再改成动态的
                    { id: 1, stat:"totalPosts",total: 12 },
                    { id: 2, stat:"categories",total: 8 },
                    { id: 3, stat:"totalComments",total: 5 },
                    { id: 4, stat:"totalViews",total: 7 },
                ]   ,
                posts: [
                    // 后面要动态实现
                    {
                        id: 1,
                        title: 'Vue.js 3.0 新特性全面解析',
                        date: '2023年10月15日',
                        category: '编程技术',
                        views: 256,
                        comments: 12,
                        content: 'Vue.js 3.0 带来了许多激动人心的新特性，包括 Composition API、性能改进、更好的 TypeScript 集成等。在这篇文章中，我们将深入探讨这些新功能，并通过实际示例展示如何利用它们来构建更高效、更易维护的应用程序...'
                    },
                    {
                        id: 2,
                        title: '响应式设计的最佳实践',
                        date: '2023年10月10日',
                        category: '设计艺术',
                        views: 189,
                        comments: 8,
                        content: '在移动设备使用越来越普遍的今天，响应式设计已经成为Web开发的基本要求。本文将介绍响应式设计的最佳实践，包括移动优先的策略、灵活的网格布局、媒体查询的高级用法以及性能优化技巧...'
                    },
                    {
                        id: 3,
                        title: '探索日本京都的古都文化',
                        date: '2023年10月5日',
                        category: '旅行见闻',
                        views: 312,
                        comments: 15,
                        content: '京都是日本保存最完好的古都之一，拥有超过1600座佛教寺庙和400座神道教神社。从金阁寺的辉煌到清水寺的宁静，从哲学之路的漫步到祇园的艺伎文化，这座城市的每个角落都散发着浓厚的历史气息...'
                    },
                    {
                        id: 4,
                        title: '深入理解JavaScript闭包',
                        date: '2023年9月28日',
                        category: '编程技术',
                        views: 421,
                        comments: 21,
                        content: '闭包是JavaScript中一个强大而又常被误解的概念。本文将通过清晰的示例解释闭包的工作原理，探讨闭包在实际开发中的应用场景，以及如何避免常见的内存泄漏问题...'
                    }
                ],
                searchKeyword: '',
                selectedCategory: null
            }
        },
        computed: {
            filteredPosts() {
                if (!this.searchKeyword && !this.selectedCategory) {
                    return this.posts
                }
                
                return this.posts.filter(post => {
                    const matchesSearch = !this.searchKeyword || 
                    post.title.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
                    post.content.toLowerCase().includes(this.searchKeyword.toLowerCase())
                    
                    const matchesCategory = !this.selectedCategory || 
                    post.category === this.selectedCategory
                    
                    return matchesSearch && matchesCategory
                })
            }
        },
        methods: {
            handleSearch(keyword) {
                this.searchKeyword = keyword
            },
            handleCategoryClick(category) {
                this.selectedCategory = category === this.selectedCategory ? null : category
            },
            handleNavClick(navItem) {
            // 更新导航项的激活状态
                this.navItems = this.navItems.map(item => ({
                    ...item,
                    active: item.id === navItem.id
                }))
                
                // 在实际应用中，这里可能会加载不同的页面内容
                console.log(`切换到: ${navItem.text}`)
            },
            handleNewPost() {
                alert('跳转到新建文章页面')
                // 在实际应用中，这里会跳转到新建文章页面
            }
        }
    }
</script>

<style scoped>
    .container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .main-content {
        display: flex;
        flex: 1;
        max-width: 1400px;
        margin: 2rem auto;
        width: 100%;
        padding: 0 1.5rem;
    }

    .footer {
        background-color: #2c3e50;
        color: #ecf0f1;
        text-align: center;
        padding: 2rem;
        margin-top: 3rem;
    }

    .footer-content {
        max-width: 1400px;
        margin: 0 auto;
    }

    .social-links {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
    }

    .social-links a {
        color: #ecf0f1;
        font-size: 1.2rem;
        margin: 0 0.8rem;
        transition: color 0.3s;
    }

    .social-links a:hover {
        color: #6a11cb;
    }

    /* 响应式设计 */
    @media (max-width: 992px) {
        .main-content {
            flex-direction: column;
        }
    }

    @media (max-width: 768px) {
        .main-content {
            padding: 0 1rem;
        }
    }
</style>