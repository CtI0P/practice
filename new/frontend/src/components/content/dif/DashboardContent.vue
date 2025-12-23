<template>
  <div class="dashboard-content">
    <!-- 功能卡片 -->
    <div class="function-cards">
      <div 
        v-for="card in functionCards" 
        :key="card.id"
        class="card"
        @click="$emit('card-clicked', card.id)"
      >
        <div class="card-header">
          <div class="card-icon" :style="{ backgroundColor: card.color }">
            <i :class="card.icon"></i>
          </div>
          <div class="card-title">
            <h3>{{ card.title }}</h3>
            <p class="card-subtitle">{{ card.subtitle }}</p>
          </div>
        </div>
        <div class="card-body">
          <p>{{ card.description }}</p>
        </div>
        <div class="card-footer">
          <div class="card-actions">
            <button 
              v-for="action in card.actions" 
              :key="action.id"
              class="card-action-btn"
              @click.stop="$emit('card-action', { cardId: card.id, actionId: action.id })"
            >
              <i :class="action.icon"></i>
              <span>{{ action.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 最近活动 -->
    <div class="recent-activity">
      <h2 class="section-title">最近活动</h2>
      <div class="activity-list">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-icon" :style="{ backgroundColor: activity.color }">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardContent',
  props: {
    functionCards: { type: Array, required: true },
    recentActivities: { type: Array, required: true }
  }
};
</script>

<style scoped>
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.function-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #dee2e6;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 15px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
}

.card-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #212529;
}

.card-subtitle {
  color: #6c757d;
  font-size: 14px;
}

.card-body {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 14.5px;
}

.card-footer {
  border-top: 1px solid #f1f3f5;
  padding-top: 15px;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card-action-btn {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #4361ee;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.card-action-btn:hover {
  background-color: #f8f9fa;
  border-color: #4361ee;
}

.recent-activity {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #212529;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  margin-bottom: 5px;
  color: #212529;
}

.activity-description {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 5px;
}

.activity-time {
  color: #adb5bd;
  font-size: 13px;
}

@media (max-width: 768px) {
  .function-cards {
    grid-template-columns: 1fr;
  }
}
</style>