<!-- 顶部搜索栏 -->
<template>
    <div class="header" :class="{ 'mobile-header': isMobile }">
        <!-- 左侧：菜单切换按钮和面包屑导航 -->
        <div class="header-left">
            <!-- 菜单切换按钮（移动端显示） -->
            <button 
                class="menu-toggle" 
                @click="toggleSidebar"
                v-if="showMenuToggle"
                :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
            >
            <i :class="menuToggleIcon"></i>
            </button>
      
            <!-- 面包屑导航 -->
            <div class="breadcrumb" v-if="showBreadcrumb">
                <div class="breadcrumb-item" 
                    v-for="(item, index) in breadcrumbItems" 
                    :key="item.id"
                    :class="{ 'active': index === breadcrumbItems.length - 1 }"
                >
                    <span v-if="index > 0" class="separator">/</span>
                    <span class="breadcrumb-link" @click="navigateTo(item.path)" v-if="index < breadcrumbItems.length - 1">
                        {{ item.label }}
                    </span>
                    <span v-else class="current-page">
                        {{ item.label }}
                    </span>
                </div>
            </div>

            <!-- 页面标题（如果没有面包屑导航时显示） -->
            <div class="page-title" v-if="!showBreadcrumb && pageTitle">
                <h1>{{ pageTitle }}</h1>
                <span class="page-subtitle" v-if="pageSubtitle">{{ pageSubtitle }}</span>
            </div>
        </div>

        <!-- 中间：搜索框 -->
        <div class="header-center" v-if="showSearch">
            <div class="search-bar" :class="{ 'focused': isSearchFocused }">
                <i class="fas fa-search"></i>
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    :placeholder="searchPlaceholder"
                    @focus="isSearchFocused = true"
                    @blur="isSearchFocused = false"
                    @keyup.enter="handleSearch"
                />
                <!-- 搜索建议 -->
                <div class="search-suggestions" v-if="showSearchSuggestions && searchQuery && isSearchFocused">
                    <div 
                        v-for="suggestion in filteredSuggestions" 
                        :key="suggestion.id"
                        class="suggestion-item"
                        @click="selectSuggestion(suggestion)"
                    >
                        <i :class="suggestion.icon"></i>
                        <span>{{ suggestion.text }}</span>
                        <span class="suggestion-type">{{ suggestion.type }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧：通知、用户信息和其他操作 -->
        <div class="header-right">
            <!-- 通知图标 -->
            <div class="notification-wrapper" v-if="showNotifications">
                <div 
                    class="notification" 
                    @click="toggleNotifications"
                    :title="hasUnreadNotifications ? `您有 ${unreadCount} 条未读通知` : '通知'"
                >
                    <i class="fas fa-bell"></i>
                    <div class="badge" v-if="hasUnreadNotifications">
                        {{ unreadCount > 9 ? '9+' : unreadCount }}
                    </div>
                </div>
            </div>
            
            <!-- 通知面板 -->
            <div class="notifications-panel" v-if="showNotificationsPanel">
                <div class="notifications-header">
                    <h3>通知</h3>
                    <button class="mark-all-read" @click="markAllAsRead" v-if="hasUnreadNotifications">
                        全部标记为已读
                    </button>
                </div>
                <div class="notifications-list">
                    <div 
                        v-for="notification in notifications" 
                        :key="notification.id"
                        class="notification-item"
                        :class="{ 'unread': !notification.read }"
                        @click="handleNotificationClick(notification)"
                    >
                        <div class="notification-icon">
                            <i :class="notification.icon"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">{{ notification.title }}</div>
                            <div class="notification-message">{{ notification.message }}</div>
                            <div class="notification-time">{{ notification.time }}</div>
                        </div>
                        <div class="notification-actions" v-if="!notification.read">
                            <i class="fas fa-circle unread-dot"></i>
                        </div>
                    </div>
                </div>
                <div class="notifications-footer" @click="viewAllNotifications">
                    查看所有通知
                </div>
            </div>

            <!-- 快速操作按钮 -->
            <div class="quick-actions" v-if="showQuickActions">
                <div 
                    v-for="action in quickActions" 
                    :key="action.id"
                    class="quick-action"
                    @click="handleQuickAction(action.id)"
                    :title="action.title"
                >
                <i :class="action.icon"></i>
                </div>
            </div>

            <!-- 用户信息 -->
            <div class="user-info-wrapper" v-if="showUserInfo">
                <div class="user-info" @click="toggleUserMenu">
                    <div class="avatar" :style="{ backgroundColor: userAvatarColor }">
                        {{ userInitials }}
                    </div>
                    <div class="user-details" v-if="!isMobile">
                        <div class="user-name">{{ userName }}</div>
                        <div class="user-role">{{ userRole }}</div>
                    </div>
                    <i class="fas fa-chevron-down user-menu-arrow" :class="{ 'rotated': showUserMenu }"></i>
                </div>
                
                <!-- 用户菜单 -->
                <div class="user-menu" v-if="showUserMenu">
                    <div class="user-menu-header">
                        <div class="avatar-large" :style="{ backgroundColor: userAvatarColor }">
                            {{ userInitials }}
                        </div>
                        <div class="user-info-large">
                            <div class="user-name">{{ userName }}</div>
                            <div class="user-email">{{ userEmail }}</div>
                            <div class="user-role">{{ userRole }}</div>
                        </div>
                    </div>
                    <div class="user-menu-items">
                        <div 
                            v-for="item in userMenuItems" 
                            :key="item.id"
                            class="user-menu-item"
                            @click="handleUserMenuItemClick(item.id)"
                        >
                            <i :class="item.icon"></i>
                            <span>{{ item.label }}</span>
                        </div>
                    </div>
                    <div class="user-menu-footer">
                        <button class="logout-btn" @click="handleLogout">
                            <i class="fas fa-sign-out-alt"></i>
                            退出登录
                        </button>
                    </div>
                </div>
            </div>

            <!-- 设置按钮 -->
            <div class="settings-wrapper" v-if="showSettings">
                <div class="settings" @click="toggleSettings" title="设置">
                    <i class="fas fa-cog"></i>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    export default{
        name:"HeaderBar",
        props: {
            // 页面标题
            pageTitle: {
                type: String,
                default: '仪表盘'
            },
            // 页面副标题
            pageSubtitle: {
                type: String,
                default: ''
            },
            // 是否显示面包屑导航
            showBreadcrumb: {
                type: Boolean,
                default: false
            },
            // 面包屑导航项
            breadcrumbItems: {
                type: Array,
                default: () => [
                    { id: 'home', label: '首页', path: '/' },
                    { id: 'dashboard', label: '仪表盘', path: '/dashboard' }
                ]
            },
            // 是否显示搜索框
            showSearch: {
                type: Boolean,
                default: true
            },
            // 搜索框占位符
            searchPlaceholder: {
                type: String,
                default: '搜索课程、用户、测试题...'
            },
            // 是否显示通知
            showNotifications: {
                type: Boolean,
                default: true
            },
            // 是否显示快速操作按钮
            showQuickActions: {
                type: Boolean,
                default: true
            },
            // 是否显示用户信息
            showUserInfo: {
                type: Boolean,
                default: true
            },
            // 是否显示设置按钮
            showSettings: {
                type: Boolean,
                default: false
            },
            // 是否在移动端显示
            isMobile: {
                type: Boolean,
                default: false
            },
            // 是否显示菜单切换按钮
            showMenuToggle: {
                type: Boolean,
                default: true
            },
            // 侧边栏是否收起
            sidebarCollapsed: {
                type: Boolean,
                default: false
            },
            // 用户信息
            userInfo: {
                type: Object,
                default: () => ({
                    name: '张老师',
                    email: 'zhang@example.com',
                    role: '管理员',
                    avatarColor: '#4361ee'
                })
            },
            // 通知列表
            notificationsList: {
                type: Array,
                default: () => [
                    {
                        id: 1,
                        title: '新用户注册',
                        message: '李同学刚刚注册了账号',
                        icon: 'fas fa-user-plus',
                        time: '5分钟前',
                        read: false
                    },
                    {
                        id: 2,
                        title: '课程审核通过',
                        message: '您的"Python编程入门"课程已通过审核',
                        icon: 'fas fa-check-circle',
                        time: '1小时前',
                        read: true
                    },
                    {
                        id: 3,
                        title: '系统维护通知',
                        message: '本周六凌晨2:00-4:00将进行系统维护',
                        icon: 'fas fa-tools',
                        time: '3小时前',
                        read: false
                    },
                    {
                        id: 4,
                        title: '作业提交提醒',
                        message: '有5名学生提交了"函数与模块"作业',
                        icon: 'fas fa-clipboard-check',
                        time: '1天前',
                        read: true
                    }
                ]
            }
        },
        data() {
            return {
                // 搜索相关数据
                searchQuery: '',
                isSearchFocused: false,
                showSearchSuggestions: true,
                
                // 搜索建议数据
                searchSuggestions: [
                    { id: 1, text: 'Python编程入门', type: '课程', icon: 'fas fa-book' },
                    { id: 2, text: '张同学', type: '用户', icon: 'fas fa-user' },
                    { id: 3, text: '函数与模块测试', type: '测试', icon: 'fas fa-clipboard-check' },
                    { id: 4, text: '机器学习实战', type: '课程', icon: 'fas fa-book' },
                    { id: 5, text: '数据分析入门', type: '课程', icon: 'fas fa-chart-bar' }
                ],
                
                // 通知相关数据
                showNotificationsPanel: false,
                notifications: this.notificationsList,
                
                // 用户菜单相关数据
                showUserMenu: false,
                
                // 快速操作按钮
                quickActions: [
                    { id: 'add-course', icon: 'fas fa-plus-circle', title: '创建课程' },
                    { id: 'add-user', icon: 'fas fa-user-plus', title: '添加用户' },
                    { id: 'add-test', icon: 'fas fa-clipboard', title: '创建测试' }
                ],
                
                // 用户菜单项
                userMenuItems: [
                    { id: 'profile', icon: 'fas fa-user', label: '个人资料' },
                    { id: 'account', icon: 'fas fa-cog', label: '账户设置' },
                    { id: 'messages', icon: 'fas fa-envelope', label: '我的消息' },
                    { id: 'help', icon: 'fas fa-question-circle', label: '帮助中心' }
                ]
            };
        },
        computed: {
            // 菜单切换按钮图标
            menuToggleIcon() {
                return this.sidebarCollapsed ? 'fas fa-bars' : 'fas fa-times';
            },
            
            // 用户名首字母（用于头像显示）
            userInitials() {
                if (this.userInfo.name && this.userInfo.name.length > 0) {
                    return this.userInfo.name.substring(0, 2);
                }
                return '用户';
            },
            
            // 用户头像颜色
            userAvatarColor() {
                return this.userInfo.avatarColor || '#4361ee';
            },
            
            // 用户名
            userName() {
                return this.userInfo.name || '用户';
            },
            
            // 用户邮箱
            userEmail() {
                return this.userInfo.email || 'user@example.com';
            },
            
            // 用户角色
            userRole() {
                return this.userInfo.role || '普通用户';
            },
            
            // 未读通知数量
            unreadCount() {
                return this.notifications.filter(notification => !notification.read).length;
            },
            
            // 是否有未读通知
            hasUnreadNotifications() {
                return this.unreadCount > 0;
            },
            
            // 过滤后的搜索建议
            filteredSuggestions() {
                if (!this.searchQuery) return [];
                const query = this.searchQuery.toLowerCase();
                return this.searchSuggestions.filter(suggestion => 
                    suggestion.text.toLowerCase().includes(query) || 
                    suggestion.type.toLowerCase().includes(query)
                ).slice(0, 5); // 只显示前5个建议
            }
        },
        watch: {
            // 监听通知列表变化
            notificationsList(newVal) {
                this.notifications = newVal;
            }
        },
        methods: {
            // 切换侧边栏显示状态
            toggleSidebar() {
                this.$emit('toggle-sidebar');
            },
            
            // 处理搜索
            handleSearch() {
                if (this.searchQuery.trim()) {
                    this.$emit('search', this.searchQuery);
                    this.searchQuery = '';
                }
            },
            
            // 选择搜索建议
            selectSuggestion(suggestion) {
                this.searchQuery = suggestion.text;
                this.$emit('select-suggestion', suggestion);
                this.isSearchFocused = false;
            },
            
            // 切换通知面板显示状态
            toggleNotifications() {
                this.showNotificationsPanel = !this.showNotificationsPanel;
                // 关闭用户菜单
                this.showUserMenu = false;
            },
            
            // 标记所有通知为已读
            markAllAsRead() {
                this.notifications = this.notifications.map(notification => ({
                    ...notification,
                    read: true
                }));
                this.$emit('mark-all-notifications-read');
            },
            
            // 处理通知点击
            handleNotificationClick(notification) {
            // 标记为已读
            if (!notification.read) {
                const index = this.notifications.findIndex(n => n.id === notification.id);
                if (index !== -1) {
                    this.notifications[index].read = true;
                }
            }
            
            // 触发事件
            this.$emit('notification-click', notification);
                this.showNotificationsPanel = false;
            },
            
            // 查看所有通知
            viewAllNotifications() {
                this.$emit('view-all-notifications');
                this.showNotificationsPanel = false;
            },
            
            // 切换用户菜单显示状态
            toggleUserMenu() {
                this.showUserMenu = !this.showUserMenu;
                // 关闭通知面板
                this.showNotificationsPanel = false;
            },
            
            // 处理用户菜单项点击
            handleUserMenuItemClick(itemId) {
                this.$emit('user-menu-item-click', itemId);
                this.showUserMenu = false;
            },
            
            // 处理退出登录
            handleLogout() {
                this.$emit('logout');
                this.showUserMenu = false;
            },
            
            // 处理快速操作按钮点击
            handleQuickAction(actionId) {
                this.$emit('quick-action-click', actionId);
            },
            
            // 切换设置面板
            toggleSettings() {
                this.$emit('toggle-settings');
            },
            
            // 面包屑导航点击
            navigateTo(path) {
                this.$emit('breadcrumb-navigate', path);
            }
        },
        mounted() {
            // 点击页面其他区域时关闭通知面板和用户菜单
            document.addEventListener('click', (event) => {
                const notificationWrapper = this.$el.querySelector('.notification-wrapper');
                const userInfoWrapper = this.$el.querySelector('.user-info-wrapper');
                
                if (notificationWrapper && !notificationWrapper.contains(event.target)) {
                    this.showNotificationsPanel = false;
                }
                
                if (userInfoWrapper && !userInfoWrapper.contains(event.target)) {
                    this.showUserMenu = false;
                }
            });
            
            // 监听键盘事件，ESC键关闭通知面板和用户菜单
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    this.showNotificationsPanel = false;
                    this.showUserMenu = false;
                }
            });
        }
    }
