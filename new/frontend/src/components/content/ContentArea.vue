<!-- 右侧内容 -->
<template>
  <div class="content-area" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 加载动画（当加载内容时显示） -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>加载中...</p>
        </div>
      </div>
      
      <!-- 页面标题和操作按钮区域 -->
      <div class="page-header">
        <div class="page-title-area">
          <h1 class="page-title">{{ currentPageTitle }}</h1>
          <p class="page-description" v-if="pageDescription">{{ pageDescription }}</p>
        </div>
        
        <div class="page-actions" v-if="hasPageActions">
          <button 
            v-for="action in pageActions" 
            :key="action.id"
            class="action-btn"
            :class="action.type || 'primary'"
            @click="handlePageAction(action.id)"
            :title="action.tooltip"
          >
            <i :class="action.icon"></i>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>
      
      <!-- 统计卡片区域 -->
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
        <div v-if="activeMenuItem === 'dashboard'" class="dashboard-content">
          <!-- 功能卡片 -->
          <div class="function-cards">
            <div 
              v-for="card in functionCards" 
              :key="card.id"
              class="card"
              @click="navigateToCard(card.id)"
            >
              <div class="card-header">
                <div class="card-icon" :style="{ backgroundColor: card.color }">
                  <i :class="card.icon"></i>
                </div>
                <div class="card-title">
                  <h3>{{ card.title }}</h3>
                  <p class="card-subtitle">{{ card.subtitle }}</p>
                </div>
              </div>
              <div class="card-body">
                <p>{{ card.description }}</p>
              </div>
              <div class="card-footer">
                <div class="card-actions">
                  <button 
                    v-for="action in card.actions" 
                    :key="action.id"
                    class="card-action-btn"
                    @click.stop="handleCardAction(card.id, action.id)"
                  >
                    <i :class="action.icon"></i>
                    <span>{{ action.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 最近活动 -->
          <div class="recent-activity">
            <h2 class="section-title">最近活动</h2>
            <div class="activity-list">
              <div 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon" :style="{ backgroundColor: activity.color }">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 用户管理内容 -->
        <div v-if="activeMenuItem === 'user-management'" class="user-management-content">
          <div class="content-section">
            <div class="table-header">
              <h2 class="section-title">用户列表</h2>
              <div class="table-stats">
                <span v-if="!loadingUsers">共 {{ totalUsers }} 个用户</span>
                <span v-else>加载中...</span>
              </div>
            </div>
            
            <!-- 加载状态 -->
            <div v-if="loadingUsers" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>正在加载用户数据...</span>
            </div>
            
            <!-- 空状态 -->
            <div v-else-if="userList.length === 0" class="empty-state">
              <i class="fas fa-users"></i>
              <h3>暂无用户数据</h3>
              <p>没有找到任何用户记录</p>
            </div>

            <div v-else class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th v-for="column in userTableColumns" :key="column.key">
                      {{ column.title }}
                    </th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in userList" :key="user.id">
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar-small" :style="{ backgroundColor: getRandomColor() }">
                          {{ getUserInitials(user.name) }}
                        </div>
                        <div class="user-info-small">
                          <div class="user-name">{{ user.name }}</div>
                          <div class="user-email">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ user.role }}</td>
                    <td>{{ user.joinDate }}</td>
                    <td>{{ user.lastLogin }}</td>
                    <td>
                      <span class="status-badge" :class="user.status">
                        {{ user.status === 'active' ? '活跃' : '禁用' }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="action-btn small" @click="editUser(user.id)" title="编辑">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn small" @click="viewUser(user.id)" title="查看">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button 
                          class="action-btn small danger" 
                          @click="deleteUser(user.id)" 
                          title="删除"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>


            <div v-if="totalPages > 1" class="table-footer">
              <div class="pagination">
                <button class="pagination-btn" @click="prevPage" :disabled="currentPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
                <button class="pagination-btn" @click="nextPage" :disabled="currentPage === totalPages">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              <div class="table-actions">
                <button class="action-btn" @click="exportUsers">
                  <i class="fas fa-download"></i>
                  导出用户数据
                </button>
                <button class="action-btn primary" @click="openAddUserModal">
                  <i class="fas fa-user-plus"></i>
                  添加用户
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 课程管理内容 -->
        <div v-if="activeMenuItem === 'course-management'" class="course-management-content">
          <div class="content-section">
            <h2 class="section-title">课程列表</h2>
            <div class="course-grid">
              <div 
                v-for="course in courseList" 
                :key="course.id"
                class="course-card"
              >
                <div class="course-image" :style="{ backgroundImage: `url(${course.image})` }">
                  <div class="course-category">{{ course.category }}</div>
                  <div class="course-level">{{ course.level }}</div>
                </div>
                <div class="course-info">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <p class="course-description">{{ course.description }}</p>
                  <div class="course-meta">
                    <div class="meta-item">
                      <i class="fas fa-user"></i>
                      <span>{{ course.students }} 名学生</span>
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-clock"></i>
                      <span>{{ course.duration }}</span>
                    </div>
                  </div>
                  <div class="course-progress" v-if="course.progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ course.progress }}% 完成</span>
                  </div>
                  <div class="course-actions">
                    <button class="action-btn small" @click="editCourse(course.id)" title="编辑">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn small primary" @click="viewCourse(course.id)" title="查看">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn small" @click="manageCourseContent(course.id)" title="管理内容">
                      <i class="fas fa-cog"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 通用内容容器（用于视频播放、在线测试、社区互动、数据分析等模块） -->
        <div v-if="['video-playback', 'online-testing', 'community-interaction', 'data-analysis'].includes(activeMenuItem)" 
             class="generic-content">
          <div class="placeholder-content">
            <div class="placeholder-icon">
              <i :class="getModuleIcon(activeMenuItem)"></i>
            </div>
            <h2>{{ getModuleTitle(activeMenuItem) }}</h2>
            <p>{{ getModuleDescription(activeMenuItem) }}</p>
            <button class="action-btn primary" @click="exploreModule(activeMenuItem)">
              <i class="fas fa-rocket"></i>
              探索功能
            </button>
          </div>
        </div>
        
        <!-- 动态组件占位符（用于加载子路由组件） -->
        <div v-if="showRouterView" class="router-view-wrapper">
          <router-view></router-view>
        </div>
      </div>
    </div>
    
    <!-- 右侧边栏（可选） -->
    <div class="right-sidebar" v-if="showRightSidebar">
      <div class="right-sidebar-content">
        <h3 class="sidebar-title">快速访问</h3>
        <div class="quick-links">
          <div 
            v-for="link in quickLinks" 
            :key="link.id"
            class="quick-link"
            @click="navigateToQuickLink(link.id)"
          >
            <i :class="link.icon"></i>
            <span>{{ link.label }}</span>
          </div>
        </div>
        
        <h3 class="sidebar-title">系统状态</h3>
        <div class="system-status">
          <div class="status-item">
            <span class="status-label">系统版本</span>
            <span class="status-value">v2.1.0</span>
          </div>
          <div class="status-item">
            <span class="status-label">最后备份</span>
            <span class="status-value">2023-10-15</span>
          </div>
          <div class="status-item">
            <span class="status-label">在线用户</span>
            <span class="status-value">254</span>
          </div>
          <div class="status-item">
            <span class="status-label">服务器负载</span>
            <span class="status-value">
              <span class="status-indicator good"></span>
              正常
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from '@/services/api';

export default {
  name: 'ContentArea',
  props: {
    // 当前激活的菜单项ID
    activeMenuItem: {
      type: String,
      default: 'dashboard'
    },
    // 侧边栏是否收起
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    // 是否显示右侧边栏
    showRightSidebar: {
      type: Boolean,
      default: false
    },
    // 是否显示路由视图（用于子路由）
    showRouterView: {
      type: Boolean,
      default: false
    },
    // 页面标题
    pageTitleOverride: {
      type: String,
      default: ''
    },
    // 页面描述
    pageDescriptionOverride: {
      type: String,
      default: ''
    },
    // 页面操作按钮
    pageActionsOverride: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      // 用户列表数据
      userList: [], // 初始化为空数组
      totalUsers: 0, // 总用户数
      pageSize: 10, // 每页显示数量
      currentPage: 1, // 当前页码
      totalPages: 1, // 总页数

      // 加载状态
      loading: false,
      loadingUsers: false,  // 用户数据加载状态
      
      
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
        {
          id: 'users',
          label: '注册用户',
          value: '1,254',
          icon: 'fas fa-users',
          color: '#4CAF50',
          trend: {
            type: 'up',
            value: '+12.5%',
            icon: 'fas fa-arrow-up'
          }
        },
        {
          id: 'courses',
          label: '在线课程',
          value: '86',
          icon: 'fas fa-book-open',
          color: '#2196F3',
          trend: {
            type: 'up',
            value: '+5.2%',
            icon: 'fas fa-arrow-up'
          }
        },
        {
          id: 'videos',
          label: '教学视频',
          value: '342',
          icon: 'fas fa-video',
          color: '#FF9800',
          trend: {
            type: 'up',
            value: '+8.7%',
            icon: 'fas fa-arrow-up'
          }
        },
        {
          id: 'tests',
          label: '测试完成',
          value: '1,042',
          icon: 'fas fa-clipboard-check',
          color: '#9C27B0',
          trend: {
            type: 'up',
            value: '+15.3%',
            icon: 'fas fa-arrow-up'
          }
        }
      ],
      
      // 功能卡片数据
      functionCards: [
        {
          id: 'user-management',
          title: '用户管理',
          subtitle: '管理平台用户',
          description: '管理平台用户，包括学生、教师和管理员账户。支持用户注册、登录、权限控制和用户信息管理。',
          icon: 'fas fa-users',
          color: '#4CAF50',
          actions: [
            { id: 'manage', label: '管理用户', icon: 'fas fa-cog' },
            { id: 'add', label: '添加用户', icon: 'fas fa-plus' }
          ]
        },
        {
          id: 'course-management',
          title: '课程管理',
          subtitle: '创建和维护课程',
          description: '创建、编辑、发布和维护在线课程。支持课程分类、章节设置、课程资料上传和课程进度跟踪。',
          icon: 'fas fa-book-open',
          color: '#2196F3',
          actions: [
            { id: 'manage', label: '管理课程', icon: 'fas fa-cog' },
            { id: 'add', label: '创建课程', icon: 'fas fa-plus' }
          ]
        },
        {
          id: 'video-playback',
          title: '视频播放',
          subtitle: '视频上传和播放',
          description: '支持视频上传、播放和流媒体技术。提供高清视频播放、倍速控制、字幕支持和播放进度跟踪。',
          icon: 'fas fa-video',
          color: '#FF9800',
          actions: [
            { id: 'play', label: '播放视频', icon: 'fas fa-play-circle' },
            { id: 'upload', label: '上传视频', icon: 'fas fa-upload' }
          ]
        },
        {
          id: 'online-testing',
          title: '在线测试',
          subtitle: '创建和管理测试',
          description: '创建测试题库，实现在线答题和自动评分。支持多种题型、随机组卷、时间限制和成绩分析。',
          icon: 'fas fa-clipboard-check',
          color: '#9C27B0',
          actions: [
            { id: 'create', label: '创建测试', icon: 'fas fa-edit' },
            { id: 'manage', label: '题库管理', icon: 'fas fa-list' }
          ]
        },
        {
          id: 'community-interaction',
          title: '社区互动',
          subtitle: '论坛和实时聊天',
          description: '论坛、问答、实时聊天等社交功能。促进学生与教师之间的交流，构建学习社区。',
          icon: 'fas fa-comments',
          color: '#00BCD4',
          actions: [
            { id: 'enter', label: '进入社区', icon: 'fas fa-comment' },
            { id: 'announce', label: '发布公告', icon: 'fas fa-bullhorn' }
          ]
        },
        {
          id: 'data-analysis',
          title: '数据分析',
          subtitle: '学习进度和用户行为',
          description: '学习进度跟踪、用户行为分析、课程效果评估等。提供可视化报表，帮助优化教学策略。',
          icon: 'fas fa-chart-bar',
          color: '#3F51B5',
          actions: [
            { id: 'view', label: '查看数据', icon: 'fas fa-chart-line' },
            { id: 'export', label: '导出报告', icon: 'fas fa-download' }
          ]
        }
      ],
      
      // 最近活动数据
      recentActivities: [
        {
          id: 1,
          title: '新用户注册',
          description: '李同学刚刚注册了账号',
          icon: 'fas fa-user-plus',
          color: '#4CAF50',
          time: '5分钟前'
        },
        {
          id: 2,
          title: '课程审核通过',
          description: '您的"Python编程入门"课程已通过审核',
          icon: 'fas fa-check-circle',
          color: '#2196F3',
          time: '1小时前'
        },
        {
          id: 3,
          title: '作业提交提醒',
          description: '有5名学生提交了"函数与模块"作业',
          icon: 'fas fa-clipboard-check',
          color: '#FF9800',
          time: '2小时前'
        },
        {
          id: 4,
          title: '系统维护通知',
          description: '本周六凌晨2:00-4:00将进行系统维护',
          icon: 'fas fa-tools',
          color: '#9C27B0',
          time: '1天前'
        }
      ],
      
      // 用户表格列定义
      userTableColumns: [
        { key: 'name', title: '用户' },
        { key: 'role', title: '角色' },
        { key: 'joinDate', title: '加入日期' },
        { key: 'lastLogin', title: '最后登录' },
        { key: 'status', title: '状态' }
      ],
      
      
      // 课程列表数据
      courseList: [
        {
          id: 1,
          title: 'Python编程入门',
          description: '本课程适合编程初学者，涵盖Python基础语法、数据结构、函数、面向对象编程等内容。',
          category: '编程开发',
          level: '初级',
          students: 1250,
          duration: '24小时',
          progress: 78,
          image: 'https://via.placeholder.com/300x150/2196F3/FFFFFF?text=Python+课程'
        },
        {
          id: 2,
          title: '数据分析实战',
          description: '学习使用Python进行数据清洗、分析和可视化，掌握常用数据分析工具和技术。',
          category: '数据科学',
          level: '中级',
          students: 842,
          duration: '32小时',
          progress: 45,
          image: 'https://via.placeholder.com/300x150/4CAF50/FFFFFF?text=数据分析'
        },
        {
          id: 3,
          title: 'Web开发全栈',
          description: '从前端到后端，全面学习现代Web开发技术，包括HTML/CSS/JavaScript和Node.js。',
          category: '前端开发',
          level: '中级',
          students: 956,
          duration: '40小时',
          progress: 92,
          image: 'https://via.placeholder.com/300x150/FF9800/FFFFFF?text=Web开发'
        },
        {
          id: 4,
          title: '机器学习基础',
          description: '介绍机器学习基本概念和算法，包括监督学习、无监督学习和深度学习基础。',
          category: '人工智能',
          level: '高级',
          students: 523,
          duration: '36小时',
          progress: 30,
          image: 'https://via.placeholder.com/300x150/9C27B0/FFFFFF?text=机器学习'
        }
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
        'dashboard': [
          { id: 'refresh', label: '刷新', icon: 'fas fa-sync-alt', type: 'default', tooltip: '刷新数据' },
          { id: 'export', label: '导出数据', icon: 'fas fa-download', type: 'default', tooltip: '导出当前数据' }
        ],
        'user-management': [
          { id: 'add-user', label: '添加用户', icon: 'fas fa-user-plus', type: 'primary', tooltip: '添加新用户' },
          { id: 'import-users', label: '批量导入', icon: 'fas fa-upload', type: 'default', tooltip: '批量导入用户' },
          { id: 'export-users', label: '导出用户', icon: 'fas fa-download', type: 'default', tooltip: '导出用户列表' }
        ],
        'course-management': [
          { id: 'add-course', label: '创建课程', icon: 'fas fa-plus', type: 'primary', tooltip: '创建新课程' },
          { id: 'manage-categories', label: '分类管理', icon: 'fas fa-tags', type: 'default', tooltip: '管理课程分类' },
          { id: 'course-analytics', label: '课程分析', icon: 'fas fa-chart-line', type: 'default', tooltip: '查看课程分析' }
        ]
      }
    };
  },
  computed: {
    // 当前页面标题
    currentPageTitle() {
      if (this.pageTitleOverride) {
        return this.pageTitleOverride;
      }
      return this.pageTitles[this.activeMenuItem] || '页面';
    },
    
    // 当前页面描述
    pageDescription() {
      if (this.pageDescriptionOverride) {
        return this.pageDescriptionOverride;
      }
      return this.pageDescriptions[this.activeMenuItem] || '';
    },
    
    // 当前页面操作按钮
    pageActions() {
      if (this.pageActionsOverride) {
        return this.pageActionsOverride;
      }
      return this.defaultPageActions[this.activeMenuItem] || [];
    },
    
    // 是否有页面操作按钮
    hasPageActions() {
      return this.pageActions && this.pageActions.length > 0;
    },
    
    // 是否显示统计卡片
    showStatsCards() {
      return this.activeMenuItem === 'dashboard';
    }
  },
  watch: {
    // 监听激活菜单项变化
    async activeMenuItem(newVal, oldVal) {
      if (newVal !== oldVal) {
        // 模拟加载状态
        this.loading = true;
        
        try {
          // 如果是用户管理页面，加载用户数据
          if (newVal === 'user-management') {
            await this.fetchUsers();
          }
        } catch (error) {
          console.error('加载数据失败:', error);
        } finally {
          setTimeout(() => {
            this.loading = false;
          }, 500);
        }
        
        // 触发菜单切换事件
        this.$emit('menu-changed', newVal);
      }
    },
    
    // 监听页码变化
    currentPage(newPage) {
      if (this.activeMenuItem === 'user-management') {
        this.fetchUsers(newPage);
      }
    }
  },
  methods: {
    // 从数据库获取用户列表
    async fetchUsers(page = 1) {
      try {
        console.log('尝试获取用户...');
        
        // 直接调用，看看返回什么
        const result = await apiService.getUsers(page, this.pageSize);
        console.log('API 返回:', result);
        
        // 根据实际返回调整
        if (Array.isArray(result)) {
          this.userList = result;
        } else if (result && Array.isArray(result.data)) {
          this.userList = result.data;
        } else {
          console.warn('无法识别的格式，使用模拟数据');
          this.useMockData();
        }
      } catch (error) {
        console.error('错误:', error);
        this.useMockData();
      }
    },

    // 使用模拟数据作为备用
    useMockData() {
      this.userList = [
        {
          id: 1,
          name: '张同学',
          email: 'zhang@example.com',
          role: '学生',
          joinDate: '2023-09-15',
          lastLogin: '2023-10-20',
          status: 'active'
        },
        {
          id: 2,
          name: '王老师',
          email: 'wang@example.com',
          role: '教师',
          joinDate: '2023-08-10',
          lastLogin: '2023-10-19',
          status: 'active'
        },
        {
          id: 3,
          name: '李管理员',
          email: 'li@example.com',
          role: '管理员',
          joinDate: '2023-07-01',
          lastLogin: '2023-10-20',
          status: 'active'
        },
        {
          id: 4,
          name: '赵同学',
          email: 'zhao@example.com',
          role: '学生',
          joinDate: '2023-09-20',
          lastLogin: '2023-10-18',
          status: 'inactive'
        },
        {
          id: 5,
          name: '刘老师',
          email: 'liu@example.com',
          role: '教师',
          joinDate: '2023-08-25',
          lastLogin: '2023-10-20',
          status: 'active'
        }
      ];
      this.totalUsers = this.userList.length;
      this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
      this.currentPage = 1;
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '从未登录';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    },
    
    // 转换角色
    mapRole(role) {
      const roleMap = {
        'admin': '管理员',
        'teacher': '教师',
        'student': '学生',
        'user': '用户'
      };
      return roleMap[role?.toLowerCase()] || role || '用户';
    },
    
    // 获取用户姓名首字母
    getUserInitials(name) {
      if (!name) return '用户';
      return name.substring(0, 2);
    },
    
    // 获取随机颜色（用于头像）
    getRandomColor() {
      const colors = ['#4361ee', '#3a0ca3', '#4cc9f0', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
      return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // 分页：上一页
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    // 分页：下一页
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    // 编辑用户
    async editUser(userId) {
      try {
        // 获取用户详细信息
        const response = await apiService.getUser(userId);
        
        if (response.success) {
          this.$emit('edit-user', response.data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.$message.error('获取用户信息失败');
      }
    },
    
    // 查看用户
    async viewUser(userId) {
      try {
        const response = await apiService.getUser(userId);
        
        if (response.success) {
          this.$emit('view-user', response.data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.$message.error('获取用户信息失败');
      }
    },
    
    // 删除用户
    async deleteUser(userId) {
      if (!confirm('确定要删除这个用户吗？此操作不可撤销。')) {
        return;
      }
      
      try {
        const response = await apiService.deleteUser(userId);
        
        if (response.success) {
          this.$message.success('删除用户成功');
          // 重新加载用户列表
          await this.fetchUsers(this.currentPage);
          this.$emit('delete-user-success', userId);
        }
      } catch (error) {
        console.error('删除用户失败:', error);
        
        if (error.response?.status === 403) {
          this.$message.error('没有权限删除用户');
        } else {
          this.$message.error('删除用户失败');
        }
      }
    },
    
    // 导出用户数据
    async exportUsers() {
      try {
        // 这里可以调用后端导出接口，或者使用前端导出
        const response = await apiService.getUsers(1, 1000); // 获取大量数据
        
        if (response.success) {
          // 前端导出为CSV
          this.exportToCSV(response.data.users, 'users.csv');
          this.$emit('export-users', response.data.users);
        }
      } catch (error) {
        console.error('导出用户数据失败:', error);
        this.$message.error('导出用户数据失败');
      }
    },
    
    // 导出为CSV
    exportToCSV(data, filename) {
      const headers = ['ID', '用户名', '邮箱', '角色', '注册时间', '最后登录', '状态'];
      const rows = data.map(user => [
        user.id,
        user.username,
        user.email,
        user.role,
        user.created_at,
        user.last_login || '从未登录',
        user.status
      ]);
      
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(',') + "\n";
      rows.forEach(row => {
        csvContent += row.join(',') + "\n";
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    // 获取模块图标
    getModuleIcon(moduleId) {
      const icons = {
        'video-playback': 'fas fa-video',
        'online-testing': 'fas fa-clipboard-check',
        'community-interaction': 'fas fa-comments',
        'data-analysis': 'fas fa-chart-bar'
      };
      return icons[moduleId] || 'fas fa-cog';
    },
    
    // 获取模块标题
    getModuleTitle(moduleId) {
      const titles = {
        'video-playback': '视频播放功能',
        'online-testing': '在线测试功能',
        'community-interaction': '社区互动功能',
        'data-analysis': '数据分析功能'
      };
      return titles[moduleId] || '功能模块';
    },
    
    // 获取模块描述
    getModuleDescription(moduleId) {
      const descriptions = {
        'video-playback': '这里可以管理教学视频，包括上传、分类、播放和编辑视频内容。',
        'online-testing': '这里可以创建和管理在线测试，包括题库管理、试卷生成和成绩分析。',
        'community-interaction': '这里可以管理论坛、问答和聊天室，促进师生之间的交流互动。',
        'data-analysis': '这里可以查看学习数据、用户行为分析和课程效果评估报告。'
      };
      return descriptions[moduleId] || '功能模块正在开发中...';
    },
    
    // 导航到功能卡片
    navigateToCard(cardId) {
      this.$emit('card-clicked', cardId);
    },
    
    // 处理功能卡片操作
    handleCardAction(cardId, actionId) {
      this.$emit('card-action', { cardId, actionId });
    },
    
    // 处理页面操作按钮
    handlePageAction(actionId) {
      this.$emit('page-action', actionId);
    },
    
    // 导航到快速链接
    navigateToQuickLink(linkId) {
      this.$emit('quick-link-clicked', linkId);
    },
    
    // 探索模块功能
    exploreModule(moduleId) {
      this.$emit('explore-module', moduleId);
    },
    
    // 打开添加用户模态框
    openAddUserModal() {
      this.$emit('open-add-user-modal');
    },
    
    // 编辑课程
    editCourse(courseId) {
      this.$emit('edit-course', courseId);
    },
    
    // 查看课程
    viewCourse(courseId) {
      this.$emit('view-course', courseId);
    },
    
    // 管理课程内容
    manageCourseContent(courseId) {
      this.$emit('manage-course-content', courseId);
    }
  },
  mounted() {
    console.log('ContentArea component mounted');

    // 如果初始就是用户管理页面，加载用户数据
    if (this.activeMenuItem === 'user-management') {
      this.fetchUsers();
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

/* 侧边栏收起时的样式 */
.content-area.sidebar-collapsed {
  margin-left: 0;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #f5f7fb;
  padding: 20px;
}

/* 加载动画 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner i {
  font-size: 40px;
  color: #4361ee;
  margin-bottom: 10px;
}

.loading-spinner p {
  color: #6c757d;
  font-size: 16px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title-area {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 8px;
}

.page-description {
  color: #6c757d;
  font-size: 15px;
  line-height: 1.5;
  max-width: 800px;
}

.page-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.action-btn.small {
  padding: 6px 10px;
  font-size: 13px;
}

.action-btn.primary {
  background-color: #4361ee;
  color: white;
}

.action-btn.primary:hover {
  background-color: #3a0ca3;
}

.action-btn.default {
  background-color: white;
  color: #212529;
  border: 1px solid #dee2e6;
}

.action-btn.default:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.action-btn.danger {
  background-color: #f8f9fa;
  color: #f44336;
  border: 1px solid #f44336;
}

.action-btn.danger:hover {
  background-color: #f44336;
  color: white;
}

/* 统计卡片 */
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

/* 内容包装器 */
.content-wrapper {
  flex: 1;
}

/* 仪表盘内容 */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 功能卡片 */
.function-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #dee2e6;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 15px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
}

.card-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #212529;
}

.card-subtitle {
  color: #6c757d;
  font-size: 14px;
}

.card-body {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 14.5px;
}

.card-footer {
  border-top: 1px solid #f1f3f5;
  padding-top: 15px;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card-action-btn {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #4361ee;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.card-action-btn:hover {
  background-color: #f8f9fa;
  border-color: #4361ee;
}

/* 最近活动 */
.recent-activity {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #212529;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  margin-bottom: 5px;
  color: #212529;
}

.activity-description {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 5px;
}

.activity-time {
  color: #adb5bd;
  font-size: 13px;
}

/* 用户管理内容 */
.user-management-content {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.content-section {
  margin-bottom: 30px;
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  text-align: left;
  padding: 12px 15px;
  border-bottom: 1px solid #dee2e6;
  font-size: 14px;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f3f5;
  vertical-align: middle;
}

.data-table tr:hover {
  background-color: #f8f9fa;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.user-info-small {
  min-width: 0;
}

.user-name {
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.status-badge.inactive {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.table-actions {
  display: flex;
  gap: 5px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 14px;
}

/* 课程管理内容 */
.course-management-content {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.course-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #dee2e6;
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.course-image {
  height: 150px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.course-category {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: rgba(67, 97, 238, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.course-level {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #212529;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.course-info {
  padding: 20px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #212529;
}

.course-description {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  color: #6c757d;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.course-progress {
  margin-bottom: 15px;
}

.progress-bar {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  margin-bottom: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4361ee;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6c757d;
}

.course-actions {
  display: flex;
  gap: 10px;
}

/* 通用内容容器 */
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

/* 右侧边栏 */
.right-sidebar {
  width: 280px;
  background-color: white;
  border-left: 1px solid #dee2e6;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.right-sidebar-content {
  flex: 1;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f3f5;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quick-link:hover {
  background-color: #f8f9fa;
}

.quick-link i {
  color: #4361ee;
  font-size: 16px;
  width: 20px;
}

.quick-link span {
  color: #212529;
  font-size: 14px;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.status-label {
  color: #6c757d;
  font-size: 14px;
}

.status-value {
  color: #212529;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.good {
  background-color: #4CAF50;
}

.status-indicator.warning {
  background-color: #FF9800;
}

.status-indicator.bad {
  background-color: #f44336;
}

/* 路由视图包装器 */
.router-view-wrapper {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
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
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .function-cards {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .course-grid {
    grid-template-columns: 1fr;
  }
  
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-stats {
  color: #6c757d;
  font-size: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: #6c757d;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-state {
  text-align: center;
  padding: 50px;
  color: #6c757d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #adb5bd;
}

.empty-state h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #495057;
}
</style>