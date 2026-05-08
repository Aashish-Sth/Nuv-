<script setup lang="ts">
const { lastAdded } = useCart();
</script>

<template>
  <transition name="toast-fade">
    <div
      v-if="lastAdded"
      class="fixed right-4 bottom-6 z-50 bg-nv-void/90 text-nv-text border border-nv-border px-4 py-2 rounded-md shadow-md"
    >
      <strong class="block">Added</strong>
      <div class="text-sm text-nv-muted">{{ lastAdded }}</div>
    </div>
  </transition>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
