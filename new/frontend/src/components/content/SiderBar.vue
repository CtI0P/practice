<!-- 侧边栏 -->
<template>
    <div class="sidebar" :class="{ 'mobile-active': isMobileActive }">
         <!-- 关闭按钮（移动端显示） -->
        <div class="mobile-close" @click="closeMobileSidebar" v-if="isMobile">
            <i class="fas fa-times"></i>
        </div>

        <!-- LOGO区域 -->
        <div class="logo-area">
            <div class="logo">
                <i class="fas fa-graduation-cap"></i>
                <span>砂轮学苑</span>
            </div>
        </div>
        
        <!-- 导航菜单 -->
        <div class="nav-menu">
            <div 
                v-for="item in navItems" 
                :key="item.id"
                class="nav-item" 
                :class="{ active: activeItem === item.id }"
                @click="selectItem(item.id)"
            >
                <i :class="item.icon"></i>
                <span class="nav-text">{{ item.text }}</span>
                <div class="active-indicator"></div>
                <span v-if="item.badge" class="badge">{{ item.badge }}</span>
            </div>
        </div>
        
        <div class="sidebar-footer" v-if="showUserInfo">
            <div class="user-profile">
                <div class="avatar" :style="{ backgroundColor: userAvatarColor }">
                    {{ userInitials }}
                </div>
                <div class="user-details">
                    <div class="user-name">{{ userName }}</div>
                    <div class="user-role">{{ userRole }}</div>
                </div>
                <i 
                    class="fas fa-sign-out-alt logout-btn" 
                    @click="logout"
                    title="退出登录"
                ></i>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'SiderBar',
        props: {
            // 当前激活的菜单项ID
            activeItemId: {
                type: String,
                default: 'dashboard'
            },
            // 是否在移动端显示
            isMobile: {
                type: Boolean,
                default: false
            },
            // 移动端侧边栏是否激活
            mobileActive: {
                type: Boolean,
                default: false
            },
            // 是否显示用户信息
            showUserInfo: {
                type: Boolean,
                default: true
            },
            // 用户信息
            userInfo: {
                type: Object,
                default: () => ({
                    name: '张老师',
                    role: '管理员',
                    avatarColor: '#4361ee'
                })
            }
        },
        data() {
            return {
                // 导航菜单项数据
                navItems: [
                    {
                        id: 'dashboard',
                        text: '仪表盘',
                        icon: 'fas fa-home',
                        subItems: null
                    },
                    {
                        id: 'user-management',
                        text: '用户管理',
                        icon: 'fas fa-users',
                        subItems: [
                            { id: 'user-list', text: '用户列表', icon: 'fas fa-list' },
                            { id: 'user-add', text: '添加用户', icon: 'fas fa-user-plus' },
                            { id: 'user-roles', text: '权限管理', icon: 'fas fa-user-shield' }
                        ]
                    },
                    {
                        id: 'course-management',
                        text: '课程管理',
                        icon: 'fas fa-book-open',
                        subItems: [
                            { id: 'course-list', text: '课程列表', icon: 'fas fa-list' },
                            { id: 'course-add', text: '创建课程', icon: 'fas fa-plus-circle' },
                            { id: 'course-categories', text: '课程分类', icon: 'fas fa-tags' }
                        ]
                    },
                    {
                        id: 'video-playback',
                        text: '视频播放',
                        icon: 'fas fa-video',
                        subItems: [
                            { id: 'video-library', text: '视频库', icon: 'fas fa-film' },
                            { id: 'video-upload', text: '上传视频', icon: 'fas fa-upload' },
                            { id: 'video-playlists', text: '播放列表', icon: 'fas fa-list-ol' }
                        ]
                    },
                    {
                        id: 'online-testing',
                        text: '在线测试',
                        icon: 'fas fa-clipboard-check',
                        subItems: [
                            { id: 'test-list', text: '测试列表', icon: 'fas fa-list' },
                            { id: 'test-create', text: '创建测试', icon: 'fas fa-plus' },
                            { id: 'question-bank', text: '题库管理', icon: 'fas fa-database' }
                        ]
                    },
                    {
                        id: 'community-interaction',
                        text: '社区互动',
                        icon: 'fas fa-comments',
                        subItems: [
                            { id: 'forum', text: '论坛讨论', icon: 'fas fa-comments' },
                            { id: 'qna', text: '问答社区', icon: 'fas fa-question-circle' },
                            { id: 'chat', text: '实时聊天', icon: 'fas fa-comment-dots' }
                        ]
                    },
                    {
                        id: 'data-analysis',
                        text: '数据分析',
                        icon: 'fas fa-chart-bar',
                        subItems: [
                            { id: 'progress-tracking', text: '学习进度', icon: 'fas fa-chart-line' },
                            { id: 'user-analytics', text: '用户分析', icon: 'fas fa-user-chart' },
                            { id: 'course-analytics', text: '课程分析', icon: 'fas fa-chart-pie' }
                        ]
                    },
                    {
                        id: 'settings',
                        text: '系统设置',
                        icon: 'fas fa-cog',
                        subItems: [
                            { id: 'general-settings', text: '通用设置', icon: 'fas fa-sliders-h' },
                            { id: 'notification-settings', text: '通知设置', icon: 'fas fa-bell' },
                            { id: 'security-settings', text: '安全设置', icon: 'fas fa-shield-alt' }
                        ]
                    }
                ],
                // 当前激活的菜单项
                activeItem: this.activeItemId,
                // 移动端侧边栏激活状态
                isMobileActive: this.mobileActive
            };
        },
        computed: {
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
            // 用户角色
            userRole() {
                return this.userInfo.role || '普通用户';
            }
        },
        watch: {
            // 监听父组件传递的激活项变化
            activeItemId(newVal) {
                this.activeItem = newVal;
            },
            // 监听移动端激活状态变化
            mobileActive(newVal) {
                this.isMobileActive = newVal;
            },
        },
        methods: {
            // 选择菜单项
                selectItem(itemId) {
                this.activeItem = itemId;
                // 通知父组件菜单项已改变
                this.$emit('item-selected', itemId);
                
                // 如果是移动端，选择后自动关闭侧边栏
                if (this.isMobile) {
                    this.closeMobileSidebar();
                }
            },
            
            // 选择子菜单项
            selectSubItem(subItemId) {
                // 通知父组件子菜单项已选择
                this.$emit('subitem-selected', {
                    parentId: this.activeItem,
                    subItemId: subItemId
                });
            },
            
            // 关闭移动端侧边栏
            closeMobileSidebar() {
                this.isMobileActive = false;
                this.$emit('close-mobile-sidebar');
            },
            
            // 退出登录
            logout() {
                this.$emit('logout');
            }
        },
        mounted() {
            // 组件挂载后，可以根据需要初始化数据
            console.log('Sidebar component mounted');
        }
    }
