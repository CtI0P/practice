<template>
  <div class="online-testing">
    <!-- 测试管理头部 -->
    <div class="test-header">
      <div class="header-left">
        <h2>在线测试</h2>
        <p>创建、管理和进行在线测试</p>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="createNewTest">
          <i class="fas fa-plus"></i> 创建新测试
        </button>
        <button class="btn btn-outline" @click="refreshTests">
          <i class="fas fa-sync-alt"></i> 刷新
        </button>
      </div>
    </div>

    <!-- 测试列表模式 -->
    <div v-if="testMode === 'list'">
      <!-- 测试列表 -->
      <div class="test-list" v-if="tests.length > 0">
        <div class="test-item" v-for="test in tests" :key="test.id">
          <div class="test-card">
            <div class="test-info">
              <h3>{{ test.title }}</h3>
              <p>{{ test.description || '无描述' }}</p>
              <div class="test-meta">
                <span class="meta-item">
                  <i class="fas fa-question-circle"></i>
                  {{ test.question_count || 0 }} 道题目
                </span>
                <span class="meta-item">
                  <i class="fas fa-clock"></i>
                  {{ test.duration || test.time_limit_min || 60 }} 分钟
                </span>
                <span class="meta-item">
                  <i class="fas fa-user-graduate"></i>
                  {{ test.participants || 0 }} 人参与
                </span>
              </div>
            </div>
            <div class="test-actions">
              <button class="btn btn-outline" @click="startTest(test)" :disabled="!test.question_count || test.question_count === 0">
                <i class="fas fa-play"></i> 开始测试
              </button>
              <button class="btn btn-outline" @click="editTest(test)">
                <i class="fas fa-edit"></i> 编辑
              </button>
              <button class="btn btn-outline" @click="manageQuestions(test)">
                <i class="fas fa-tasks"></i> 管理题目
              </button>
              <button class="btn btn-outline" @click="viewResults(test)">
                <i class="fas fa-chart-bar"></i> 查看结果
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <i class="fas fa-clipboard-list fa-3x"></i>
        <h3>暂无测试</h3>
        <p>点击"创建新测试"按钮开始创建您的第一个测试</p>
      </div>
    </div>

    <!-- 测试进行模式：添加v-if确保currentTestId有效 -->
    <TestTaking
      v-else-if="testMode === 'taking' && currentTestId"
      :test-id="currentTestId"
      @test-submitted="handleTestSubmitted"
      @back-to-list="backToList"
    />

    <!-- 测试结果模式 -->
    <div v-else-if="testMode === 'results' && currentTestId" class="test-results">
      <div class="results-header">
        <h3>测试结果</h3>
        <button class="btn btn-outline" @click="backToList">
          <i class="fas fa-arrow-left"></i> 返回列表
        </button>
      </div>
      <!-- 这里可以添加测试结果的具体内容 -->
      <div class="results-content">
        <p>测试结果页面正在开发中...</p>
      </div>
    </div>

    <!-- 测试创建/编辑模态框 -->
    <div class="modal-overlay" v-if="showTestModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingTest ? '编辑测试' : '创建新测试' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveTest">
            <div class="form-group">
              <label for="testTitle">测试标题</label>
              <input
                id="testTitle"
                type="text"
                v-model="currentTest.title"
                placeholder="请输入测试标题"
                required
              />
            </div>
            <div class="form-group">
              <label for="testDescription">测试描述</label>
              <textarea
                id="testDescription"
                v-model="currentTest.description"
                placeholder="请输入测试描述"
                rows="3"
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="testDuration">测试时长（分钟）</label>
                <input
                  id="testDuration"
                  type="number"
                  v-model="currentTest.duration"
                  min="1"
                  required
                />
              </div>
              <div class="form-group">
                <label for="passingScore">及格分数</label>
                <input
                  id="passingScore"
                  type="number"
                  v-model="currentTest.passing_score"
                  min="0"
                  required
                />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" @click="closeModal">
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingTest ? '更新' : '创建' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 题目管理模态框 -->
    <div class="modal-overlay" v-if="showQuestionModal">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>管理题目 - {{ currentTest.title || '未知测试' }}</h3>
          <button class="close-btn" @click="closeQuestionModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 题目列表 -->
          <div class="question-list" v-if="currentQuestions.length > 0">
            <div
              class="question-item"
              v-for="(question, index) in currentQuestions"
              :key="question.id"
            >
              <div class="question-header">
                <span class="question-number">题目 {{ index + 1 }}</span>
                <span class="question-type">{{ questionTypeLabels[question.question_type] }}</span>
                <span class="question-points">{{ question.points || 1 }} 分</span>
                <div class="question-actions">
                  <button class="btn-icon" @click="editQuestion(question)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon" @click="deleteQuestion(question.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="question-content">
                <p>{{ question.question_text }}</p>
              </div>
              <!-- 显示选择题选项：适配option_a~option_d字段 -->
              <div
                class="question-options"
                v-if="['single_choice', 'multiple_choice'].includes(question.question_type)"
              >
                <div
                  class="option"
                  v-for="(option, optIndex) in formatQuestionOptions(question)"
                  :key="optIndex"
                  :class="{ correct: isOptionCorrect(question, optIndex) }"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  {{ option }}
                </div>
              </div>
            </div>
          </div>
          <!-- 题目列表空状态 -->
          <div class="empty-state" v-else>
            <i class="fas fa-question-circle fa-2x"></i>
            <h4>暂无题目</h4>
            <p>点击"添加题目"按钮创建第一道题目</p>
          </div>

          <!-- 添加题目按钮 -->
          <div class="add-question-section">
            <button class="btn btn-primary" @click="showAddQuestionModal">
              <i class="fas fa-plus"></i> 添加题目
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 题目编辑模态框 -->
    <div class="modal-overlay" v-if="showQuestionEditModal">
      <QuestionEditor
        :question="editingQuestion"
        :question-types="questionTypes"
        @save="saveQuestion"
        @cancel="closeQuestionEditModal"
      />
    </div>
  </div>
