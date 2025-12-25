<template>
  <div class="content-area" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 加载动画 -->
      <LoadingOverlay v-if="loading" />
      
      <!-- 页面标题和操作按钮 -->
      <PageHeader 
        :title="currentPageTitle"
        :description="pageDescription"
        :actions="pageActions"
        @action-click="handlePageAction"
      />
      
      <!-- 统计卡片区域（仅仪表盘显示） -->
      <div class="stats-cards" v-if="showStatsCards && activeMenuItem === 'dashboard'">
        <div class="stats-grid">
          <div 
            v-for="stat in statsData" 
            :key="stat.id"
            class="stat-card"
            :style="{ borderLeftColor: stat.color }"
          >
            <div class="stat-icon">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stat.value }}</h3>
              <p>{{ stat.label }}</p>
            </div>
            <div class="stat-trend" :class="stat.trend.type" v-if="stat.trend">
              <i :class="stat.trend.icon"></i>
              <span>{{ stat.trend.value }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 动态内容区域 -->
      <div class="content-wrapper">
        <!-- 仪表盘内容 -->
        <DashboardContent 
          v-if="activeMenuItem === 'dashboard'"
          :function-cards="functionCards"
          :recent-activities="recentActivities"
          @card-clicked="navigateToCard"
          @card-action="handleCardAction"
        />
        
        <!-- 用户管理内容 -->
        <UserManagementContent 
          v-if="activeMenuItem === 'user-management'"
          :user-list="userList"
          :total-users="totalUsers"
          :current-page="currentPage"
          :total-pages="totalPages"
          :loading="loadingUsers"
          :columns="userTableColumns"
          @prev-page="prevPage"
          @next-page="nextPage"
          @edit-user="editUser"
          @view-user="viewUser"
          @delete-user="deleteUser"
          @export-users="exportUsers"
          @open-add-user-modal="openAddUserModal"
        />
        
        <!-- 课程管理内容（添加loading状态） -->
        <CourseManagementContent 
          v-if="activeMenuItem === 'course-management'"
          :course-list="courseList"
          @edit-course="editCourse"
          @view-course="viewCourse"
          @manage-content="manageCourseContent"
        />
        <!-- 课程加载中占位 -->
        <div v-if="loadingCourses && activeMenuItem === 'course-management'" class="loading-placeholder">
          <p>正在加载课程数据...</p>
        </div>

        <CourseLessons
          v-if="activeMenuItem === 'course-lessons'"
          :course-id="selectedCourseId"
        />

        
        <!-- 通用内容容器 -->
        <!-- <GenericContent 
          v-if="['video-playback', 'online-testing', 'community-interaction', 'data-analysis'].includes(activeMenuItem)"
          :module-id="activeMenuItem"
          @explore-module="exploreModule"
        /> -->

        <GenericContent 
          v-if="['video-playback', 'data-analysis'].includes(activeMenuItem)"
          :module-id="activeMenuItem"
          @explore-module="exploreModule"
        />
        <CommunityInteraction 
          v-if="activeMenuItem === 'community-interaction'"
          @explore-module="exploreModule"
        />

        <OnlineTesting 
          v-if="activeMenuItem === 'online-testing'"
          @start-test="startOnlineTest"
          @view-results="viewTestResults"
          @explore-module="exploreModule"
        />
        
        <!-- 动态组件占位符 -->
        <div v-if="showRouterView" class="router-view-wrapper">
          <router-view></router-view>
        </div>
      </div>
    </div>
    
    <!-- 右侧边栏 -->
    <RightSidebar 
      v-if="showRightSidebar"
      :quick-links="quickLinks"
      @quick-link-clicked="navigateToQuickLink"
    />
  </div>
</template>

<script>
import { apiService } from '@/services/api';
import LoadingOverlay from './dif/LoadingOverlay.vue';
import PageHeader from './dif/PageHeader.vue';
import DashboardContent from './dif/DashboardContent.vue';
import UserManagementContent from './dif/UserManagementContent.vue';
import CourseManagementContent from './dif/CourseManagementContent.vue';
import GenericContent from './dif/GenericContent.vue';
import RightSidebar from './dif/RightSidebar.vue';
import CommunityInteraction from './small/CommunityInteraction.vue';
import OnlineTesting from './small/OnlineTesting.vue';
import CourseLessons from './dif/CourseLessons.vue';

export default {
  name: 'ContentArea',
  components: {
    LoadingOverlay,
    PageHeader,
    DashboardContent,
    UserManagementContent,
    CourseManagementContent,
    GenericContent,
    RightSidebar,
    CommunityInteraction,
    OnlineTesting,
    CourseLessons
  },
  props: {
    activeMenuItem: { type: String, default: 'dashboard' },
    sidebarCollapsed: { type: Boolean, default: false },
    showRightSidebar: { type: Boolean, default: false },
    showRouterView: { type: Boolean, default: false },
    pageTitleOverride: { type: String, default: '' },
    pageDescriptionOverride: { type: String, default: '' },
    pageActionsOverride: { type: Array, default: null }
  },
  data() {
    return {
      // 用户列表数据
      userList: [],
      totalUsers: 0,
      pageSize: 10,
      currentPage: 1,
      totalPages: 1,

      // 课程列表数据（删除重复定义，仅保留一个）
      courseList: [],
      loadingCourses: false,

      selectedCourseId: null,

      // 加载状态
      loading: false,
      loadingUsers: false,
      
      // 页面标题和描述映射
      pageTitles: {
        'dashboard': '仪表盘',
        'user-management': '用户管理',
        'course-management': '课程管理',
        'video-playback': '视频播放',
        'online-testing': '在线测试',
        'community-interaction': '社区互动',
        'data-analysis': '数据分析'
      },
      
      pageDescriptions: {
        'dashboard': '这里是您的在线教育平台管理中心，您可以管理用户、课程、视频、测试等所有功能。',
        'user-management': '管理平台用户，包括学生、教师和管理员账户。',
        'course-management': '创建、编辑、发布和维护在线课程。',
        'video-playback': '支持视频上传、播放和流媒体技术。',
        'online-testing': '创建测试题库，实现在线答题和自动评分。',
        'community-interaction': '论坛、问答、实时聊天等社交功能。',
        'data-analysis': '学习进度跟踪、用户行为分析、课程效果评估等。'
      },
      
      // 统计卡片数据
      statsData: [
        { id: 'users', label: '注册用户', value: '1,254', icon: 'fas fa-users', color: '#4CAF50', trend: { type: 'up', value: '+12.5%', icon: 'fas fa-arrow-up' } },
        { id: 'courses', label: '在线课程', value: '86', icon: 'fas fa-book-open', color: '#2196F3', trend: { type: 'up', value: '+5.2%', icon: 'fas fa-arrow-up' } },
        { id: 'videos', label: '教学视频', value: '342', icon: 'fas fa-video', color: '#FF9800', trend: { type: 'up', value: '+8.7%', icon: 'fas fa-arrow-up' } },
        { id: 'tests', label: '测试完成', value: '1,042', icon: 'fas fa-clipboard-check', color: '#9C27B0', trend: { type: 'up', value: '+15.3%', icon: 'fas fa-arrow-up' } }
      ],
      
      // 功能卡片数据
      functionCards: [
        { id: 'user-management', title: '用户管理', subtitle: '管理平台用户', description: '管理平台用户，包括学生、教师和管理员账户。支持用户注册、登录、权限控制和用户信息管理。', icon: 'fas fa-users', color: '#4CAF50', actions: [{ id: 'manage', label: '管理用户', icon: 'fas fa-cog' }, { id: 'add', label: '添加用户', icon: 'fas fa-plus' }] },
        { id: 'course-management', title: '课程管理', subtitle: '创建和维护课程', description: '创建、编辑、发布和维护在线课程。支持课程分类、章节设置、课程资料上传和课程进度跟踪。', icon: 'fas fa-book-open', color: '#2196F3', actions: [{ id: 'manage', label: '管理课程', icon: 'fas fa-cog' }, { id: 'add', label: '创建课程', icon: 'fas fa-plus' }] },
        { id: 'video-playback', title: '视频播放', subtitle: '视频上传和播放', description: '支持视频上传、播放和流媒体技术。提供高清视频播放、倍速控制、字幕支持和播放进度跟踪。', icon: 'fas fa-video', color: '#FF9800', actions: [{ id: 'play', label: '播放视频', icon: 'fas fa-play-circle' }, { id: 'upload', label: '上传视频', icon: 'fas fa-upload' }] },
        { id: 'online-testing', title: '在线测试', subtitle: '创建和管理测试', description: '创建测试题库，实现在线答题和自动评分。支持多种题型、随机组卷、时间限制和成绩分析。', icon: 'fas fa-clipboard-check', color: '#9C27B0', actions: [{ id: 'create', label: '创建测试', icon: 'fas fa-edit' }, { id: 'manage', label: '题库管理', icon: 'fas fa-list' }] },
        { id: 'community-interaction', title: '社区互动', subtitle: '论坛和实时聊天', description: '论坛、问答、实时聊天等社交功能。促进学生与教师之间的交流，构建学习社区。', icon: 'fas fa-comments', color: '#00BCD4', actions: [{ id: 'enter', label: '进入社区', icon: 'fas fa-comment' }, { id: 'announce', label: '发布公告', icon: 'fas fa-bullhorn' }] },
        { id: 'data-analysis', title: '数据分析', subtitle: '学习进度和用户行为', description: '学习进度跟踪、用户行为分析、课程效果评估等。提供可视化报表，帮助优化教学策略。', icon: 'fas fa-chart-bar', color: '#3F51B5', actions: [{ id: 'view', label: '查看数据', icon: 'fas fa-chart-line' }, { id: 'export', label: '导出报告', icon: 'fas fa-download' }] }
      ],
      
      // 最近活动数据
      recentActivities: [
        { id: 1, title: '新用户注册', description: '李同学刚刚注册了账号', icon: 'fas fa-user-plus', color: '#4CAF50', time: '5分钟前' },
        { id: 2, title: '课程审核通过', description: '您的"Python编程入门"课程已通过审核', icon: 'fas fa-check-circle', color: '#2196F3', time: '1小时前' },
        { id: 3, title: '作业提交提醒', description: '有5名学生提交了"函数与模块"作业', icon: 'fas fa-clipboard-check', color: '#FF9800', time: '2小时前' },
        { id: 4, title: '系统维护通知', description: '本周六凌晨2:00-4:00将进行系统维护', icon: 'fas fa-tools', color: '#9C27B0', time: '1天前' }
      ],
      
      // 用户表格列定义
      userTableColumns: [
        { key: 'name', title: '用户' },
        { key: 'role', title: '角色' },
        { key: 'joinDate', title: '加入日期' },
        { key: 'lastLogin', title: '最后登录' },
        { key: 'status', title: '状态' }
      ],
      
      // 快速链接
      quickLinks: [
        { id: 'new-course', label: '创建新课程', icon: 'fas fa-plus-circle' },
        { id: 'new-test', label: '创建新测试', icon: 'fas fa-clipboard' },
        { id: 'reports', label: '查看报告', icon: 'fas fa-chart-pie' },
        { id: 'settings', label: '系统设置', icon: 'fas fa-cog' },
        { id: 'help', label: '帮助中心', icon: 'fas fa-question-circle' }
      ],
      
      // 页面操作按钮数据
      defaultPageActions: {
        'dashboard': [{ id: 'refresh', label: '刷新', icon: 'fas fa-sync-alt', type: 'default', tooltip: '刷新数据' }, { id: 'export', label: '导出数据', icon: 'fas fa-download', type: 'default', tooltip: '导出当前数据' }],
        'user-management': [{ id: 'add-user', label: '添加用户', icon: 'fas fa-user-plus', type: 'primary', tooltip: '添加新用户' }, { id: 'import-users', label: '批量导入', icon: 'fas fa-upload', type: 'default', tooltip: '批量导入用户' }, { id: 'export-users', label: '导出用户', icon: 'fas fa-download', type: 'default', tooltip: '导出用户列表' }],
        'course-management': [{ id: 'add-course', label: '创建课程', icon: 'fas fa-plus', type: 'primary', tooltip: '创建新课程' }, { id: 'manage-categories', label: '分类管理', icon: 'fas fa-tags', type: 'default', tooltip: '管理课程分类' }, { id: 'course-analytics', label: '课程分析', icon: 'fas fa-chart-line', type: 'default', tooltip: '查看课程分析' }]
      },

      testMode: null, 
      currentTestId: null
    };
  },
  computed: {
    currentPageTitle() {
      return this.pageTitleOverride || this.pageTitles[this.activeMenuItem] || '页面';
    },
    pageDescription() {
      return this.pageDescriptionOverride || this.pageDescriptions[this.activeMenuItem] || '';
    },
    pageActions() {
      return this.pageActionsOverride || this.defaultPageActions[this.activeMenuItem] || [];
    },
    hasPageActions() {
      return this.pageActions.length > 0;
    },
    showStatsCards() {
      return this.activeMenuItem === 'dashboard';
    },
  },
  watch: {
    async activeMenuItem(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.loading = true;
        try {
          // 切换菜单时加载对应数据
          if (newVal === 'user-management') {
            await this.fetchUsers();
          } else if (newVal === 'course-management') {
            await this.fetchCourses();
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          setTimeout(() => {
            this.loading = false;
          }, 500);
        }
        this.$emit('menu-changed', newVal);
      }
    },
    currentPage(newPage) {
      if (this.activeMenuItem === 'user-management') {
        this.fetchUsers(newPage);
      }
    }
  },
  methods: {
    // ====================== 用户管理相关方法 ======================
    async fetchUsers(page = 1) {
      this.loadingUsers = true;
      try {
        const result = await apiService.getUsers(page, this.pageSize);
        console.log("用户接口返回结果:", result);

        // 适配接口返回结构：result是对象，包含success、data、message
        if (result.success && result.data && Array.isArray(result.data.userList)) {
          // 字段映射：把后端返回的字段转成前端组件需要的格式
          this.userList = result.data.userList.map(user => ({
            id: user.id,
            name: user.username, // 后端返回的是username，前端组件需要name
            email: user.email,
            full_name: user.full_name || '未设置',
            role: user.role, // 后端返回的是student/instructor/admin，直接复用
            // 时间格式化
            joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知',
            lastLogin: user.updated_at ? new Date(user.updated_at).toLocaleString('zh-CN') : '从未登录',
            // 状态转换：后端is_active是布尔值，转成active/inactive
            status: user.is_active ? 'active' : 'inactive'
          }));
          
          // 同步后端返回的分页数据
          this.totalUsers = result.data.totalUsers;
          this.currentPage = result.data.currentPage;
          this.totalPages = result.data.totalPages;
        } else {
          // 接口返回异常，使用模拟数据
          this.useMockData();
          this.$message?.warning("接口数据异常，使用模拟数据");
        }
      } catch (error) {
        console.error('获取用户失败:', error);
        this.useMockData();
        this.$message?.error(error.message || '获取用户列表失败');
      } finally {
        this.loadingUsers = false;
      }
    },
    
    // 模拟用户数据
    useMockData() {
      this.userList = [
        { id: 1, name: '张同学', email: 'zhang@example.com', role: 'student', joinDate: '2023-09-15', lastLogin: '2023-10-20', status: 'active' },
        { id: 2, name: '王老师', email: 'wang@example.com', role: 'instructor', joinDate: '2023-08-10', lastLogin: '2023-10-19', status: 'active' },
        { id: 3, name: '李管理员', email: 'li@example.com', role: 'admin', joinDate: '2023-07-01', lastLogin: '2023-10-20', status: 'active' },
        { id: 4, name: '赵同学', email: 'zhao@example.com', role: 'student', joinDate: '2023-09-20', lastLogin: '2023-10-18', status: 'inactive' },
        { id: 5, name: '刘老师', email: 'liu@example.com', role: 'instructor', joinDate: '2023-08-25', lastLogin: '2023-10-20', status: 'active' }
      ];
      this.totalUsers = this.userList.length;
      this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    },
    
    // 分页方法
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    
    // 编辑用户
    async editUser(userId) {
      try {
        const res = await apiService.getUser(userId);
        if (res.success) this.$emit('edit-user', res.data);
      } catch (err) {
        console.error(err);
        this.$message?.error('获取用户信息失败');
      }
    },
    
    // 查看用户
    async viewUser(userId) {
      try {
        const res = await apiService.getUser(userId);
        if (res.success) this.$emit('view-user', res.data);
      } catch (err) {
        console.error(err);
        this.$message?.error('获取用户信息失败');
      }
    },
    
    // 删除用户
    async deleteUser(userId) {
      if (!confirm('确定删除？')) return;
      try {
        const res = await apiService.deleteUser(userId);
        if (res.success) {
          this.$message?.success('删除成功');
          await this.fetchUsers(this.currentPage);
          this.$emit('delete-user-success', userId);
        }
      } catch (err) {
        console.error(err);
        this.$message?.error('删除失败');
      }
    },
    
    // 导出用户CSV
    async exportUsers() {
      try {
        this.loading = true;
        const res = await apiService.getUsers(1, 1000);
        if (res.success) {
          // 适配后端返回的字段格式
          const headers = ['ID', '用户名', '邮箱', '角色', '注册时间', '最后登录', '状态'];
          const rows = res.data.userList.map(user => [
            user.id, 
            user.username, 
            user.email, 
            // 角色中文映射
            user.role === 'student' ? '学生' : user.role === 'instructor' ? '教师' : '管理员',
            user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知', 
            user.updated_at ? new Date(user.updated_at).toLocaleString('zh-CN') : '从未登录', 
            user.is_active ? '活跃' : '禁用'
          ]);
          
          // 解决中文乱码
          const bom = '\uFEFF';
          const csvContent = `${bom}${headers.join(',')}\n${rows.map(row => row.join(',')).join('\n')}`;
          const link = document.createElement('a');
          link.href = encodeURI(csvContent);
          link.download = '用户列表.csv';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          this.$emit('export-users', res.data.userList);
          this.$message?.success('导出成功');
        }
      } catch (err) {
        console.error(err);
        this.$message?.error('导出失败');
      } finally {
        this.loading = false;
      }
    },

    // ====================== 课程管理相关方法 ======================
    // 获取课程列表
    async fetchCourses() {
      this.loadingCourses = true;
      try {
        const result = await apiService.getCourses();
        console.log("课程接口返回结果:", result);
        
        // 适配后端返回结构
        if (result.success && result.data && Array.isArray(result.data.courseList)) {
          this.courseList = result.data.courseList;
        } else {
          // 接口异常时使用模拟数据
          this.useCourseMockData();
          this.$message?.warning("课程接口数据异常，使用模拟数据");
        }
      } catch (error) {
        console.error('获取课程失败:', error);
        this.useCourseMockData();
        this.$message?.error(error.message || '获取课程列表失败');
      } finally {
        this.loadingCourses = false;
      }
    },
    
    // 课程模拟数据（兜底用）
    useCourseMockData() {
      this.courseList = [
        { id: 1, title: 'Python编程入门', description: '本课程适合编程初学者，涵盖Python基础语法、数据结构、函数、面向对象编程等内容。', category: '编程开发', level: '初级', students: 1250, duration: '24小时', progress: 78, image: 'https://via.placeholder.com/300x150/2196F3/FFFFFF?text=Python+课程' },
        { id: 2, title: '数据分析实战', description: '学习使用Python进行数据清洗、分析和可视化，掌握常用数据分析工具和技术。', category: '数据科学', level: '中级', students: 842, duration: '32小时', progress: 45, image: 'https://via.placeholder.com/300x150/4CAF50/FFFFFF?text=数据分析' },
        { id: 3, title: 'Web开发全栈', description: '从前端到后端，全面学习现代Web开发技术，包括HTML/CSS/JavaScript和Node.js。', category: '前端开发', level: '中级', students: 956, duration: '40小时', progress: 92, image: 'https://via.placeholder.com/300x150/FF9800/FFFFFF?text=Web开发' },
        { id: 4, title: '机器学习基础', description: '介绍机器学习基本概念和算法，包括监督学习、无监督学习和深度学习基础。', category: '人工智能', level: '高级', students: 523, duration: '36小时', progress: 30, image: 'https://via.placeholder.com/300x150/9C27B0/FFFFFF?text=机器学习' }
      ];
    },
    
    // 编辑课程
    async editCourse(courseId) {
      try {
        const res = await apiService.getCourseDetail(courseId);
        if (res.success) {
          this.$emit('edit-course', res.data.course);
        }
      } catch (err) {
        console.error(err);
        this.$message?.error('获取课程信息失败');
      }
    },
    
    // 查看课程
    async viewCourse(courseId) {
          this.selectedCourseId = courseId;
          this.$emit('update:activeMenuItem', 'course-lessons');
          console.log('当前 activeMenuItem:', this.activeMenuItem);
      try {
        const res = await apiService.getCourseDetail(courseId);
        if (res.success) {
          this.$emit('view-course', res.data.course);
        }
      } catch (err) {
        console.error(err);
        this.$message?.error('获取课程信息失败');
      }
    },
    
    // 管理课程内容（课时）
    async manageCourseContent(courseId) {
      try {
        const res = await apiService.getCourseLessons(courseId);
        if (res.success) {
          this.$emit('manage-content', { courseId, lessons: res.data.lessons });
        }
      } catch (err) {
        console.error(err);
        this.$message?.error('获取课程课时失败');
      }
    },

    // ====================== 通用事件转发方法 ======================
    navigateToCard(cardId) {
      this.$emit('card-clicked', cardId);
    },
    handleCardAction(data) {
      this.$emit('card-action', data);
    },
    handlePageAction(actionId) {
      this.$emit('page-action', actionId);
      // 课程管理页面的"创建课程"按钮触发
      if (actionId === 'add-course') {
        this.$emit('open-add-course-modal');
      }
    },
    navigateToQuickLink(linkId) {
      this.$emit('quick-link-clicked', linkId);
    },
    exploreModule(moduleId) {
      this.$emit('explore-module', moduleId);
    },
    openAddUserModal() {
      this.$emit('open-add-user-modal');
    },
    // 开始在线测试
    startOnlineTest(testId) {
      this.currentTestId = testId;
      this.testMode = 'taking';
    },

    // 查看测试结果
    viewTestResults(testId) {
      this.currentTestId = testId;
      this.testMode = 'results';
    },

    // 测试提交后返回列表
    handleTestSubmitted(result) {
      this.testMode = 'list';
      this.$message?.success('测试提交成功！您的得分：' + result.score);
    },

    // 返回测试列表
    backToTestList() {
      this.testMode = 'list';
      this.currentTestId = null;
    },
    
  },
  mounted() {
    // 初始加载对应菜单的数据
    if (this.activeMenuItem === 'user-management') {
      this.fetchUsers();
    } else if (this.activeMenuItem === 'course-management') {
      this.fetchCourses();
    }
  }
};
</script>

<style scoped>
.content-area {
  display: flex;
  height: 100%;
  transition: margin-left 0.3s ease;
}

.content-area.sidebar-collapsed {
  margin-left: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #f5f7fb;
  padding: 20px;
}

/* 统计卡片样式 */
.stats-cards {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #4361ee;
  position: relative;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(67, 97, 238, 0.1);
  color: #4361ee;
  font-size: 22px;
}

.stat-info h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-info p {
  color: #6c757d;
  font-size: 14px;
}

.stat-trend {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.up {
  color: #4CAF50;
}

.stat-trend.down {
  color: #f44336;
}

.content-wrapper {
  flex: 1;
}

/* 课程加载占位 */
.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
}

.router-view-wrapper {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-area {
    flex-direction: column;
  }
  .right-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid #dee2e6;
    order: 2;
  }
  .main-content {
    order: 1;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>