</script>

<style scoped>
    .sidebar {
        width: 260px;
        background: linear-gradient(180deg, #4361ee 0%, #3a0ca3 100%);
        color: white;
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        overflow-y: auto;
        transition: transform 0.3s ease, width 0.3s ease;
        z-index: 1000;
        box-shadow: 3px 0 15px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
    }

    /* 移动端适配 */
    @media (max-width: 992px) {
        .sidebar {
            transform: translateX(-100%);
            width: 280px;
        }
    
        .sidebar.mobile-active {
            transform: translateX(0);
            box-shadow: 5px 0 25px rgba(0, 0, 0, 0.2);
        }
        
        .mobile-close {
            display: flex;
            position: absolute;
            right: 15px;
            top: 15px;
            font-size: 24px;
            color: white;
            cursor: pointer;
            z-index: 1001;
            background-color: rgba(255, 255, 255, 0.1);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        
        .mobile-close:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
    }

    /* 桌面端隐藏关闭按钮 */
    .mobile-close {
        display: none;
    }

    /* Logo区域样式 */
    .logo-area {
        padding: 20px 15px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    }

    .logo {
        font-size: 24px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .logo i {
        color: #4cc9f0;
        font-size: 28px;
    }

    /* 导航菜单样式 */
    .nav-menu {
        padding: 20px 0;
        flex-grow: 1;
        overflow-y: auto;
    }

    .nav-item {
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        border-left: 4px solid transparent;
        flex-direction: column;
        align-items: flex-start;
    }

    .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-left-color: #4cc9f0;
    }

    .nav-item.active {
        background-color: rgba(255, 255, 255, 0.15);
        border-left-color: #4cc9f0;
        font-weight: 600;
    }

    .nav-item i {
        width: 24px;
        text-align: center;
        font-size: 18px;
    }

    .nav-text {
        font-size: 15px;
        flex-grow: 1;
    }

    /* 子菜单样式 */
    .submenu {
        width: 100%;
        margin-top: 10px;
        margin-left: 10px;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        padding-left: 10px;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .submenu-item {
        padding: 8px 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        border-radius: 6px;
        margin-bottom: 5px;
        transition: all 0.2s;
        font-size: 14px;
    }

    .submenu-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .submenu-item i {
        font-size: 14px;
        width: 20px;
    }

    /* 激活指示器 */
    .active-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #4cc9f0;
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: none;
    }

    .nav-item.active .active-indicator {
        display: block;
    }

    /* 侧边栏底部用户信息 */
    .sidebar-footer {
        padding: 20px 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 12px;
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
        flex-grow: 1;
        overflow: hidden;
    }

    .user-name {
        font-weight: 600;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-role {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .logout-btn {
        font-size: 18px;
        cursor: pointer;
        transition: color 0.2s;
        padding: 5px;
        border-radius: 4px;
    }

    .logout-btn:hover {
        color: #4cc9f0;
        background-color: rgba(255, 255, 255, 0.1);
    }

    /* 滚动条样式 */
    .sidebar::-webkit-scrollbar {
        width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }

    .sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
</style>