</script>

<style scoped>
    .header {
        height: 70px;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 25px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        position: sticky;
        top: 0;
        z-index: 999;
        transition: all 0.3s ease;
    }

    /* 移动端样式 */
    .header.mobile-header {
        padding: 0 15px;
    }

    /* 左侧区域 */
    .header-left {
        display: flex;
        align-items: center;
        gap: 20px;
        flex: 1;
        min-width: 0; /* 防止内容溢出 */
    }

    .menu-toggle {
        background: none;
        border: none;
        font-size: 20px;
        color: #4361ee;
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .menu-toggle:hover {
        background-color: rgba(67, 97, 238, 0.1);
    }

    /* 面包屑导航 */
    .breadcrumb {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: hidden;
    }

    .breadcrumb-item {
        display: flex;
        align-items: center;
    }

    .separator {
        margin: 0 8px;
        color: #6c757d;
        font-size: 14px;
    }

    .breadcrumb-link {
        color: #4361ee;
        cursor: pointer;
        font-size: 14px;
        transition: color 0.2s;
        white-space: nowrap;
    }

    .breadcrumb-link:hover {
        color: #3a0ca3;
        text-decoration: underline;
    }

    .current-page {
        color: #212529;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
    }

    /* 页面标题 */
    .page-title {
        display: flex;
        flex-direction: column;
    }

    .page-title h1 {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        color: #212529;
    }

    .page-subtitle {
        font-size: 13px;
        color: #6c757d;
        margin-top: 2px;
    }

    /* 中间区域 - 搜索框 */
    .header-center {
        flex: 2;
        display: flex;
        justify-content: center;
    }

    .search-bar {
        display: flex;
        align-items: center;
        background-color: #f5f7fb;
        border-radius: 50px;
        padding: 8px 20px;
        width: 100%;
        max-width: 500px;
        border: 1px solid #dee2e6;
        position: relative;
        transition: all 0.3s ease;
    }

    .search-bar.focused {
        border-color: #4361ee;
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
    }

    .search-bar i {
        color: #6c757d;
        margin-right: 10px;
        font-size: 16px;
    }

    .search-bar input {
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        font-size: 15px;
        color: #212529;
    }

    /* 搜索建议 */
    .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        margin-top: 5px;
        z-index: 1000;
        overflow: hidden;
        max-height: 300px;
        overflow-y: auto;
    }

    .suggestion-item {
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid #f8f9fa;
    }

    .suggestion-item:hover {
        background-color: #f8f9fa;
    }

    .suggestion-item i {
        color: #4361ee;
        font-size: 16px;
        width: 20px;
    }

    .suggestion-item span:first-of-type {
        flex: 1;
        color: #212529;
    }

    .suggestion-type {
        background-color: #e9ecef;
        color: #6c757d;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    /* 右侧区域 */
    .header-right {
        display: flex;
        align-items: center;
        gap: 20px;
        flex: 1;
        justify-content: flex-end;
    }

    /* 通知 */
    .notification-wrapper {
        position: relative;
    }

    .notification {
        position: relative;
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .notification:hover {
        background-color: rgba(67, 97, 238, 0.1);
    }

    .notification i {
        font-size: 20px;
        color: #6c757d;
    }

    .badge {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: #f44336;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }

    /* 通知面板 */
    .notifications-panel {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
        width: 350px;
        margin-top: 10px;
        z-index: 1000;
        overflow: hidden;
    }

    .notifications-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        border-bottom: 1px solid #f1f3f5;
    }

    .notifications-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #212529;
    }

    .mark-all-read {
        background: none;
        border: none;
        color: #4361ee;
        font-size: 14px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .mark-all-read:hover {
        background-color: rgba(67, 97, 238, 0.1);
    }

    .notifications-list {
        max-height: 400px;
        overflow-y: auto;
    }

    .notification-item {
        display: flex;
        padding: 15px 20px;
        cursor: pointer;
        border-bottom: 1px solid #f8f9fa;
        transition: background-color 0.2s;
    }

    .notification-item:hover {
        background-color: #f8f9fa;
    }

    .notification-item.unread {
        background-color: rgba(67, 97, 238, 0.05);
    }

    .notification-icon {
        margin-right: 15px;
        color: #4361ee;
        font-size: 18px;
        width: 24px;
        display: flex;
        align-items: flex-start;
    }

    .notification-content {
        flex: 1;
    }

    .notification-title {
        font-weight: 600;
        margin-bottom: 5px;
        color: #212529;
    }

    .notification-message {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 5px;
        line-height: 1.4;
    }

    .notification-time {
        font-size: 12px;
        color: #adb5bd;
    }

    .notification-actions {
        display: flex;
        align-items: flex-start;
    }

    .unread-dot {
        color: #4361ee;
        font-size: 8px;
    }

    .notifications-footer {
        padding: 15px 20px;
        text-align: center;
        border-top: 1px solid #f1f3f5;
        color: #4361ee;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .notifications-footer:hover {
        background-color: #f8f9fa;
    }

    /* 快速操作按钮 */
    .quick-actions {
        display: flex;
        gap: 10px;
    }

    .quick-action {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #6c757d;
        transition: all 0.2s;
        background-color: transparent;
        border: none;
    }

    .quick-action:hover {
        background-color: rgba(67, 97, 238, 0.1);
        color: #4361ee;
    }

    .quick-action i {
        font-size: 18px;
    }

    /* 用户信息 */
    .user-info-wrapper {
        position: relative;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .user-info:hover {
        background-color: rgba(67, 97, 238, 0.1);
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: white;
        flex-shrink: 0;
    }

    .user-details {
        display: flex;
        flex-direction: column;
        min-width: 0; /* 防止文本溢出 */
    }

    .user-name {
        font-weight: 600;
        font-size: 14px;
        color: #212529;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-role {
        font-size: 13px;
        color: #6c757d;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-menu-arrow {
        font-size: 12px;
        color: #6c757d;
        transition: transform 0.3s ease;
    }

    .user-menu-arrow.rotated {
        transform: rotate(180deg);
    }

    /* 用户菜单 */
    .user-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
        width: 280px;
        margin-top: 10px;
        z-index: 1000;
        overflow: hidden;
    }

    .user-menu-header {
        display: flex;
        align-items: center;
        padding: 20px;
        background-color: #f8f9fa;
        gap: 15px;
    }

    .avatar-large {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: white;
        font-size: 18px;
        flex-shrink: 0;
    }

    .user-info-large {
        flex: 1;
        min-width: 0; /* 防止文本溢出 */
    }

    .user-info-large .user-name {
        font-size: 16px;
        margin-bottom: 2px;
    }

    .user-email {
        font-size: 14px;
        color: #6c757d;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 2px;
    }

    .user-menu-items {
        padding: 10px 0;
    }

    .user-menu-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        cursor: pointer;
        gap: 12px;
        transition: background-color 0.2s;
    }

    .user-menu-item:hover {
        background-color: #f8f9fa;
    }

    .user-menu-item i {
        width: 20px;
        color: #6c757d;
        font-size: 16px;
    }

    .user-menu-item span {
        color: #212529;
        font-size: 14px;
    }

    .user-menu-footer {
        padding: 15px 20px;
        border-top: 1px solid #f1f3f5;
    }

    .logout-btn {
        width: 100%;
        padding: 10px 15px;
        background-color: #f8f9fa;
        color: #f44336;
        border: 1px solid #f1f3f5;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 500;
        transition: all 0.2s;
    }

    .logout-btn:hover {
        background-color: #f44336;
        color: white;
    }

    /* 设置按钮 */
    .settings-wrapper {
        display: flex;
        align-items: center;
    }

    .settings {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #6c757d;
        transition: all 0.2s;
    }

    .settings:hover {
        background-color: rgba(67, 97, 238, 0.1);
        color: #4361ee;
    }

    .settings i {
        font-size: 20px;
    }

        /* 响应式设计 */
    @media (max-width: 768px) {
        .header {
            padding: 0 15px;
        }
        
        .header-center {
            display: none;
        }
        
        .quick-actions {
            display: none;
        }
        
        .user-details {
            display: none;
        }
        
        .notifications-panel {
            width: 300px;
            right: -10px;
        }
        
        .user-menu {
            width: 250px;
            right: -10px;
        }
    }
</style>