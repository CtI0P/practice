<template>
  <div class="test-taking">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载测试...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ errorMessage }}</p>
      <button @click="loadTest" class="btn btn-primary">重新加载</button>
    </div>

    <!-- 主要内容 - 直接检查 test 和 questions 是否存在 -->
    <div v-else-if="test && test.questions && test.questions.length > 0">
        <!-- 测试信息 -->
        <div class="test-info-bar">
            <div class="test-title">{{ test.title || '未命名测试' }}</div>
            <div class="test-meta">
              <span class="course-name">{{ test.courseTitle }}</span>
              <span class="instructor">讲师: {{ test.instructorName }}</span>
            </div>
            <div class="test-timer" v-if="timeLimit > 0">
                <i class="fas fa-clock"></i>
                <span>剩余时间: {{ formattedTime }}</span>
            </div>
            <div class="test-timer" v-else>
                <i class="fas fa-clock"></i>
                <span>无时间限制</span>
            </div>
        </div>

        <!-- 答题进度 -->
        <div class="progress-bar" v-if="test.questions.length > 0">
        <div class="progress-label">
            <span>进度: {{ currentQuestionIndex + 1 }}/{{ test.questions.length }}</span>
            <span>{{ Math.round(((currentQuestionIndex + 1) / test.questions.length) * 100) }}%</span>
        </div>
        <div class="progress-track">
            <div
            class="progress-fill"
            :style="{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }"
            ></div>
        </div>
        </div>

        <!-- 题目区域 -->
        <div class="question-area" v-if="currentQuestion">
        <div class="question-header">
            <div class="question-number">第 {{ currentQuestionIndex + 1 }} 题</div>
            <div class="question-points">{{ currentQuestion.points }} 分</div>
        </div>
        
        <div class="question-content">
            <h3>{{ currentQuestion.question_text }}</h3>
        </div>

        <!-- 根据题目类型显示不同的输入组件 -->
        <div class="answer-area">
            <!-- 单选题 -->
            <div v-if="currentQuestion.question_type === 'single_choice'" class="choice-options">
            <div
                class="choice-option"
                v-for="(option, index) in getOptions(currentQuestion)"
                :key="index"
                :class="{ selected: userAnswers[currentQuestion.id] === option.text }"
                @click="selectSingleChoice(option.text)"
            >
                <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                <span class="option-text">{{ option.text }}</span>
            </div>
            </div>

            <!-- 多选题 -->
            <div v-else-if="currentQuestion.question_type === 'multiple_choice'" class="choice-options">
            <div
                class="choice-option"
                v-for="(option, index) in getOptions(currentQuestion)"
                :key="index"
                :class="{ selected: (userAnswers[currentQuestion.id] || []).includes(option.text) }"
                @click="selectMultipleChoice(option.text)"
            >
                <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
                <span class="option-text">{{ option.text }}</span>
                <span class="checkbox">
                <i class="fas fa-check" v-if="(userAnswers[currentQuestion.id] || []).includes(option.text)"></i>
                </span>
            </div>
            </div>

            <!-- 判断题 -->
            <div v-else-if="currentQuestion.question_type === 'true_false'" class="true-false-options">
            <div
                class="tf-option"
                :class="{ selected: userAnswers[currentQuestion.id] === 'true' }"
                @click="userAnswers[currentQuestion.id] = 'true'"
            >
                <i class="fas fa-check-circle"></i>
                <span>正确</span>
            </div>
            <div
                class="tf-option"
                :class="{ selected: userAnswers[currentQuestion.id] === 'false' }"
                @click="userAnswers[currentQuestion.id] = 'false'"
            >
                <i class="fas fa-times-circle"></i>
                <span>错误</span>
            </div>
            </div>

            <!-- 简答题 -->
            <div v-else-if="currentQuestion.question_type === 'short_answer'" class="short-answer-input">
            <textarea
                v-model="userAnswers[currentQuestion.id]"
                placeholder="请输入您的答案..."
                rows="5"
            ></textarea>
            </div>
        </div>

        <!-- 题目导航 -->
        <div class="question-navigation">
            <button
            class="btn btn-outline"
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            >
            <i class="fas fa-arrow-left"></i> 上一题
            </button>
            
            <div class="question-jump">
            <span>跳转到: </span>
            <select v-model="jumpToQuestion" @change="jumpToSelectedQuestion">
                <option
                v-for="(q, index) in test.questions"
                :key="q.id"
                :value="index"
                >
                第 {{ index + 1 }} 题
                </option>
            </select>
            </div>

            <button
            v-if="currentQuestionIndex < test.questions.length - 1"
            class="btn btn-primary"
            @click="nextQuestion"
            >
            下一题 <i class="fas fa-arrow-right"></i>
            </button>
            <button
            v-else
            class="btn btn-success"
            @click="submitTest"
            >
            <i class="fas fa-paper-plane"></i> 提交测试
            </button>
        </div>

        <!-- 标记题目 -->
        <div class="question-mark">
            <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="markedQuestions[currentQuestion.id]"
                @change="toggleMarkQuestion"
            />
            <span>标记此题</span>
            </label>
        </div>
        </div>

        <!-- 题目列表侧边栏 -->
        <div class="questions-sidebar" v-if="test.questions.length > 0">
        <div class="sidebar-header">
            <h4>题目列表</h4>
            <span>{{ test.questions.length }} 题</span>
        </div>
        <div class="questions-grid">
            <div
            class="question-thumb"
            v-for="(question, index) in test.questions"
            :key="question.id"
            :class="{
                current: index === currentQuestionIndex,
                answered: userAnswers[question.id] && userAnswers[question.id] !== '',
                marked: markedQuestions[question.id]
            }"
            @click="goToQuestion(index)"
            >
            {{ index + 1 }}
            </div>
        </div>
        <div class="sidebar-legend">
            <div class="legend-item">
            <div class="legend-color current"></div>
            <span>当前题目</span>
            </div>
            <div class="legend-item">
            <div class="legend-color answered"></div>
            <span>已回答</span>
            </div>
            <div class="legend-item">
            <div class="legend-color marked"></div>
            <span>已标记</span>
            </div>
        </div>
        </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="test && (!test.questions || test.questions.length === 0)" class="empty-state">
      <i class="fas fa-book"></i>
      <p>测试中没有题目</p>
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-book"></i>
      <p>未找到测试内容</p>
    </div>

    <!-- 提交确认模态框 -->
    <div class="modal-overlay" v-if="showSubmitModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>提交测试</h3>
        </div>
        <div class="modal-body">
          <div class="submission-summary">
            <div class="summary-item">
              <i class="fas fa-check-circle"></i>
              <span>已答题: {{ answeredCount }}/{{ test.questions.length }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-bookmark"></i>
              <span>标记题目: {{ markedCount }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-clock"></i>
              <span>用时: {{ elapsedTime }} 分钟</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-star"></i>
              <span>总分: {{ test.totalPoints }} 分</span>
            </div>
          </div>
          <p class="warning-text">
            <i class="fas fa-exclamation-triangle"></i>
            提交后无法修改答案，确定要提交吗？
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showSubmitModal = false">
            继续答题
          </button>
          <button class="btn btn-primary" @click="confirmSubmit">
            确定提交
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from '@/services/api';

export default {
  name: 'TestTaking',
  props: {
    testId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
        test: null, // 初始化为null
        currentQuestionIndex: 0,
        userAnswers: {},
        markedQuestions: {},
        timeLimit: 0,
        timeRemaining: 0,
        timer: null,
        showSubmitModal: false,
        jumpToQuestion: 0,
        isLoading: true,
        hasError: false,
        errorMessage: '加载测试失败，请刷新页面重试'
    };
  },
  mounted() {
    this.loadTest();
  },
  beforeUnmount() {
    this.stopTimer();
  },
  computed: {
    currentQuestion() {
        return this.test && this.test.questions && this.test.questions.length > 0 
        ? this.test.questions[this.currentQuestionIndex] 
        : null;
    },
    formattedTime() {
        if (isNaN(this.timeRemaining) || this.timeRemaining < 0) {
            return '00:00';
        }
        
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    answeredCount() {
        return Object.values(this.userAnswers).filter(answer => 
            answer && answer !== '' && 
            (!Array.isArray(answer) || answer.length > 0)
        ).length;
    },
    markedCount() {
        return Object.values(this.markedQuestions).filter(marked => marked).length;
    },
    elapsedTime() {
        if (isNaN(this.timeLimit) || this.timeLimit <= 0) {
            return 0;
        }
        const elapsedMinutes = Math.floor((this.timeLimit * 60 - this.timeRemaining) / 60);
        return elapsedMinutes;
    }
  },
  methods: {
    async loadTest() {
        try {
            this.isLoading = true;
            this.hasError = false;
            this.errorMessage = '加载测试失败，请刷新页面重试';

            console.log('开始加载测试，ID:', this.testId);

            // 只需调用一个API - getQuizDetail
            const response = await apiService.getQuizDetail(this.testId);
            console.log('API响应:', response);

            if (response && response.success && response.data) {
                this.test = response.data;
                console.log('测试详情:', this.test);
                
                // 设置时间限制
                this.timeLimit = this.test.timeLimit || 0;
                this.timeRemaining = this.timeLimit * 60;
                
                // 初始化用户答案和标记状态
                if (this.test.questions && Array.isArray(this.test.questions)) {
                    this.test.questions.forEach(question => {
                        if (question && question.id) {
                            // 根据题目类型初始化不同的答案格式
                            if (question.question_type === 'multiple_choice') {
                                this.userAnswers[question.id] = [];
                            } else {
                                this.userAnswers[question.id] = '';
                            }
                            this.markedQuestions[question.id] = false;
                        }
                    });
                    
                    console.log('初始化完成，题目数量:', this.test.questions.length);
                    
                    // 如果有时间限制，启动计时器
                    if (this.timeLimit > 0) {
                        this.startTimer();
                    }
                } else {
                    console.warn('测试中没有题目或题目格式不正确');
                }
                
            } else {
                throw new Error(response?.message || '获取测试详情失败');
            }
            
        } catch (error) {
            console.error('加载测试失败:', error);
            console.error('错误详情:', error.response?.data || error.message);
            
            // 根据错误类型设置不同的错误信息
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        this.errorMessage = '请先登录';
                        break;
                    case 403:
                        this.errorMessage = '没有权限访问此测试';
                        break;
                    case 404:
                        this.errorMessage = '测试不存在';
                        break;
                    case 500:
                        this.errorMessage = '服务器错误，请稍后重试';
                        break;
                    default:
                        this.errorMessage = error.response.data?.message || '加载测试失败';
                }
            } else {
                this.errorMessage = error.message || '加载测试失败，请刷新页面重试';
            }
            
            if (this.$message) {
                this.$message.error(this.errorMessage);
            }
            
            this.hasError = true;
        } finally {
            this.isLoading = false;
        }
    },
    
    // 转换选项格式：将字符串数组转换为对象数组
    getOptions(question) {
        if (!question || !question.options) return [];
        
        // 如果已经是对象数组，直接返回
        if (question.options.length > 0 && typeof question.options[0] === 'object') {
            return question.options;
        }
        
        // 如果是字符串数组，转换为对象数组
        return question.options.map(option => ({
            text: option
        }));
    },
    
    startTimer() {
        if (this.timeLimit > 0 && !this.timer) {
            this.timer = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                } else {
                    this.stopTimer();
                    this.autoSubmit();
                }
            }, 1000);
        }
    },

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    },

    autoSubmit() {
        this.$message?.warning('时间已到，系统将自动提交测试');
        this.submitTest();
    },

    selectSingleChoice(answer) {
        if (this.currentQuestion) {
            this.userAnswers[this.currentQuestion.id] = answer;
        }
    },

    selectMultipleChoice(answer) {
        if (!this.currentQuestion) return;
        
        const currentAnswers = this.userAnswers[this.currentQuestion.id] || [];
        if (currentAnswers.includes(answer)) {
            this.userAnswers[this.currentQuestion.id] = currentAnswers.filter(a => a !== answer);
        } else {
            this.userAnswers[this.currentQuestion.id] = [...currentAnswers, answer];
        }
    },

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.jumpToQuestion = this.currentQuestionIndex;
        }
    },

    nextQuestion() {
        if (this.test && this.test.questions && 
            this.currentQuestionIndex < this.test.questions.length - 1) {
            this.currentQuestionIndex++;
            this.jumpToQuestion = this.currentQuestionIndex;
        }
    },

    goToQuestion(index) {
        if (this.test && this.test.questions && 
            index >= 0 && index < this.test.questions.length) {
            this.currentQuestionIndex = index;
            this.jumpToQuestion = index;
        }
    },

    jumpToSelectedQuestion() {
        this.goToQuestion(parseInt(this.jumpToQuestion));
    },

    toggleMarkQuestion() {
        if (this.currentQuestion) {
            this.markedQuestions[this.currentQuestion.id] = !this.markedQuestions[this.currentQuestion.id];
        }
    },

    submitTest() {
        this.showSubmitModal = true;
    },

    async confirmSubmit() {
        try {
            const submission = {
                quiz_id: this.testId,
                answers: Object.entries(this.userAnswers)
                    .map(([questionId, answer]) => ({
                        question_id: parseInt(questionId),
                        answer: Array.isArray(answer) ? answer : [answer].filter(a => a !== '')
                    }))
                    .filter(item => item.answer.length > 0), // 只提交有答案的题目
                time_spent: this.elapsedTime
            };

            console.log('提交的数据:', submission);
            
            const response = await apiService.submitQuiz(submission);
            if (response.success) {
                this.stopTimer();
                this.$emit('test-submitted', response.data.result);
                this.$message?.success('测试提交成功！');
            } else {
                throw new Error(response.message || '提交失败');
            }
        } catch (error) {
            console.error('提交测试失败:', error);
            this.$message?.error(error.message || '提交测试失败');
        } finally {
            this.showSubmitModal = false;
        }
    }
  }
};
</script>

