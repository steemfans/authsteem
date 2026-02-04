<template>
  <div class="vue-ui-loading-indicator">
    <div class="spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'VueLoadingIndicator',
};
</script>

<style scoped>
.vue-ui-loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.vue-ui-loading-indicator.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.vue-ui-loading-indicator.overlay.fixed {
  position: fixed;
}

.vue-ui-loading-indicator.big .spinner {
  width: 48px;
  height: 48px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
