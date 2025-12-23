<template>
  <div class="user-management-content">
    <div class="content-section">
      <div class="table-header">
        <h2 class="section-title">用户列表</h2>
        <div class="table-stats">
          <span v-if="!loading">共 {{ totalUsers }} 个用户</span>
          <span v-else>加载中...</span>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>正在加载用户数据...</span>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="userList.length === 0" class="empty-state">
        <i class="fas fa-users"></i>
        <h3>暂无用户数据</h3>
        <p>没有找到任何用户记录</p>
      </div>

      <!-- 用户表格 -->
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key">
                {{ column.title }}
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userList" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-small" :style="{ backgroundColor: getRandomColor() }">
                    {{ getUserInitials(user.name) }}
                  </div>
                  <div class="user-info-small">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ user.role }}</td>
              <td>{{ user.joinDate }}</td>
              <td>{{ user.lastLogin }}</td>
              <td>
                <span class="status-badge" :class="user.status">
                  {{ user.status === 'active' ? '活跃' : '禁用' }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="action-btn small" @click="$emit('edit-user', user.id)" title="编辑">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn small" @click="$emit('view-user', user.id)" title="查看">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="action-btn small danger" 
                    @click="$emit('delete-user', user.id)" 
                    title="删除"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="table-footer">
        <div class="pagination">
          <button class="pagination-btn" @click="$emit('prev-page')" :disabled="currentPage === 1">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
          <button class="pagination-btn" @click="$emit('next-page')" :disabled="currentPage === totalPages">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="table-actions">
          <button class="action-btn" @click="$emit('export-users')">
            <i class="fas fa-download"></i>
            导出用户数据
          </button>
          <button class="action-btn primary" @click="$emit('open-add-user-modal')">
            <i class="fas fa-user-plus"></i>
            添加用户
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserManagementContent',
  props: {
    userList: { type: Array, required: true },
    totalUsers: { type: Number, required: true },
    currentPage: { type: Number, required: true },
    totalPages: { type: Number, required: true },
    loading: { type: Boolean, required: true },
    columns: { type: Array, required: true }
  },
  methods: {
    // 获取用户姓名首字母
    getUserInitials(name) {
      if (!name) return '用户';
      return name.substring(0, 2);
    },
    
    // 获取随机颜色
    getRandomColor() {
      const colors = ['#4361ee', '#3a0ca3', '#4cc9f0', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }
};
</script>

<style scoped>
.user-management-content {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.content-section {
  margin-bottom: 30px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-stats {
  color: #6c757d;
  font-size: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: #6c757d;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-state {
  text-align: center;
  padding: 50px;
  color: #6c757d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #adb5bd;
}

.empty-state h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #495057;
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  text-align: left;
  padding: 12px 15px;
  border-bottom: 1px solid #dee2e6;
  font-size: 14px;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f3f5;
  vertical-align: middle;
}

.data-table tr:hover {
  background-color: #f8f9fa;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.user-info-small {
  min-width: 0;
}

.user-name {
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.status-badge.inactive {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.table-actions {
  display: flex;
  gap: 5px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 14px;
}

@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>