<style scoped>
.test-taking {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 20px;
  height: calc(100vh - 150px);
}

.test-info-bar {
  grid-column: 1 / -1;
  background: #4361ee;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.test-title {
  font-size: 18px;
  font-weight: bold;
}

.test-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

.progress-bar {
  grid-column: 1 / -1;
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
  color: #6c757d;
}

.progress-track {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4361ee;
  transition: width 0.3s ease;
}

.question-area {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.question-number {
  font-size: 16px;
  font-weight: bold;
  color: #4361ee;
}

.question-points {
  background: #ff9800;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.question-content h3 {
  margin: 0 0 30px 0;
  line-height: 1.6;
  color: #2c3e50;
}

.answer-area {
  margin-bottom: 30px;
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.choice-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.choice-option:hover {
  border-color: #adb5bd;
  background: #f8f9fa;
}

.choice-option.selected {
  border-color: #4361ee;
  background: rgba(67, 97, 238, 0.05);
}

.option-letter {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  margin-right: 15px;
  font-weight: bold;
  color: #6c757d;
  flex-shrink: 0;
}

.choice-option.selected .option-letter {
  background: #4361ee;
  color: white;
}

.option-text {
  flex: 1;
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #ced4da;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  flex-shrink: 0;
}

.choice-option.selected .checkbox {
  background: #4361ee;
  border-color: #4361ee;
  color: white;
}

.true-false-options {
  display: flex;
  gap: 20px;
}

.tf-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tf-option:hover {
  border-color: #adb5bd;
  background: #f8f9fa;
}

.tf-option.selected {
  border-color: #4361ee;
  background: rgba(67, 97, 238, 0.05);
}

.tf-option i {
  font-size: 24px;
  margin-bottom: 10px;
}

.tf-option:first-child i {
  color: #4CAF50;
}

.tf-option:last-child i {
  color: #f44336;
}

.tf-option.selected:first-child {
  border-color: #4CAF50;
}

.tf-option.selected:last-child {
  border-color: #f44336;
}

.short-answer-input textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.short-answer-input textarea:focus {
  outline: none;
  border-color: #4361ee;
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.question-jump {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-jump select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.question-mark {
  margin-top: 20px;
  text-align: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.questions-sidebar {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.sidebar-header h4 {
  margin: 0;
  color: #2c3e50;
}

.sidebar-header span {
  color: #6c757d;
  font-size: 14px;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  flex: 1;
}

.question-thumb {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  user-select: none;
}

.question-thumb:hover {
  border-color: #adb5bd;
  background: #f8f9fa;
}

.question-thumb.current {
  border-color: #4361ee;
  background: #4361ee;
  color: white;
}

.question-thumb.answered {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.question-thumb.marked {
  border-color: #FF9800;
  background: rgba(255, 152, 0, 0.1);
}

.sidebar-legend {
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6c757d;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.current {
  background: #4361ee;
}

.legend-color.answered {
  background: #4CAF50;
}

.legend-color.marked {
  background: #FF9800;
}

.submission-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item i {
  color: #4361ee;
  width: 20px;
}

.warning-text {
  color: #f44336;
  text-align: center;
  padding: 15px;
  background: rgba(244, 67, 54, 0.05);
  border-radius: 8px;
  margin: 0;
}

.warning-text i {
  margin-right: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
</style>