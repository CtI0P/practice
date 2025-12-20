<!-- 博客文章 -->
<template>
    <div class="blog-post">
        <h2 class="post-title">{{ post.title }}</h2>
        <div class="post-meta">
            <span><i class="far fa-calendar"></i>{{ post.date }}</span>
            <span><i class="far fa-folder"></i> {{ post.category }}</span>
            <span><i class="far fa-eye"></i> {{ post.views }} 阅读</span>
            <span><i class="far fa-comments"></i> {{ post.comments }} 评论</span>
        </div>
        <p class="post-content">
            {{ post.content }}
        </p>
        <a href="#" class="read-more" @click.prevent="handleReadMore">继续阅读 <i class="fas fa-arrow-right"></i></a>
    </div>
</template>

<script>
    export default{
        name:"BlogPost",
        props:{
            post:{
                type:Object,
                required:true
            }
        },
        methods: {
            handleReadMore() {
                // 在实际应用中，这里会跳转到文章详情页
                alert(`正在加载文章: "${this.post.title}"`)
                this.$emit('read-more', this.post.id)   
            }
        }
    }
</script>

<style scoped>
    .blog-post {
        margin-bottom: 2.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #f0f0f0;
    }

    .blog-post:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }

    .post-title {
        font-size: 1.5rem;
        color: #2c3e50;
        margin-bottom: 0.8rem;
        cursor: pointer;
        transition: color 0.3s;
    }

    .post-title:hover {
        color: #6a11cb;
    }

    .post-meta {
        display: flex;
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .post-meta span {
        margin-right: 1.5rem;
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .post-meta i {
        margin-right: 5px;
    }

    .post-content {
        color: #555;
        margin-bottom: 1.2rem;
        line-height: 1.7;
    }

    .read-more {
        color: #6a11cb;
        text-decoration: none;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        cursor: pointer;
    }

    .read-more i {
        margin-left: 5px;
        transition: transform 0.3s;
    }

    .read-more:hover i {
        transform: translateX(5px);
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
        .post-meta {
            flex-direction: column;
        }
        
        .post-meta span {
            margin-right: 0;
            margin-bottom: 0.5rem;
        }
        
        .post-title {
            font-size: 1.3rem;
        }
    }
</style>