<template>
  <div class="loading-overlay">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingOverlay'
};
</script>

<style scoped>
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
</style>