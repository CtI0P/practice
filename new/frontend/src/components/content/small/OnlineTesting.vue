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
              <p>{{ test.description }}</p>
              <div class="test-meta">
                <span class="meta-item">
                  <i class="fas fa-question-circle"></i>
                  {{ test.question_count }} 道题目
                </span>
                <span class="meta-item">
                  <i class="fas fa-clock"></i>
                  {{ test.duration }} 分钟
                </span>
                <span class="meta-item">
                  <i class="fas fa-user-graduate"></i>
                  {{ test.participants }} 人参与
                </span>
              </div>
            </div>
            <div class="test-actions">
              <button class="btn btn-outline" @click="startTest(test)">
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

    <!-- 测试进行模式 -->
    <TestTaking
      v-else-if="testMode === 'taking'"
      :test-id="currentTestId"
      @test-submitted="handleTestSubmitted"
      @back-to-list="backToList"
    />

    <!-- 测试结果模式 -->
    <div v-else-if="testMode === 'results'" class="test-results">
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
          <h3>管理题目 - {{ currentTest.title }}</h3>
          <button class="close-btn" @click="closeQuestionModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 题目列表 -->
          <div class="question-list">
            <div
              class="question-item"
              v-for="(question, index) in currentQuestions"
              :key="question.id"
            >
              <div class="question-header">
                <span class="question-number">题目 {{ index + 1 }}</span>
                <span class="question-type">{{ questionTypeLabels[question.question_type] }}</span>
                <span class="question-points">{{ question.points }} 分</span>
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
              <!-- 显示选择题选项 -->
              <div
                class="question-options"
                v-if="['single_choice', 'multiple_choice', 'true_false'].includes(question.question_type)"
              >
                <div
                  class="option"
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  :class="{ correct: option.correct }"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  {{ option.text }}
                </div>
              </div>
            </div>
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
        duration: 60,
        passing_score: 60,
        questions: []
      },
      currentQuestions: [],
      editingTest: null,
      editingQuestion: null,
      showTestModal: false,
      showQuestionModal: false,
      showQuestionEditModal: false,
      questionTypes: [
        { value: 'single_choice', label: '单选题' },
        { value: 'multiple_choice', label: '多选题' },
        { value: 'true_false', label: '判断题' },
        { value: 'short_answer', label: '简答题' }
      ],
      questionTypeLabels: {
        'single_choice': '单选题',
        'multiple_choice': '多选题',
        'true_false': '判断题',
        'short_answer': '简答题'
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
          this.tests = response.data.quizzes;
        }
      } catch (error) {
        console.error('加载测试失败:', error);
        // 使用模拟数据
        this.tests = [
          {
            id: 1,
            title: 'Python基础知识测试',
            description: '测试Python基础语法和概念的掌握程度',
            question_count: 10,
            duration: 30,
            participants: 124,
            passing_score: 60
          },
          {
            id: 2,
            title: 'HTML/CSS基础测试',
            description: '测试HTML和CSS的基础知识',
            question_count: 15,
            duration: 45,
            participants: 89,
            passing_score: 60
          }
        ];
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
      this.editingTest = test;
      this.currentTest = { ...test };
      this.showTestModal = true;
    },

    async saveTest() {
      try {
        if (this.editingTest) {
          // 更新测试
          const response = await apiService.updateQuiz(this.currentTest.id, this.currentTest);
          if (response.success) {
            await this.loadTests();
          }
        } else {
          // 创建新测试
          const response = await apiService.createQuiz(this.currentTest);
          if (response.success) {
            await this.loadTests();
          }
        }
        this.closeModal();
      } catch (error) {
        console.error('保存测试失败:', error);
        this.$message?.error('保存测试失败');
      }
    },

    // 修改：合并了两个重复的 startTest 方法
    startTest(test) {
      this.currentTestId = test.id;
      this.testMode = 'taking';
      this.$emit('start-test', test.id);
    },

    // 修改：合并了两个重复的 viewResults 方法
    viewResults(test) {
      this.currentTestId = test.id;
      this.testMode = 'results';
      this.$emit('view-results', test.id);
    },

    async manageQuestions(test) {
      this.currentTest = test;
      try {
        const response = await apiService.getQuizQuestions(test.id);
        if (response.success) {
          this.currentQuestions = response.data.questions;
          this.showQuestionModal = true;
        }
      } catch (error) {
        console.error('加载题目失败:', error);
        this.currentQuestions = [];
        this.showQuestionModal = true;
      }
    },

    showAddQuestionModal() {
      this.editingQuestion = null;
      this.showQuestionEditModal = true;
    },

    editQuestion(question) {
      this.editingQuestion = { ...question };
      this.showQuestionEditModal = true;
    },

    async deleteQuestion(questionId) {
      if (confirm('确定删除这个题目吗？')) {
        try {
          await apiService.deleteQuestion(questionId);
          this.currentQuestions = this.currentQuestions.filter(q => q.id !== questionId);
        } catch (error) {
          console.error('删除题目失败:', error);
          this.$message?.error('删除题目失败');
        }
      }
    },

    async saveQuestion(question) {
      try {
        const data = {
          ...question,
          quiz_id: this.currentTest.id
        };

        if (question.id) {
          // 更新题目
          const response = await apiService.updateQuestion(question.id, data);
          if (response.success) {
            const index = this.currentQuestions.findIndex(q => q.id === question.id);
            if (index !== -1) {
              this.currentQuestions.splice(index, 1, response.data.question);
            }
          }
        } else {
          // 添加新题目
          const response = await apiService.createQuestion(data);
          if (response.success) {
            this.currentQuestions.push(response.data.question);
          }
        }

        this.closeQuestionEditModal();
      } catch (error) {
        console.error('保存题目失败:', error);
        this.$message?.error('保存题目失败');
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
      this.$emit('explore-module', 'online-testing');
      this.$message?.success('测试提交成功！得分：' + result.score);
    },
    
    backToList() {
      this.testMode = 'list';
      this.currentTestId = null;
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