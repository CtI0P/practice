<template>
  <div class="course-lessons-container">
    <!-- 加载状态 -->
    <div class="lesson-header">
      <button class="back-btn" @click="$emit('back-to-course-list')">
        <i class="fas fa-arrow-left"></i> 返回课程列表
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>加载课程数据中...</p>
    </div>

    <div v-else class="course-lessons-content">
      <!-- 课程头部 -->
      <div class="course-header">
        <div class="course-actions">
          <button class="btn primary" @click="showAddLessonModal = true">
            <i class="fas fa-plus"></i> 添加课时
          </button>
          <button class="btn default" @click="refreshLessons">
            <i class="fas fa-sync-alt"></i> 刷新
          </button>
        </div>
      </div>

      <!-- 视频播放区 + 课时列表 -->
      <div class="lesson-play-area">
        <!-- 流媒体播放器 -->
        <div class="video-player-container" v-if="currentLesson">
          <div id="hls-player" class="video-js vjs-big-play-centered vjs-fluid"></div>
          
          <!-- 播放控制栏 -->
          <div class="player-controls">
            <div class="quality-switcher">
              <label>清晰度：</label>
              <select v-model="currentQuality" @change="switchQuality">
                <option v-for="q in qualityOptions" :key="q.value" :value="q.value">
                  {{ q.label }}
                </option>
              </select>
            </div>
            <div class="playback-rate">
              <label>倍速：</label>
              <select v-model="playbackRate" @change="setPlaybackRate">
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
            <button class="btn small" @click="savePlaybackProgress">
              <i class="fas fa-save"></i> 保存进度
            </button>
          </div>
        </div>

        <!-- 课时列表 -->
        <div class="lessons-list">
          <h3>课时列表（{{ lessons.length }}节）</h3>
          
          <!-- 视频上传区域 -->
          <div class="upload-area" v-if="showAddLessonModal">
            <div class="upload-header">
              <h4>添加新课时</h4>
              <button class="close-btn" @click="showAddLessonModal = false">×</button>
            </div>
            <div class="upload-form">
              <div class="form-item">
                <label>课时标题</label>
                <input v-model="newLesson.title" type="text" placeholder="输入课时标题">
              </div>
              <div class="form-item">
                <label>排序序号</label>
                <input v-model.number="newLesson.order_index" type="number" min="1" placeholder="排序序号">
              </div>
              <div class="form-item">
                <label>视频文件</label>
                <div class="file-upload">
                  <input type="file" ref="videoFile" accept="video/*" @change="handleFileSelect">
                  <button class="btn default" @click="$refs.videoFile.click()">
                    <i class="fas fa-upload"></i> 选择视频
                  </button>
                </div>
                <!-- 上传进度 -->
                <div v-if="uploadProgress > 0" class="upload-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                  </div>
                  <span>{{ uploadProgress }}%</span>
                </div>
                <div v-if="transcodingStatus" class="transcoding-status">
                  <i class="fas fa-spinner fa-spin"></i> {{ transcodingStatus }}
                </div>
              </div>
              <button class="btn primary" @click="uploadVideo" :disabled="!newLesson.title || !videoFile">
                上传并转码
              </button>
            </div>
          </div>

          <!-- 课时列表项 -->
          <div 
            v-for="lesson in sortedLessons" 
            :key="lesson.id"
            class="lesson-item"
            :class="{ active: lesson.id === currentLesson?.id }"
            @click="selectLesson(lesson)"
          >
            <div class="lesson-index">{{ lesson.order_index }}</div>
            <div class="lesson-info">
              <h4>{{ lesson.title }}</h4>
              <div class="lesson-meta">
                <span><i class="fas fa-clock"></i> {{ formatDuration(lesson.duration_sec) }}</span>
                <span class="video-type">
                  <i class="fas fa-stream"></i> HLS流媒体
                </span>
              </div>
            </div>
            <div class="lesson-actions">
              <button class="btn small" @click.stop="editLesson(lesson)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn small danger" @click.stop="deleteLesson(lesson.id)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from '@/services/api';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-hls'; // 支持HLS流媒体

