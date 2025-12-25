<template>
  <div class="question-editor">
    <div class="modal-content">
      <div class="modal-header">
        <!-- 修复：通过 localQuestion.id 判断编辑/新增 -->
        <h3>{{ localQuestion.id ? '编辑题目' : '添加题目' }}</h3>
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

          <!-- 选择题选项（仅保留单选/多选，移除冗余逻辑） -->
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
                      :disabled="isSingleChoice && isOptionSelected(option) && localQuestion.options.some((opt, i) => opt.correct && i !== index)"
                      @change="handleCorrectChange(index)"
                    />
                    <span>正确答案</span>
                  </label>
                </div>
              </div>
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
        id: null,
        question_text: '',
        question_type: 'single_choice',
        points: 1,
        order_index: 0,
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        explanation: ''
      })
    },
    questionTypes: {
      type: Array,
      default: () => [
        { value: 'single_choice', label: '单选题' },
        { value: 'multiple_choice', label: '多选题' }
      ]
    }
  },
  data() {
    return {
      localQuestion: this.formatQuestionToLocal(this.question)
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
    question: {
      handler(newQuestion) {
        this.localQuestion = this.formatQuestionToLocal(newQuestion);
      },
      deep: true
    }
  },
  methods: {
    // 格式转换：后端格式 → 子组件格式
    formatQuestionToLocal(question) {
      const localQ = {
        ...question,
        id: question.id || null,
        question_text: question.question_text || '',
        question_type: question.question_type || 'single_choice',
        points: question.points || 1,
        order_index: question.order_index || 0,
        correct_answer: question.correct_answer || '',
        explanation: question.explanation || '',
        options: []
      };

      // 把option_a~option_d转为options数组，并根据选项内容判断是否为正确答案
      if (['single_choice', 'multiple_choice'].includes(localQ.question_type)) {
        const optionLabels = ['a', 'b', 'c', 'd'];
        localQ.options = optionLabels.map(label => {
          const optionText = question[`option_${label}`] || '';
          // 多选时correct_answer是逗号分隔的文本，拆分后匹配当前选项文本
          const isCorrect = localQ.correct_answer
            ? localQ.correct_answer.split(',').includes(optionText.trim())
            : false;
          return { text: optionText, correct: isCorrect };
        });
      }

      return localQ;
    },

    // 格式转换：子组件格式 → 后端格式
    formatLocalToQuestion(localQ) {
      const question = {
        ...localQ,
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        options: undefined // 移除子组件独有的字段
      };

      if (['single_choice', 'multiple_choice'].includes(localQ.question_type)) {
        const optionLabels = ['a', 'b', 'c', 'd'];
        const correctOptionTexts = []; // 存储正确选项的「文本内容」

        // 遍历选项，赋值option_a~option_d，并收集正确选项的文本
        localQ.options.forEach((opt, index) => {
          if (optionLabels[index]) {
            const optionKey = `option_${optionLabels[index]}`;
            question[optionKey] = opt.text || '';
            // 只收集正确选项的文本（去空格，避免空内容）
            if (opt.correct && opt.text.trim()) {
              correctOptionTexts.push(opt.text.trim());
            }
          }
        });

        // 生成correct_answer：多选时用逗号分隔，单选时直接存文本
        question.correct_answer = correctOptionTexts.join(',');
      }

      return question;
    },

    handleTypeChange() {
      // 初始化单选/多选选项
      if (this.showOptions && (!this.localQuestion.options || this.localQuestion.options.length === 0)) {
        this.localQuestion.options = [
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false }
        ];
      }
    },

    addOption() {
      this.localQuestion.options.push({ text: '', correct: false });
    },

    removeOption(index) {
      if (this.localQuestion.options.length > 2) {
        this.localQuestion.options = this.localQuestion.options.filter((_, i) => i !== index);
      }
    },

    isOptionSelected(option) {
      return option.correct;
    },

    updateOptionText(index, value) {
      const newOptions = [...this.localQuestion.options];
      newOptions[index] = { ...newOptions[index], text: value };
      this.localQuestion.options = newOptions;
    },

    handleCorrectChange(index) {
      const newOptions = [...this.localQuestion.options];
      newOptions[index] = { ...newOptions[index], correct: !newOptions[index].correct };

      // 单选题：确保只有一个正确答案
      if (this.isSingleChoice) {
        newOptions.forEach((opt, i) => {
          if (i !== index) opt.correct = false;
        });
      }

      this.localQuestion.options = newOptions;
    },

    handleSave() {
      // 验证单选/多选选项
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

      // 验证题目内容
      if (!this.localQuestion.question_text.trim()) {
        this.$message?.error('请填写题目内容');
        return;
      }

      // 格式转换后传递给父组件
      const questionToSave = this.formatLocalToQuestion(this.localQuestion);
      const finalQuestion = JSON.parse(JSON.stringify(questionToSave));
      this.$emit('save', finalQuestion);
    }
  },
  mounted() {
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