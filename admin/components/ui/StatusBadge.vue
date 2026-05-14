<script setup lang="ts">
import type { OrderStatus } from "@nuve/shared";

const props = defineProps<{
  status: OrderStatus | string;
}>();

const statusMap: Record<string, string> = {
  PENDING: "bg-admin-amber-lt text-admin-amber",
  CONFIRMED: "bg-admin-blue-lt text-admin-blue",
  PREPARING: "bg-[#FFF5E6] text-[#D97706]",
  OUT_FOR_DELIVERY: "bg-nv-green-lt text-nv-green",
  DELIVERED: "bg-[#F2F4F7] text-[#667085]",
  CANCELLED: "bg-admin-red-lt text-admin-red",
  ACTIVE: "bg-nv-green-lt text-nv-green",
  INACTIVE: "bg-[#F2F4F7] text-[#667085]",
};

const label = computed(() => String(props.status).replaceAll("_", " "));
const badgeClass = computed(() => statusMap[String(props.status)] ?? "bg-[#F2F4F7] text-[#667085]");
</script>

<template>
  <span class="inline-flex items-center px-2.5 py-1 rounded-pill text-[11px] font-medium" :class="badgeClass">
    {{ label }}
  </span>
</template>