export default {
  name: 'CourseLessons',
  props: {
    courseId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      course: {},
      lessons: [],
      instructorName: '',
      currentLesson: null,
      videoFile: null, // 选中的视频文件
      newLesson: {
        title: '',
        order_index: 1
      },
      uploadProgress: 0, // 上传进度
      transcodingStatus: '', // 转码状态
      showAddLessonModal: false, // 显示添加课时弹窗
      currentQuality: '720p', // 当前清晰度
      playbackRate: 1, // 播放倍速
      qualityOptions: [
        { label: '高清(720P)', value: '720p' },
        { label: '标清(480P)', value: '480p' },
        { label: '流畅(360P)', value: '360p' }
      ],
      player: null // video.js播放器实例
    };
  },
  computed: {
    sortedLessons() {
      // 按order_index排序，关联播放记录
      return [...this.lessons].sort((a, b) => a.order_index - b.order_index).map(lesson => {
        // 查找当前课时的播放记录
        const playbackLog = this.getPlaybackLog(lesson.id);
        return { ...lesson, playbackLog };
      });
    }
  },
  mounted() {
    this.fetchLessons();
  },
  beforeDestroy() {
    // 销毁播放器实例
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  },
  methods: {

    // 获取课时列表
    async fetchLessons() {
      try {
        console.log(this.courseId);
        const res = await apiService.getCourseLessons(this.courseId);
        if (res.success) {
          this.lessons = res.data.lessons;
          // 默认选中第一个课时
          if (this.lessons.length > 0 && !this.currentLesson) {
            this.selectLesson(this.lessons[0]);
          }
        }
      } catch (err) {
        console.error('获取课时列表失败:', err);
        this.$message.error('获取课时列表失败');
      }
    },

    // 刷新课时列表
    refreshLessons() {
      this.fetchLessons();
    },

    // 选择课时播放
    selectLesson(lesson) {
      this.currentLesson = lesson;
      // 初始化/更新播放器
      this.initHlsPlayer(lesson);
      // 加载播放进度
      this.loadPlaybackProgress(lesson.id);
    },

    // 初始化HLS流媒体播放器
    initHlsPlayer(lesson) {
      // 销毁原有播放器
      if (this.player) {
        this.player.dispose();
      }

      // 获取对应清晰度的流媒体地址
      const videoUrl = this.getQualityVideoUrl(lesson.video_url);
      
      // 初始化Video.js
      this.player = videojs('hls-player', {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        poster: this.course.cover_image,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        html5: {
          hls: {
            enableLowInitialPlaylist: true, // 快速首屏
            maxBufferLength: 30, // 最大缓冲30秒
            maxMaxBufferLength: 60
          }
        }
      });

      // 设置流媒体源
      this.player.src({
        src: videoUrl,
        type: 'application/x-mpegURL' // HLS m3u8格式
      });

      // 监听播放进度，自动保存
      this.player.on('timeupdate', () => {
        const currentTime = Math.floor(this.player.currentTime());
        // 每30秒自动保存一次进度
        if (currentTime % 30 === 0 && currentTime > 0) {
          this.savePlaybackProgress();
        }
      });

      // 恢复上次播放进度
      if (lesson.playbackLog) {
        this.player.currentTime(lesson.playbackLog.watched_seconds);
      }

      // 设置倍速
      this.player.playbackRate(this.playbackRate);
    },

    // 获取对应清晰度的视频地址
    getQualityVideoUrl(baseUrl) {
      // 假设后端返回的baseUrl是不含清晰度的路径，如 /videos/course1/lesson1/
      // 拼接清晰度后缀：720p.m3u8 / 480p.m3u8 / 360p.m3u8
      if (!baseUrl) return '';
      const url = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      return `${url}${this.currentQuality}.m3u8`;
    },

    // 切换清晰度
    switchQuality() {
      if (!this.currentLesson) return;
      const newUrl = this.getQualityVideoUrl(this.currentLesson.video_url);
      this.player.src({
        src: newUrl,
        type: 'application/x-mpegURL'
      });
      this.player.load();
      this.player.play();
    },

    // 设置播放倍速
    setPlaybackRate() {
      if (this.player) {
        this.player.playbackRate(this.playbackRate);
      }
    },

    // 加载播放进度
    async loadPlaybackProgress(lessonId) {
      try {
        const res = await apiService.getPlaybackLog(lessonId);
        if (res.success && res.data.log) {
          // 更新课时的播放记录
          const lessonIndex = this.lessons.findIndex(l => l.id === lessonId);
          if (lessonIndex > -1) {
            this.$set(this.lessons[lessonIndex], 'playbackLog', res.data.log);
          }
        }
      } catch (err) {
        console.error('加载播放进度失败:', err);
      }
    },

    // 保存播放进度
    async savePlaybackProgress() {
      if (!this.currentLesson || !this.player) return;
      const watchedSeconds = Math.floor(this.player.currentTime());
      try {
        await apiService.savePlaybackLog({
          lesson_id: this.currentLesson.id,
          watched_seconds: watchedSeconds
        });
        // 更新本地播放记录
        this.currentLesson.playbackLog = {
          watched_seconds: watchedSeconds,
          last_watched_at: new Date().toISOString()
        };
      } catch (err) {
        console.error('保存播放进度失败:', err);
        this.$message.error('保存播放进度失败');
      }
    },

    // 获取播放记录
    getPlaybackLog(lessonId) {
      const lesson = this.lessons.find(l => l.id === lessonId);
      return lesson?.playbackLog || null;
    },

    // 处理文件选择
    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) {
        this.videoFile = file;
        // 重置上传进度
        this.uploadProgress = 0;
        this.transcodingStatus = '';
      }
    },

    // 上传视频并转码为HLS
    async uploadVideo() {
      this.uploadProgress = 0;
      this.transcodingStatus = '开始上传视频...';

      const formData = new FormData();
      formData.append('title', this.newLesson.title);
      formData.append('order_index', this.newLesson.order_index);
      formData.append('course_id', this.courseId);
      formData.append('video_file', this.videoFile);

      try {
        // 分片上传视频
        const res = await apiService.uploadVideo(formData, (progress) => {
          this.uploadProgress = Math.floor(progress * 100);
          if (this.uploadProgress === 100) {
            this.transcodingStatus = '视频上传完成，开始转码为HLS流媒体...';
          }
        });

        if (res.success) {
          this.transcodingStatus = '转码完成！';
          this.$message.success('课时添加成功');
          // 重置表单
          this.newLesson = { title: '', order_index: this.lessons.length + 1 };
          this.videoFile = null;
          this.showAddLessonModal = false;
          this.uploadProgress = 0;
          this.transcodingStatus = '';
          // 刷新课时列表
          this.fetchLessons();
        }
      } catch (err) {
        console.error('上传视频失败:', err);
        this.$message.error('视频上传/转码失败');
        this.transcodingStatus = '';
      }
    },

    // 编辑课时
    editLesson(lesson) {
      // 弹出编辑表单逻辑
      this.$modal.open({
        title: '编辑课时',
        component: 'LessonEditForm',
        props: { lesson },
        onConfirm: (updatedLesson) => {
          this.updateLesson(updatedLesson);
        }
      });
    },

    // 更新课时
    async updateLesson(lesson) {
      try {
        const res = await apiService.updateLesson(lesson.id, lesson);
        if (res.success) {
          const index = this.lessons.findIndex(l => l.id === lesson.id);
          if (index > -1) {
            this.$set(this.lessons, index, lesson);
          }
          this.$message.success('课时更新成功');
        }
      } catch (err) {
        console.error('更新课时失败:', err);
        this.$message.error('更新课时失败');
      }
    },

    // 删除课时
    async deleteLesson(lessonId) {
      if (!confirm('确定删除该课时？')) return;
      try {
        const res = await apiService.deleteLesson(lessonId);
        if (res.success) {
          this.lessons = this.lessons.filter(l => l.id !== lessonId);
          if (this.currentLesson?.id === lessonId) {
            this.currentLesson = null;
            if (this.player) {
              this.player.dispose();
              this.player = null;
            }
          }
          this.$message.success('课时删除成功');
        }
      } catch (err) {
        console.error('删除课时失败:', err);
        this.$message.error('删除课时失败');
      }
    },

    // 格式化时长（秒 → 分:秒）
    formatDuration(seconds) {
      if (!seconds) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // 格式化总时长
    formatTotalDuration() {
      const totalSec = this.lessons.reduce((sum, l) => sum + (l.duration_sec || 0), 0);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
    },

    // 格式化播放进度
    formatProgress(watched, total) {
      if (!total) return '0%';
      const percent = Math.floor((watched / total) * 100);
      return `${percent}%`;
    }
  }
};
</script>