</template>

<script>
import { apiService } from '@/services/api';
import QuestionEditor from './QuestionEditor.vue';
import TestTaking from './TestTaking.vue'; 

export default {
  name: 'OnlineTesting',
  components: {
    QuestionEditor,
    TestTaking
  },
  data() {
    return {
      tests: [],
      currentTest: {
        title: '',
        description: '',
        duration: 60, // 对应后端time_limit_min
        passing_score: 60,
        questions: []
      },
      currentQuestions: [],
      editingTest: null,
      editingQuestion: null,
      showTestModal: false,
      showQuestionModal: false,
      showQuestionEditModal: false,
      // 移除判断题、简答题，仅保留单选/多选（适配表结构）
      questionTypes: [
        { value: 'single_choice', label: '单选题' },
        { value: 'multiple_choice', label: '多选题' }
      ],
      questionTypeLabels: {
        'single_choice': '单选题',
        'multiple_choice': '多选题'
      },
      testMode: 'list',
      currentTestId: null
    };
  },
  created() {
    this.loadTests();
  },
  methods: {
    async loadTests() {
      try {
        const response = await apiService.getQuizzes();
        if (response.success) {
          // 格式化测试数据，兼容后端字段
          this.tests = response.data.quizzes.map(test => ({
            ...test,
            // 后端是time_limit_min，前端显示duration
            duration: test.duration || test.time_limit_min || 60,
            question_count: test.question_count || 0,
            participants: test.participants || 0
          }));
        }
      } catch (error) {
        console.error('加载测试失败:', error);
        this.$message?.error('加载测试列表失败，请刷新重试');
        this.tests = []; // 移除模拟数据，统一显示空状态
      }
    },

    createNewTest() {
      this.editingTest = null;
      this.currentTest = {
        title: '',
        description: '',
        duration: 60,
        passing_score: 60,
        questions: []
      };
      this.showTestModal = true;
    },

    editTest(test) {
      if (!test) return; // 防止test为undefined
      this.editingTest = test;
      // 兼容后端字段，赋值给currentTest
      this.currentTest = {
        ...test,
        duration: test.duration || test.time_limit_min || 60
      };
      this.showTestModal = true;
    },

    async saveTest() {
      try {
        // 构造后端需要的参数（字段映射）
        const testData = {
          title: this.currentTest.title,
          description: this.currentTest.description || '',
          time_limit_min: this.currentTest.duration, // 前端duration对应后端time_limit_min
          passing_score: this.currentTest.passing_score
        };

        if (this.editingTest) {
          // 更新测试：携带id
          const response = await apiService.updateQuiz(this.currentTest.id, {
            id: this.currentTest.id,
            ...testData
          });
          if (response.success) {
            await this.loadTests();
            this.$message?.success('测试更新成功');
          }
        } else {
          // 创建新测试
          const response = await apiService.createQuiz(testData);
          if (response.success) {
            await this.loadTests();
            this.$message?.success('测试创建成功');
          }
        }
        this.closeModal();
      } catch (error) {
        console.error('保存测试失败:', error);
        this.$message?.error('保存测试失败，请重试');
      }
    },

    // 开始测试：增加test有效性校验
    startTest(test) {
      if (!test || !test.id) {
        this.$message?.warning('测试无效，无法开始');
        return;
      }
      // 校验是否有题目
      if (!test.question_count || test.question_count === 0) {
        this.$message?.warning('该测试暂无题目，无法开始');
        return;
      }
      this.currentTestId = test.id;
      this.testMode = 'taking';
      this.$emit('start-test', test.id);
    },

    // 查看结果：增加test有效性校验
    viewResults(test) {
      if (!test || !test.id) {
        this.$message?.warning('测试无效，无法查看结果');
        return;
      }
      this.currentTestId = test.id;
      this.testMode = 'results';
      this.$emit('view-results', test.id);
    },

    async manageQuestions(test) {
      if (!test || !test.id) {
        this.$message?.warning('测试无效，无法管理题目');
        return;
      }
      this.currentTest = { ...test };
      try {
        const response = await apiService.getQuizQuestions(test.id);
        if (response.success) {
          // 格式化题目数据：将option_a~option_d转为options数组
          this.currentQuestions = response.data.questions.map(question => ({
            ...question,
            points: question.points || 1
          }));
        }
        this.showQuestionModal = true;
      } catch (error) {
        console.error('加载题目失败:', error);
        this.$message?.error('加载题目失败，请重试');
        this.currentQuestions = [];
        this.showQuestionModal = true;
      }
    },

    // 格式化题目选项：将option_a~option_d转为数组
    formatQuestionOptions(question) {
      if (!question) return [];
      return [
        question.option_a || '',
        question.option_b || '',
        question.option_c || '',
        question.option_d || ''
      ];
    },

    // 判断选项是否为正确答案
    isOptionCorrect(question, optIndex) {
      if (!question || !question.correct_answer) return false;
      const optionLabel = String.fromCharCode(65 + optIndex);
      // 多选正确答案是逗号分隔，单选是单个字母
      return question.correct_answer.includes(optionLabel);
    },

    showAddQuestionModal() {
      this.editingQuestion = null;
      this.showQuestionEditModal = true;
    },

    editQuestion(question) {
      if (!question) return;
      this.editingQuestion = { ...question };
      this.showQuestionEditModal = true;
    },

    async deleteQuestion(questionId) {
      if (!questionId) return;
      if (!confirm('确定删除这个题目吗？删除后无法恢复')) {
        return;
      }
      try {
        await apiService.deleteQuestion(questionId);
        this.currentQuestions = this.currentQuestions.filter(q => q.id !== questionId);
        this.$message?.success('题目删除成功');
      } catch (error) {
        console.error('删除题目失败:', error);
        this.$message?.error('删除题目失败，请重试');
      }
    },

    async saveQuestion(question) {
      if (!question || !this.currentTest.id) {
        this.$message?.warning('题目或测试信息无效，无法保存');
        return;
      }
      try {
        // 构造题目数据：适配option_a~option_d字段
        const data = {
          quiz_id: this.currentTest.id,
          question_text: question.question_text,
          question_type: question.question_type,
          option_a: question.option_a || '',
          option_b: question.option_b || '',
          option_c: question.option_c || '',
          option_d: question.option_d || '',
          correct_answer: question.correct_answer || '',
          points: question.points || 1,
          order_index: question.order_index || 0
        };

        if (question.id) {
          // 更新题目
          data.id = question.id;
          const response = await apiService.updateQuestion(question.id, data);
          if (response.success) {
            const index = this.currentQuestions.findIndex(q => q.id === question.id);
            if (index !== -1) {
              this.currentQuestions.splice(index, 1, response.data.question);
            }
            this.$message?.success('题目更新成功');
          }
        } else {
          // 添加新题目
          const response = await apiService.createQuestion(data);
          if (response.success) {
            this.currentQuestions.push(response.data.question);
            this.$message?.success('题目添加成功');
          }
        }

        this.closeQuestionEditModal();
      } catch (error) {
        console.error('保存题目失败:', error);
        this.$message?.error('保存题目失败，请重试');
      }
    },

    refreshTests() {
      this.loadTests();
    },

    closeModal() {
      this.showTestModal = false;
      this.editingTest = null;
    },

    closeQuestionModal() {
      this.showQuestionModal = false;
    },

    closeQuestionEditModal() {
      this.showQuestionEditModal = false;
      this.editingQuestion = null;
    },
    
    handleTestSubmitted(result) {
      this.testMode = 'list';
      this.currentTestId = null; // 重置testId
      this.$emit('explore-module', 'online-testing');
      this.$message?.success(`测试提交成功！得分：${result.score || 0}`);
    },
    
    backToList() {
      this.testMode = 'list';
      this.currentTestId = null; // 重置testId
    }
  }
};
</script>

