<template>
  <div class="course-management-content">
    <div class="content-section">
      <h2 class="section-title">课程列表</h2>
      <div class="course-grid">
        <div 
          v-for="course in courseList" 
          :key="course.id"
          class="course-card"
        >
          <div class="course-image" :style="{ backgroundImage: `url(${course.image})` }">
            <div class="course-category">{{ course.category }}</div>
            <div class="course-level">{{ course.level }}</div>
          </div>
          <div class="course-info">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-description">{{ course.description }}</p>
            <div class="course-meta">
              <div class="meta-item">
                <i class="fas fa-user"></i>
                <span>{{ course.students }} 名学生</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>{{ course.duration }}</span>
              </div>
            </div>
            <div class="course-progress" v-if="course.progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ course.progress }}% 完成</span>
            </div>
            <div class="course-actions">
              <button class="action-btn small" @click="$emit('edit-course', course.id)" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn small primary" @click="$emit('view-course', course.id)" title="查看">
                <i class="fas fa-eye"></i>
              </button>
              <button class="action-btn small" @click="$emit('manage-content', course.id)" title="管理内容">
                <i class="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseManagementContent',
  props: {
    courseList: { type: Array, required: true }
  }
};
</script>

<style scoped>
.course-management-content {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.course-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #dee2e6;
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.course-image {
  height: 150px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.course-category {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: rgba(67, 97, 238, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.course-level {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #212529;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.course-info {
  padding: 20px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #212529;
}

.course-description {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  color: #6c757d;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.course-progress {
  margin-bottom: 15px;
}

.progress-bar {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  margin-bottom: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4361ee;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6c757d;
}

.course-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
}
</style>