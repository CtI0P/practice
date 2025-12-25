<template>
  <div class="course-lessons">
    <!-- 当前课时标题 -->
    <h2>
      {{ currentLesson ? currentLesson.title : '请选择一个课时' }}
    </h2>

    <!-- 上传视频 -->
    <div class="upload-area">
      <input
        type="file"
        accept="video/*"
        @change="uploadVideo"
        :disabled="!currentLesson"
      />
      <span v-if="!currentLesson" class="tip">
        请先选择一个课时再上传视频
      </span>
    </div>

    <!-- 视频播放器 -->
    <video ref="video" controls class="video-player"></video>

    <!-- 课时列表 -->
    <ul class="lesson-list">
      <li
        v-for="item in lessons"
        :key="item.id"
        :class="{ active: currentLesson && currentLesson.id === item.id }"
        @click="selectAndPlay(item)"
      >
        ▶ {{ item.title }}
      </li>
    </ul>
  </div>
</template>

<script>
import Hls from 'hls.js';
import { apiService } from '@/services/api';

export default {
  props: {
    courseId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      lessons: [],            // 课程下所有课时
      currentLesson: null,    // 当前选中的课时
      hls: null               // HLS 实例
    };
  },
  async mounted() {
    const res = await apiService.getCourseLessons(this.courseId);
    if (res.success) {
      this.lessons = res.data.lessons;
    }
  },
  methods: {
    /**
     * 选中课时并播放
     */
    selectAndPlay(lesson) {
      this.currentLesson = lesson;
      this.play(lesson.id);
    },

    /**
     * 播放 HLS 视频
     */
    play(lessonId) {
      const video = this.$refs.video;
      const url = `http://localhost:3001/api/lessons/${lessonId}/playlist`;

      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }

      if (Hls.isSupported()) {
        this.hls = new Hls();
        this.hls.loadSource(url);
        this.hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    },

    /**
     * 上传视频（绑定当前课时）
     */
    async uploadVideo(e) {
      if (!this.currentLesson) {
        alert('请先选择课时');
        return;
      }

      const file = e.target.files[0];
      if (!file) return;

      const lessonId = this.currentLesson.id;
      const form = new FormData();
      form.append('video', file);

      try {
        const res = await fetch(
          `http://localhost:3001/api/upload/lesson/${lessonId}/video`,
          {
            method: 'POST',
            body: form
          }
        );

        if (!res.ok) {
          throw new Error('上传失败');
        }

        alert('上传成功，正在转码，请稍后播放');
      } catch (err) {
        console.error(err);
        alert('上传失败');
      } finally {
        // 清空 input，方便重复上传
        e.target.value = '';
      }
    }
  },
  beforeUnmount() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
};
</script>

<style scoped>
.course-lessons {
  max-width: 900px;
  margin: 0 auto;
}

.video-player {
  width: 100%;
  max-height: 480px;
  background: #000;
  border-radius: 8px;
  margin: 16px 0;
}

.upload-area {
  margin-bottom: 12px;
}

.tip {
  margin-left: 10px;
  color: #999;
  font-size: 14px;
}

.lesson-list {
  list-style: none;
  padding: 0;
}

.lesson-list li {
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.lesson-list li:hover {
  background: #f5f5f5;
}

.lesson-list li.active {
  background: #e6f7ff;
  font-weight: bold;
}
</style>
