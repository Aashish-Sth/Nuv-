<script setup lang="ts">
type Column = {
  key: string;
  label: string;
  width?: string;
};

const props = defineProps<{
  columns: Column[];
  rows: Record<string, unknown>[];
  loading?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
}>();

const sortKey = ref<string>("");
const sortDir = ref<"asc" | "desc">("asc");

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows;
  return [...props.rows].sort((a, b) => {
    const av = String(a[sortKey.value] ?? "");
    const bv = String(b[sortKey.value] ?? "");
    const compare = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
    return sortDir.value === "asc" ? compare : -compare;
  });
});

function toggleSort(columnKey: string) {
  if (sortKey.value === columnKey) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    return;
  }
  sortKey.value = columnKey;
  sortDir.value = "asc";
}
</script>

<template>
  <div class="border border-admin-border rounded-lg overflow-hidden bg-admin-surface">
    <table class="w-full">
      <thead class="bg-admin-bg">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em] text-admin-muted cursor-pointer"
            :style="{ width: col.width }"
            @click="toggleSort(col.key)"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr v-for="index in 5" :key="index">
          <td v-for="col in columns" :key="col.key + index" class="px-4 py-3">
            <div class="h-4 w-full animate-pulse rounded bg-admin-border" />
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="sortedRows.length === 0">
        <tr>
          <td :colspan="columns.length" class="px-4 py-12 text-center">
            <div class="text-admin-muted flex flex-col items-center gap-2">
              <Icon name="lucide:inbox" size="20" />
              <p>No results found</p>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr
          v-for="(row, rowIndex) in sortedRows"
          :key="rowIndex"
          class="border-t border-admin-border hover:bg-admin-bg transition-colors"
          @click="onRowClick?.(row)"
        >
          <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-sm text-admin-text">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
