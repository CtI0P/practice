<template>
  <div class="modal-mask" v-if="visible">
    <div class="modal-container">
      <h3>{{ isEdit ? '编辑课程' : '创建课程' }}</h3>

      <div class="form-group">
        <label>课程名称 *</label>
        <input v-model="form.title" placeholder="请输入课程名称" />
      </div>

      <div class="form-group">
        <label>课程分类 *</label>
        <input v-model="form.category" placeholder="如：编程开发" />
      </div>

      <div class="form-group">
        <label>课程简介</label>
        <textarea v-model="form.description"></textarea>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')">取消</button>
        <button class="primary" @click="submit">
          {{ isEdit ? '保存修改' : '创建课程' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseModal',
  props: {
    visible: Boolean,
    course: Object
  },
  data() {
    return {
      form: this.getEmptyForm()
    };
  },
  computed: {
    isEdit() {
      return !!this.course;
    }
  },
  watch: {
    course: {
      immediate: true,
      handler(val) {
        if (val) {
          // ✅ 编辑：只拷贝需要的字段
          this.form = {
            title: val.title || '',
            category: val.category || '',
            description: val.description || '',
            instructor_id: val.instructor_id   // ⭐ 关键
          };
        } else {
          // ✅ 创建
          this.form = this.getEmptyForm();
        }
      }
    }
  },
  methods: {
    getEmptyForm() {
      return {
        title: '',
        category: '',
        level: '初级',
        description: '',
        instructor_id: null   // 创建时由父组件补
      };
    },
    submit() {
      // ✅ 前端最基本校验
      if (!this.form.title || !this.form.category) {
        alert('课程名称和分类为必填项');
        return;
      }

      this.$emit('submit', { ...this.form });
    }
  }
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-container {
  width: 460px;
  background: white;
  border-radius: 10px;
  padding: 25px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.primary {
  background: #4361ee;
  color: white;
}
</style>
