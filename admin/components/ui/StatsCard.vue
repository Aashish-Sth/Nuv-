<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  icon: string;
  iconBg: string;
  trend?: "positive" | "negative";
  trendValue?: string;
}>();
</script>

<template>
  <div class="bg-admin-surface border border-admin-border rounded-lg p-6">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[13px] text-admin-muted">{{ label }}</p>
        <p class="text-[28px] leading-tight font-semibold text-admin-text mt-2">{{ value }}</p>
      </div>
      <div class="w-8 h-8 rounded-full grid place-items-center" :class="iconBg">
        <Icon :name="icon" size="16" />
      </div>
    </div>
    <p v-if="trendValue" class="text-xs mt-3" :class="trend === 'negative' ? 'text-admin-red' : 'text-nv-green'">
      {{ trend === "negative" ? "↓" : "↑" }} {{ trendValue }}
    </p>
  </div>
</template>
