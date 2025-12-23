<template>
  <div class="right-sidebar">
    <div class="right-sidebar-content">
      <h3 class="sidebar-title">快速访问</h3>
      <div class="quick-links">
        <div 
          v-for="link in quickLinks" 
          :key="link.id"
          class="quick-link"
          @click="$emit('quick-link-clicked', link.id)"
        >
          <i :class="link.icon"></i>
          <span>{{ link.label }}</span>
        </div>
      </div>
      
      <h3 class="sidebar-title">系统状态</h3>
      <div class="system-status">
        <div class="status-item">
          <span class="status-label">系统版本</span>
          <span class="status-value">v2.1.0</span>
        </div>
        <div class="status-item">
          <span class="status-label">最后备份</span>
          <span class="status-value">2023-10-15</span>
        </div>
        <div class="status-item">
          <span class="status-label">在线用户</span>
          <span class="status-value">254</span>
        </div>
        <div class="status-item">
          <span class="status-label">服务器负载</span>
          <span class="status-value">
            <span class="status-indicator good"></span>
            正常
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RightSidebar',
  props: {
    quickLinks: { type: Array, required: true }
  }
};
</script>

<style scoped>
.right-sidebar {
  width: 280px;
  background-color: white;
  border-left: 1px solid #dee2e6;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.right-sidebar-content {
  flex: 1;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f3f5;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quick-link:hover {
  background-color: #f8f9fa;
}

.quick-link i {
  color: #4361ee;
  font-size: 16px;
  width: 20px;
}

.quick-link span {
  color: #212529;
  font-size: 14px;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.status-label {
  color: #6c757d;
  font-size: 14px;
}

.status-value {
  color: #212529;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.good {
  background-color: #4CAF50;
}

.status-indicator.warning {
  background-color: #FF9800;
}

.status-indicator.bad {
  background-color: #f44336;
}
</style>