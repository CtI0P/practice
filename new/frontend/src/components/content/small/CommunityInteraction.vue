<template>
  <div class="community-interaction">
    <div class="community-header">
      <h2>社区互动</h2>
      <p>与平台用户交流互动，分享学习心得</p>
      <button class="btn btn-primary" @click="showNewPostModal = true">
        <i class="fas fa-plus"></i> 发布新帖子
      </button>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-container">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-if="!loading && posts.length === 0" class="empty-state">
        <i class="fas fa-comments"></i>
        <h3>暂无帖子</h3>
        <p>成为第一个发布帖子的人吧！</p>
        <button class="btn btn-primary" @click="showNewPostModal = true">
          <i class="fas fa-plus"></i> 发布新帖子
        </button>
      </div>

      <div v-for="post in posts" :key="post.id" class="post-item">
        <div class="post-header">
          <div class="post-avatar">
            <div class="avatar-placeholder">
              {{ post.author_name ? post.author_name.charAt(0) : '?' }}
            </div>
          </div>
          <div class="post-info">
            <strong>{{ post.author_name || '用户' }}</strong>
            <span class="post-time">{{ formatTime(post.created_at) }}</span>
          </div>
        </div>
        
        <div class="post-content">
          <p>{{ post.content }}</p>
        </div>
        
        <!-- 评论区域 -->
        <div class="comments-section">
          <!-- 评论列表 -->
          <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <div class="avatar-placeholder small">
                {{ comment.author_name ? comment.author_name.charAt(0) : '?' }}
              </div>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <strong>{{ comment.author_name || '用户' }}</strong>
                <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
              </div>
              <div class="comment-body">
                <p>{{ comment.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- 添加评论输入框 -->
          <div class="comment-input-section">
            <textarea 
              v-model="newComments[post.id]"
              placeholder="写下你的评论..."
              rows="2"
            ></textarea>
            <button 
              @click="submitComment(post.id)" 
              class="btn btn-primary"
              :disabled="!newComments[post.id]"
            >
              发表评论
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布新帖子模态框 -->
    <div v-if="showNewPostModal" class="modal-overlay" @click.self="showNewPostModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>发布新帖子</h3>
          <button class="close-btn" @click="showNewPostModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="newPost.content"
            placeholder="你想分享什么？"
            rows="6"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showNewPostModal = false">
            取消
          </button>
          <button 
            class="btn btn-primary" 
            @click="submitNewPost"
            :disabled="!newPost.content"
          >
            发布
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from '@/services/api';

export default {
  name: 'CommunityInteraction',
  data() {
    return {
      posts: [],
      loading: true,
      showNewPostModal: false,
      newPost: {
        user_id: null, // 从登录状态获取
        content: ''
      },
      newComments: {}
    };
  },
  
  created() {
    // 从localStorage获取当前用户ID
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.newPost.user_id = user.id;
    
    this.fetchPosts();
  },
  
  methods: {
    async fetchPosts() {
      this.loading = true;
      try {
        const response = await apiService.getCommunityPosts();
        
        if (response.success) {
          this.posts = response.data;
        } else {
          this.$message.error('获取帖子失败');
        }
      } catch (error) {
        console.error('获取帖子失败:', error);
        this.$message.error('获取帖子失败');
        
        // 降级：使用模拟数据
        this.useMockData();
      } finally {
        this.loading = false;
      }
    },
    
    async submitNewPost() {
      if (!this.newPost.content.trim()) {
        this.$message.warning('请输入帖子内容');
        return;
      }
      
      if (!this.newPost.user_id) {
        this.$message.warning('请先登录');
        return;
      }
      
      try {
        const response = await apiService.createPost(this.newPost);
        
        if (response.success) {
          // 将新帖子添加到列表顶部
          this.posts.unshift({
            ...response.data,
            comments: []
          });
          
          this.$message.success('帖子发布成功');
          this.newPost.content = '';
          this.showNewPostModal = false;
        }
      } catch (error) {
        console.error('发布帖子失败:', error);
        this.$message.error('发布失败，请重试');
      }
    },
    
    async submitComment(postId) {
      const content = this.newComments[postId];
      
      if (!content || !content.trim()) {
        this.$message.warning('请输入评论内容');
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        this.$message.warning('请先登录');
        return;
      }
      
      try {
        const response = await apiService.createComment(postId, {
          user_id: user.id,
          content: content
        });
        
        if (response.success) {
          // 找到对应的帖子，添加评论
          const post = this.posts.find(p => p.id === postId);
          if (post) {
            post.comments = post.comments || [];
            post.comments.push(response.data);
            this.$message.success('评论发表成功');
          }
          
          // 清空输入框
          this.$set(this.newComments, postId, '');
        }
      } catch (error) {
        console.error('发表评论失败:', error);
        this.$message.error('评论发表失败');
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '刚刚';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;
      
      return date.toLocaleDateString('zh-CN');
    },
    
    useMockData() {
      this.posts = [
        {
          id: 1,
          content: 'Python装饰器的最佳实践是什么？最近在教学中发现很多同学对装饰器的理解不够深入，想和大家探讨一下Python装饰器的最佳实践。有没有什么好的例子或者使用场景可以分享？',
          author_name: '张老师',
          created_at: '2025-12-24T09:44:10Z',
          comments: [
            {
              id: 1,
              content: '我觉得装饰器在日志记录和性能监控方面特别有用！',
              author_name: '李同学',
              created_at: '2025-12-24T10:44:10Z'
            },
            {
              id: 2,
              content: '使用functools.wraps可以保持被装饰函数的元信息。',
              author_name: '刘同学',
              created_at: '2025-12-24T11:44:10Z'
            }
          ]
        },
        {
          id: 2,
          content: '如何高效学习前端框架？最近在学习Vue和React，感觉知识点很多，有点混乱。请问大家有什么好的学习方法或者学习路线推荐吗？',
          author_name: '赵同学',
          created_at: '2025-12-24T08:44:10Z',
          comments: [
            {
              id: 3,
              content: '建议先掌握一个框架的核心理念，再去对比学习其他框架。',
              author_name: '钱老师',
              created_at: '2025-12-24T09:44:10Z'
            }
          ]
        }
      ];
    }
  }
};
</script>

<style scoped>
.community-interaction {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.community-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.community-header h2 {
  font-size: 24px;
  margin-bottom: 5px;
}

.community-header p {
  color: #6c757d;
  margin-bottom: 15px;
}

.posts-container {
  margin-top: 20px;
}

.loading, .empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #dee2e6;
}

.empty-state h3 {
  margin-bottom: 10px;
}

.post-item {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.post-avatar {
  margin-right: 12px;
}

.avatar-placeholder {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.avatar-placeholder.small {
  width: 35px;
  height: 35px;
  font-size: 14px;
}

.post-info {
  flex: 1;
}

.post-info strong {
  display: block;
  margin-bottom: 4px;
}

.post-time {
  font-size: 12px;
  color: #868e96;
}

.post-content {
  margin-bottom: 20px;
  line-height: 1.6;
}

.comments-section {
  border-top: 1px solid #f1f3f5;
  padding-top: 15px;
}

.comment-item {
  display: flex;
  margin-bottom: 15px;
}

.comment-avatar {
  margin-right: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-header strong {
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #868e96;
}

.comment-body p {
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
}

.comment-input-section {
  margin-top: 15px;
}

.comment-input-section textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  resize: vertical;
  font-size: 14px;
  margin-bottom: 10px;
}

.comment-input-section textarea:focus {
  outline: none;
  border-color: #4361ee;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4361ee;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3a0ca3;
}

.btn-primary:disabled {
  background: #868e96;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-outline:hover {
  background: #f8f9fa;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 20px;
}

.modal-body {
  padding: 20px;
}

.modal-body textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  resize: vertical;
  font-size: 14px;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #4361ee;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>