<script setup lang="ts">
defineProps<{
  label: string;
  error?: string;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <p class="text-[11px] uppercase tracking-[0.08em] text-admin-muted">{{ label }}</p>
    <slot />
    <p v-if="error" class="text-xs text-admin-red">{{ error }}</p>
  </div>
</template>
