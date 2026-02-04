<template>
  <div class="vue-ui-modal-backdrop" @click.self="$emit('close')">
    <div class="vue-ui-modal" :class="{ small }">
      <div class="vue-ui-modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="$emit('close')" aria-label="Close">×</button>
      </div>
      <div class="vue-ui-modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VueModal',
  props: {
    title: {
      type: String,
      default: '',
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  mounted() {
    document.body.style.overflow = 'hidden';
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  },
};
</script>

<style scoped>
.vue-ui-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  z-index: 2000;
}

.vue-ui-modal {
  background: white;
  border-radius: 0;
  max-width: 400px;
  width: 400px;
  height: 100vh;
  max-height: 100vh;
  overflow: auto;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}

.vue-ui-modal.small {
  max-width: 400px;
}

@media (max-width: 768px) {
  .vue-ui-modal {
    width: 100%;
    max-width: 100%;
  }

  .vue-ui-modal.small {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .vue-ui-modal-backdrop {
    justify-content: center;
    align-items: center;
  }

  .vue-ui-modal {
    width: 95%;
    max-width: 95%;
    height: auto;
    max-height: 95vh;
    border-radius: 8px;
  }

  .vue-ui-modal.small {
    width: 90%;
    max-width: 90%;
  }
}

.vue-ui-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.vue-ui-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #000;
}

.vue-ui-modal-body {
  padding: 20px;
}
</style>
