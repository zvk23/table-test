<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" v-if="modelValue" @click.self="onBackdropClick">
      <div
        class="modal"
      >
        <header class="modal__header" v-if="$slots.header">
          <slot name="header"></slot>
        </header>

        <div class="modal__body">
          <slot></slot>
        </div>

        <footer class="modal__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </footer>

        <button class="modal__close" @click="close" >×</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  backdropClose: { type: Boolean, default: true },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onBackdropClick() {
  if (props.backdropClose) close();
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 8px;
  width: 92%;
  max-width: 720px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  padding: 16px;
  outline: none;
}

.modal__header {
  font-weight: 600;
  margin-bottom: 8px;
}

.modal__body {
  max-height: 60vh;
  overflow: auto;
}

.modal__footer {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.modal__close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
