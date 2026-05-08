<script setup lang="ts">
import { ArcElement, Chart as ChartJS, DoughnutController, Legend, LineElement, LinearScale, PointElement, Tooltip, CategoryScale } from "chart.js";
import { Doughnut, Line } from "vue-chartjs";
import type { OrderStatus } from "@nuve/shared";

definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Dashboard";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement, DoughnutController);

const { request } = useApi();
const overview = ref({
  totalOrders: 0,
  totalRevenue: 0,
  activeRestaurants: 0,
  totalCustomers: 0,
});
const revenueData = ref<{ date: string; revenue: number; orderCount: number }[]>([]);
const statusData = ref<{ status: OrderStatus; count: number }[]>([]);
const recentOrders = ref<Record<string, unknown>[]>([]);
const loading = ref(true);

const revenueChartData = computed(() => ({
  labels: revenueData.value.map((i) => i.date.slice(5)),
  datasets: [
    {
      data: revenueData.value.map((i) => i.revenue),
      borderColor: "#3DBA7A",
      backgroundColor: "rgba(61,186,122,0.15)",
      borderWidth: 2,
      fill: true,
      tension: 0.35,
    },
  ],
}));

const doughnutData = computed(() => ({
  labels: statusData.value.map((i) => i.status),
  datasets: [
    {
      data: statusData.value.map((i) => i.count),
      backgroundColor: ["#F59E0B", "#3B82F6", "#F97316", "#3DBA7A", "#94A3B8", "#E5484D"],
      borderWidth: 0,
    },
  ],
}));

onMounted(async () => {
  try {
    overview.value = await request("/analytics/overview");
    revenueData.value = await request("/analytics/revenue-chart?period=30d");
    statusData.value = await request("/analytics/orders-by-status");
    const orderList = await request<{ items: Record<string, unknown>[] }>("/orders?limit=10&page=1");
    recentOrders.value = orderList.items ?? [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatsCard label="Total Orders" :value="overview.totalOrders" icon="lucide:receipt" icon-bg="bg-admin-blue-lt text-admin-blue" trend="positive" trend-value="12% from last week" />
      <StatsCard label="Total Revenue" :value="`$${overview.totalRevenue.toFixed(2)}`" icon="lucide:dollar-sign" icon-bg="bg-nv-green-lt text-nv-green" trend="positive" trend-value="8% from last week" />
      <StatsCard label="Active Restaurants" :value="overview.activeRestaurants" icon="lucide:store" icon-bg="bg-admin-amber-lt text-admin-amber" trend="positive" trend-value="4% from last week" />
      <StatsCard label="Total Customers" :value="overview.totalCustomers" icon="lucide:users" icon-bg="bg-[#EDE9FE] text-[#7C3AED]" trend="negative" trend-value="2% from last week" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[1.9fr_1fr] gap-4">
      <div class="bg-admin-surface border border-admin-border rounded-lg p-6">
        <h3 class="text-sm font-semibold mb-4">Revenue Last 30 Days</h3>
        <Line :data="revenueChartData" :options="{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }" class="h-[280px]" />
      </div>
      <div class="bg-admin-surface border border-admin-border rounded-lg p-6">
        <h3 class="text-sm font-semibold mb-4">Orders by Status</h3>
        <Doughnut :data="doughnutData" :options="{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }" class="h-[280px]" />
      </div>
    </div>

    <div class="bg-admin-surface border border-admin-border rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-admin-border">
        <h3 class="font-semibold text-sm">Recent Orders</h3>
      </div>
      <DataTable
        :loading="loading"
        :rows="recentOrders"
        :columns="[
          { key: 'id', label: 'Order ID' },
          { key: 'customerId', label: 'Customer' },
          { key: 'restaurantId', label: 'Restaurant' },
          { key: 'total', label: 'Total' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Date' }
        ]"
        :on-row-click="(row) => navigateTo(`/orders/${String(row.id)}`)"
      >
        <template #cell-id="{ row }">
          <span class="font-mono text-[13px]">{{ String(row.id).slice(0, 10) }}...</span>
        </template>
        <template #cell-total="{ row }">${{ Number(row.total ?? 0).toFixed(2) }}</template>
        <template #cell-status="{ row }"><StatusBadge :status="String(row.status)" /></template>
      </DataTable>
    </div>
  </div>
</template>
