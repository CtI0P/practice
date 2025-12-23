<template>
  <div class="page-header">
    <div class="page-title-area">
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-description" v-if="description">{{ description }}</p>
    </div>
    
    <div class="page-actions" v-if="actions.length">
      <button 
        v-for="action in actions" 
        :key="action.id"
        class="action-btn"
        :class="action.type || 'primary'"
        @click="$emit('action-click', action.id)"
        :title="action.tooltip"
      >
        <i :class="action.icon"></i>
        <span>{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    actions: { type: Array, default: () => [] }
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title-area {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 8px;
}

.page-description {
  color: #6c757d;
  font-size: 15px;
  line-height: 1.5;
  max-width: 800px;
}

.page-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.action-btn.small {
  padding: 6px 10px;
  font-size: 13px;
}

.action-btn.primary {
  background-color: #4361ee;
  color: white;
}

.action-btn.primary:hover {
  background-color: #3a0ca3;
}

.action-btn.default {
  background-color: white;
  color: #212529;
  border: 1px solid #dee2e6;
}

.action-btn.default:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.action-btn.danger {
  background-color: #f8f9fa;
  color: #f44336;
  border: 1px solid #f44336;
}

.action-btn.danger:hover {
  background-color: #f44336;
  color: white;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .page-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>