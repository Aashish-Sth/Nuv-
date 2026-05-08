<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>();

const pages = computed<(number | "...")[]>(() => {
  if (props.totalPages <= 5) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1);
  }
  const p = props.currentPage;
  if (p <= 3) return [1, 2, 3, 4, "...", props.totalPages];
  if (p >= props.totalPages - 2) {
    return [1, "...", props.totalPages - 3, props.totalPages - 2, props.totalPages - 1, props.totalPages];
  }
  return [1, "...", p - 1, p, p + 1, "...", props.totalPages];
});
</script>

<template>
  <div class="flex items-center gap-2 text-[13px]">
    <button
      class="px-3 py-1.5 rounded-md border border-admin-border disabled:opacity-50"
      :disabled="currentPage <= 1"
      @click="onPageChange(currentPage - 1)"
    >
      Prev
    </button>
    <button
      v-for="page in pages"
      :key="String(page) + currentPage"
      class="px-3 py-1.5 rounded-md border"
      :class="
        page === currentPage
          ? 'border-nv-green bg-nv-green-lt text-nv-green'
          : 'border-admin-border text-admin-muted'
      "
      :disabled="page === '...'"
      @click="typeof page === 'number' ? onPageChange(page) : null"
    >
      {{ page }}
    </button>
    <button
      class="px-3 py-1.5 rounded-md border border-admin-border disabled:opacity-50"
      :disabled="currentPage >= totalPages"
      @click="onPageChange(currentPage + 1)"
    >
      Next
    </button>
  </div>
</template>
