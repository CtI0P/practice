<template>
  <div class="question-editor">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ editingQuestion ? '编辑题目' : '添加题目' }}</h3>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label for="questionText">题目内容</label>
            <textarea
              id="questionText"
              v-model="localQuestion.question_text"
              placeholder="请输入题目内容"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="questionType">题目类型</label>
              <select
                id="questionType"
                v-model="localQuestion.question_type"
                @change="handleTypeChange"
                required
              >
                <option value="">选择类型</option>
                <option
                  v-for="type in questionTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="questionPoints">分值</label>
              <input
                id="questionPoints"
                type="number"
                v-model="localQuestion.points"
                min="1"
                required
              />
            </div>
            <div class="form-group">
              <label for="orderIndex">排序</label>
              <input
                id="orderIndex"
                type="number"
                v-model="localQuestion.order_index"
                min="0"
                required
              />
            </div>
          </div>

          <!-- 选择题选项 -->
          <div class="options-section" v-if="showOptions">
            <div class="options-header">
              <h4>选项设置</h4>
              <button type="button" class="btn btn-sm" @click="addOption">
                <i class="fas fa-plus"></i> 添加选项
              </button>
            </div>
            
            <div class="options-list">
              <div
                class="option-item"
                v-for="(option, index) in localQuestion.options"
                :key="index"
              >
                <div class="option-content">
                  <div class="option-letter">
                    {{ String.fromCharCode(65 + index) }}
                  </div>
                  <input
                    type="text"
                    v-model="option.text"
                    :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
                    required
                    @input="updateOptionText(index, $event.target.value)"
                  />
                  <div class="option-actions">
                    <button
                      type="button"
                      class="btn-icon"
                      @click="removeOption(index)"
                      :disabled="localQuestion.options.length <= 2"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div class="option-config">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      :checked="option.correct"
                      :disabled="isSingleChoice && isOptionSelected(option)"
                      @change="handleCorrectChange(index)"
                    />
                    <span>正确答案</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 判断题选项 -->
          <div class="true-false-section" v-else-if="localQuestion.question_type === 'true_false'">
            <div class="options-header">
              <h4>判断题设置</h4>
            </div>
            <div class="true-false-options">
              <label class="radio-label">
                <input
                  type="radio"
                  :checked="localQuestion.correct_answer === 'true'"
                  @change="localQuestion.correct_answer = 'true'"
                />
                <span>正确</span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  :checked="localQuestion.correct_answer === 'false'"
                  @change="localQuestion.correct_answer = 'false'"
                />
                <span>错误</span>
              </label>
            </div>
          </div>

          <!-- 简答题设置 -->
          <div class="short-answer-section" v-else-if="localQuestion.question_type === 'short_answer'">
            <div class="form-group">
              <label for="correctAnswer">参考答案</label>
              <textarea
                id="correctAnswer"
                v-model="localQuestion.correct_answer"
                placeholder="请输入参考答案"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="keywords">关键词（逗号分隔）</label>
              <input
                id="keywords"
                type="text"
                v-model="localQuestion.keywords"
                placeholder="关键词1,关键词2,关键词3"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="explanation">答案解析</label>
            <textarea
              id="explanation"
              v-model="localQuestion.explanation"
              placeholder="请输入答案解析"
              rows="2"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="$emit('cancel')">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionEditor',
  props: {
    question: {
      type: Object,
      default: () => ({
        question_text: '',
        question_type: '',
        points: 10,
        order_index: 0,
        options: [],
        correct_answer: '',
        explanation: ''
      })
    },
    questionTypes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localQuestion: {
        ...this.question,
        // 确保 options 数组存在
        options: this.question.options || []
      }
    };
  },
  computed: {
    showOptions() {
      return ['single_choice', 'multiple_choice'].includes(this.localQuestion.question_type);
    },
    isSingleChoice() {
      return this.localQuestion.question_type === 'single_choice';
    }
  },
  watch: {
    // 当 prop 变化时更新本地数据
    question: {
      handler(newQuestion) {
        this.localQuestion = {
          ...newQuestion,
          options: newQuestion.options || []
        };
      },
      deep: true
    }
  },
  methods: {
    handleTypeChange() {
      // 根据题目类型初始化选项
      if (this.showOptions && (!this.localQuestion.options || this.localQuestion.options.length === 0)) {
        this.localQuestion.options = [
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false }
        ];
      } else if (this.localQuestion.question_type === 'true_false') {
        if (!this.localQuestion.correct_answer) {
          this.localQuestion.correct_answer = 'true';
        }
      } else if (this.localQuestion.question_type === 'short_answer') {
        if (this.localQuestion.correct_answer === undefined) {
          this.localQuestion.correct_answer = '';
        }
        if (this.localQuestion.keywords === undefined) {
          this.localQuestion.keywords = '';
        }
      }
    },

    addOption() {
      this.localQuestion.options.push({ text: '', correct: false });
    },

    removeOption(index) {
      if (this.localQuestion.options.length > 2) {
        // 创建新的数组而不是修改原数组
        this.localQuestion.options = this.localQuestion.options.filter((_, i) => i !== index);
      }
    },

    isOptionSelected(option) {
      return option.correct;
    },

    updateOptionText(index, value) {
      // 创建新的选项数组
      const newOptions = [...this.localQuestion.options];
      newOptions[index] = { ...newOptions[index], text: value };
      this.localQuestion.options = newOptions;
    },

    handleCorrectChange(index) {
      const newOptions = [...this.localQuestion.options];
      
      // 切换当前选项的正确状态
      newOptions[index] = { 
        ...newOptions[index], 
        correct: !newOptions[index].correct 
      };
      
      if (this.isSingleChoice && newOptions[index].correct) {
        // 如果是单选题，只能有一个正确答案
        newOptions.forEach((option, i) => {
          if (i !== index) {
            option.correct = false;
          }
        });
      }
      
      this.localQuestion.options = newOptions;
    },

    handleSave() {
      // 验证数据
      if (this.showOptions) {
        const hasEmptyOption = this.localQuestion.options.some(opt => !opt.text.trim());
        const hasCorrectOption = this.localQuestion.options.some(opt => opt.correct);
        
        if (hasEmptyOption) {
          this.$message?.error('请填写所有选项内容');
          return;
        }
        
        if (!hasCorrectOption) {
          this.$message?.error('请至少选择一个正确答案');
          return;
        }
      }

      if (this.localQuestion.question_type === 'true_false' && !this.localQuestion.correct_answer) {
        this.$message?.error('请选择正确答案');
        return;
      }

      // 深拷贝数据，确保不会修改原始对象
      const questionToSave = JSON.parse(JSON.stringify(this.localQuestion));
      this.$emit('save', questionToSave);
    }
  },
  mounted() {
    // 组件挂载时初始化
    this.handleTypeChange();
  }
};
</script>

<style scoped>
.question-editor .modal-content {
  width: 700px;
  max-width: 90vw;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.options-header h4 {
  margin: 0;
  color: #2c3e50;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.options-list {
  margin-bottom: 20px;
}

.option-item {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  background: white;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.option-letter {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  font-weight: bold;
  color: #6c757d;
}

.option-content input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.option-actions {
  display: flex;
  gap: 5px;
}

.option-config {
  padding-left: 40px;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.true-false-options {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.short-answer-section .form-group {
  margin-bottom: 15px;
}
</style>