<style scoped>
.online-testing {
  padding: 20px;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.header-left h2 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.header-left p {
  margin: 0;
  color: #6c757d;
}

.test-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.test-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.test-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.test-info h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.test-info p {
  margin: 0 0 15px 0;
  color: #6c757d;
  line-height: 1.5;
}

.test-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
  font-size: 14px;
}

.test-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state i {
  margin-bottom: 20px;
  color: #dee2e6;
}

.empty-state h3 {
  margin-bottom: 10px;
}

.question-list {
  max-height: 400px;
  overflow-y: auto;
}

.question-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.question-number {
  font-weight: bold;
  color: #2c3e50;
}

.question-type {
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #6c757d;
}

.question-points {
  color: #ff9800;
  font-weight: bold;
}

.question-actions {
  display: flex;
  gap: 5px;
}

.btn-icon {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
}

.btn-icon:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.question-content p {
  margin: 10px 0;
  color: #2c3e50;
}

.question-options {
  margin-top: 10px;
  padding-left: 15px;
}

.option {
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 4px;
}

.option.correct {
  background: #d4edda;
  color: #155724;
}

.add-question-section {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background: #4361ee;
  color: white;
}

.btn-primary:hover {
  background: #3a56d4;
}

.btn-outline {
  background: white;
  border: 1px solid #ced4da;
  color: #6c757d;
}

.btn-outline:hover {
  background: #f8f9fa;
}

/* 添加测试结果样式 */
.test-results {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.results-content {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}
</style>