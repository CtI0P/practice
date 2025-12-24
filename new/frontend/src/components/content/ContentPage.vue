<template>
  <div class="content-page">
    <!-- 头部导航栏 -->
    <HeaderBar 
      :active-menu-item="activeMenuItem"
      @toggle-sidebar="toggleSidebar"
    />
    
    <div class="page-container">
      <!-- 侧边栏 -->
      <SiderBar 
        :active-item-id="activeMenuItem"
        @item-selected="handleMenuItemSelect"
      />
      
      <!-- 内容区域 -->
      <ContentArea 
        :active-menu-item="activeMenuItem"
        :sidebar-collapsed="sidebarCollapsed"
        :show-right-sidebar="showRightSidebar"
        @update:activeMenuItem="activeMenuItem = $event"
        @card-clicked="handleCardClick"
        @page-action="handlePageAction"
      />
    </div>
  </div>
</template>

<script>
import HeaderBar from './HeaderBar.vue';
import SiderBar from './SiderBar.vue';
import ContentArea from './ContentArea.vue';

export default {
  components: {
    HeaderBar,
    SiderBar,
    ContentArea
  },
  data() {
    return {
      activeMenuItem: 'dashboard',
      sidebarCollapsed: false,
      showRightSidebar: true
    };
  },
  methods: {
    handleMenuItemSelect(itemId) {
      this.activeMenuItem = itemId;
    },
    handleCardClick(cardId) {
      // 处理功能卡片点击
      console.log('点击了功能卡片:', cardId);
      this.activeMenuItem = cardId;
    },
    handlePageAction(actionId) {
      // 处理页面操作按钮点击
      console.log('点击了页面操作按钮:', actionId);
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }
};
</script>