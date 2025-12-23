<template>
  <div class="generic-content">
    <div class="placeholder-content">
      <div class="placeholder-icon">
        <i :class="moduleIcon"></i>
      </div>
      <h2>{{ moduleTitle }}</h2>
      <p>{{ moduleDescription }}</p>
      <button class="action-btn primary" @click="$emit('explore-module', moduleId)">
        <i class="fas fa-rocket"></i>
        探索功能
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GenericContent',
  props: {
    moduleId: { type: String, required: true }
  },
  computed: {
    moduleIcon() {
      const icons = {
        'video-playback': 'fas fa-video',
        'online-testing': 'fas fa-clipboard-check',
        'community-interaction': 'fas fa-comments',
        'data-analysis': 'fas fa-chart-bar'
      };
      return icons[this.moduleId] || 'fas fa-cog';
    },
    moduleTitle() {
      const titles = {
        'video-playback': '视频播放功能',
        'online-testing': '在线测试功能',
        'community-interaction': '社区互动功能',
        'data-analysis': '数据分析功能'
      };
      return titles[this.moduleId] || '功能模块';
    },
    moduleDescription() {
      const descriptions = {
        'video-playback': '这里可以管理教学视频，包括上传、分类、播放和编辑视频内容。',
        'online-testing': '这里可以创建和管理在线测试，包括题库管理、试卷生成和成绩分析。',
        'community-interaction': '这里可以管理论坛、问答和聊天室，促进师生之间的交流互动。',
        'data-analysis': '这里可以查看学习数据、用户行为分析和课程效果评估报告。'
      };
      return descriptions[this.moduleId] || '功能模块正在开发中...';
    }
  }
};
</script>

<style scoped>
.generic-content {
  background-color: white;
  border-radius: 12px;
  padding: 60px 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.placeholder-content {
  max-width: 500px;
  margin: 0 auto;
}

.placeholder-icon {
  font-size: 60px;
  color: #4361ee;
  margin-bottom: 20px;
}

.placeholder-content h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #212529;
}

.placeholder-content p {
  color: #6c757d;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}
</style>