<script setup lang="ts">
import { ArcElement, Chart as ChartJS, DoughnutController, Legend, LineElement, LinearScale, PointElement, Tooltip, CategoryScale } from "chart.js";
import { Doughnut, Line } from "vue-chartjs";

definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Analytics";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, ArcElement, DoughnutController);

const { request } = useApi();
const period = ref<"7d" | "30d" | "90d">("30d");
const overview = ref<Record<string, number>>({});
const revenue = ref<{ date: string; revenue: number; orderCount: number }[]>([]);
const topRestaurants = ref<Record<string, unknown>[]>([]);
const byStatus = ref<{ status: string; count: number }[]>([]);

async function load() {
  overview.value = await request("/analytics/overview");
  revenue.value = await request(`/analytics/revenue-chart?period=${period.value}`);
  topRestaurants.value = await request("/analytics/top-restaurants");
  byStatus.value = await request("/analytics/orders-by-status");
}

const revenueChartData = computed(() => ({
  labels: revenue.value.map((i) => i.date.slice(5)),
  datasets: [{ data: revenue.value.map((i) => i.revenue), borderColor: "#3DBA7A", backgroundColor: "rgba(61,186,122,0.15)", fill: true, tension: 0.35 }],
}));
const statusChartData = computed(() => ({
  labels: byStatus.value.map((i) => i.status),
  datasets: [{ data: byStatus.value.map((i) => i.count), backgroundColor: ["#F59E0B", "#3B82F6", "#F97316", "#3DBA7A", "#94A3B8", "#E5484D"], borderWidth: 0 }],
}));

const totalStatusCount = computed(() => byStatus.value.reduce((sum, item) => sum + item.count, 0));
onMounted(load);
watch(period, load);
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatsCard label="Total Orders" :value="overview.totalOrders ?? 0" icon="lucide:receipt" icon-bg="bg-admin-blue-lt text-admin-blue" trend="positive" trend-value="vs previous period" />
      <StatsCard label="Total Revenue" :value="`$${Number(overview.totalRevenue ?? 0).toFixed(2)}`" icon="lucide:dollar-sign" icon-bg="bg-nv-green-lt text-nv-green" trend="positive" trend-value="vs previous period" />
      <StatsCard label="Active Restaurants" :value="overview.activeRestaurants ?? 0" icon="lucide:store" icon-bg="bg-admin-amber-lt text-admin-amber" trend="positive" trend-value="vs previous period" />
      <StatsCard label="Total Customers" :value="overview.totalCustomers ?? 0" icon="lucide:users" icon-bg="bg-[#EDE9FE] text-[#7C3AED]" trend="positive" trend-value="vs previous period" />
    </div>

    <div class="bg-white border border-admin-border rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-sm">Revenue Chart</h3>
        <div class="flex gap-2">
          <button
            v-for="p in ['7d','30d','90d']"
            :key="p"
            class="h-8 px-3 rounded-md text-xs border"
            :class="period === p ? 'border-nv-green bg-nv-green-lt text-nv-green' : 'border-admin-border text-admin-muted'"
            @click="period = p"
          >
            {{ p }}
          </button>
        </div>
      </div>
      <Line :data="revenueChartData" :options="{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }" class="h-[280px]" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
      <div class="bg-white border border-admin-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-admin-border"><h3 class="font-semibold text-sm">Top Restaurants</h3></div>
        <table class="w-full text-sm">
          <thead class="bg-admin-bg text-admin-muted text-xs">
            <tr>
              <th class="text-left p-3">Rank</th>
              <th class="text-left p-3">Name</th>
              <th class="text-left p-3">Orders</th>
              <th class="text-left p-3">Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in topRestaurants" :key="String(item.restaurantId)" class="border-t border-admin-border">
              <td class="p-3">{{ index + 1 }}</td>
              <td class="p-3">{{ item.restaurantName }}</td>
              <td class="p-3">{{ item.orderCount }}</td>
              <td class="p-3">${{ Number(item.revenue ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white border border-admin-border rounded-lg p-6">
        <h3 class="font-semibold text-sm mb-4">Orders by Status</h3>
        <Doughnut :data="statusChartData" :options="{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }" class="h-[220px]" />
        <div class="mt-4 space-y-2">
          <div v-for="item in byStatus" :key="item.status" class="flex items-center justify-between text-sm">
            <span class="text-admin-muted">{{ item.status }}</span>
            <span class="font-medium">
              {{ item.count }}
              ({{ totalStatusCount ? ((item.count / totalStatusCount) * 100).toFixed(1) : "0.0" }}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
