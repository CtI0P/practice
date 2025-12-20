<!-- 右侧内容 -->
<template>
    <main class="content-area">
        <div class="content-header">
            <h1 class="content-title">最新文章</h1>
            <button class="new-post-btn" @click="handleNewPost">
                <i class="fas fa-plus"></i> 
                写新文章
            </button>
        </div>

        <div v-if="posts.length===0" class="no-posts">
            <i class="fas fa-search fa-2x"></i>
            <h3>没有找到相关文章</h3>
            <p>尝试使用不同的搜索词或选择其他分类</p>
        </div>
        
        <BlogPost 
            v-for="post in posts" 
            :key="post.id"
            :post="post"
        />
    </main>
</template>

<script>
    import BlogPost from './BlogPost.vue';
    export default{
        name:"ContentArea",
        components:{
            BlogPost,
        },
        props:{
            posts: {
                type: Array,
                required: true
            }
        },
        methods:{
            handleNewPost() {
                this.$emit('new-post')
            }
        }
    }
</script>

<style scoped>
    .content-area {
        flex: 1;
        background-color: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }

    .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;
    }

    .content-title {
        font-size: 1.8rem;
        color: #333;
    }

    .new-post-btn {
        background: linear-gradient(to right, #6a11cb, #2575fc);
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        transition: transform 0.2s;
    }

    .new-post-btn:hover {
        transform: translateY(-2px);
    }

    .new-post-btn i {
        margin-right: 8px;
    }

    .no-posts {
        text-align: center;
        padding: 4rem 2rem;
        color: #888;
    }

    .no-posts i {
        margin-bottom: 1rem;
        color: #ddd;
    }

    .no-posts h3 {
        margin-bottom: 0.5rem;
        color: #666;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
        .content-header {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .new-post-btn {
            margin-top: 1rem;
        }
        
        .content-area {
            padding: 1.5rem;
        }
    }
</style>