<style scoped>
.course-lessons-container {
  width: 100%;
  min-height: calc(100vh - 80px);
  background-color: #f5f7fb;
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #4361ee;
  font-size: 18px;
  gap: 15px;
}

/* 课程头部 */
.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}

.course-basic-info h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.course-desc {
  color: #6c757d;
  margin-bottom: 10px;
}

.course-meta {
  display: flex;
  gap: 15px;
  color: #6c757d;
  font-size: 14px;
  flex-wrap: wrap;
}

.course-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 视频播放+课时列表区域 */
.lesson-play-area {
  display: flex;
  gap: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}

/* 流媒体播放器容器 */
.video-player-container {
  flex: 2;
  min-height: 400px;
}

::v-deep .video-js {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

::v-deep .vjs-control-bar {
  background-color: rgba(0,0,0,0.7) !important;
}

::v-deep .vjs-play-progress {
  background-color: #4361ee !important;
}

/* 播放器控制栏 */
.player-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.quality-switcher, .playback-rate {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quality-switcher select, .playback-rate select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* 课时列表 */
.lessons-list {
  flex: 1;
  max-width: 400px;
  height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.lessons-list h3 {
  margin-bottom: 15px;
  font-size: 18px;
}

/* 上传区域 */
.upload-area {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6c757d;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-weight: 500;
}

.form-item input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.file-upload {
  display: flex;
  gap: 10px;
  align-items: center;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.transcoding-status {
  margin-top: 8px;
  color: #4361ee;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 课时项 */
.lesson-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.lesson-item.active {
  background-color: #e7f0ff;
  border-color: #4361ee;
}

.lesson-item:hover {
  background-color: #f8f9fa;
}

.lesson-index {
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background-color: #4361ee;
  color: white;
  border-radius: 50%;
  font-size: 12px;
}

.lesson-info {
  flex: 1;
}

.lesson-info h4 {
  margin-bottom: 5px;
  font-size: 14px;
}

.lesson-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

.video-type {
  color: #4361ee;
  display: flex;
  align-items: center;
  gap: 4px;
}

.lesson-actions {
  display: flex;
  gap: 5px;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn.small {
  padding: 4px 8px;
  font-size: 12px;
}

.btn.primary {
  background-color: #4361ee;
  color: white;
}

.btn.default {
  background-color: #e9ecef;
  color: #212529;
}

.btn.danger {
  background-color: #dc3545;
  color: white;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .lesson-play-area {
    flex-direction: column;
  }
  
  .lessons-list {
    max-width: 100%;
    height: auto;
    max-height: 400px;
  }
  
  .video-player-container {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .course-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .player-controls {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>