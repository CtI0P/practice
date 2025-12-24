<template>
  <div class="course-lessons">
    <h2>课程课时列表（课程ID：{{ courseId }}）</h2>

    <ul>
      <li v-for="lesson in lessons" :key="lesson.id">
        {{ lesson.title }}（{{ lesson.duration_sec }} 秒）
      </li>
    </ul>
  </div>
</template>

<script>
import { apiService } from '@/services/api';

export default {
  props: ['courseId'],
  data() {
    return {
      lessons: []
    };
  },
  async mounted() {
    const res = await apiService.getCourseLessons(this.courseId);
    if (res.success) {
      this.lessons = res.data.lessons;
    }
  }
};
</script>
