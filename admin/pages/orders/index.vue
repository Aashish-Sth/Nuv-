<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";

definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Orders";

const { request } = useApi();
const page = ref(1);
const totalPages = ref(1);
const status = ref("");
const restaurantId = ref("");
const search = ref("");
const fromDate = ref("");
const toDate = ref("");
const rows = ref<Record<string, unknown>[]>([]);
const selectedOrder = ref<Record<string, unknown> | null>(null);
const statusDialog = ref(false);
const nextStatus = ref("");

const statusOptions = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const transitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

async function load() {
  const params = new URLSearchParams({
    page: String(page.value),
    limit: "12",
  });
  if (status.value) params.set("status", status.value);
  if (restaurantId.value) params.set("restaurantId", restaurantId.value);

  const data = await request<{ items: Record<string, unknown>[]; totalPages: number }>(
    `/orders?${params.toString()}`,
  );
  rows.value = data.items.filter((order) => {
    const matchesSearch = search.value
      ? String(order.id).toLowerCase().includes(search.value.toLowerCase())
      : true;
    const createdAt = new Date(String(order.createdAt));
    const afterFrom = fromDate.value ? createdAt >= new Date(fromDate.value) : true;
    const beforeTo = toDate.value ? createdAt <= new Date(toDate.value) : true;
    return matchesSearch && afterFrom && beforeTo;
  });
  totalPages.value = data.totalPages || 1;
}

function openStatusDialog(order: Record<string, unknown>) {
  selectedOrder.value = order;
  nextStatus.value = "";
  statusDialog.value = true;
}

async function updateStatus() {
  if (!selectedOrder.value?.id || !nextStatus.value) return;
  await request(`/orders/${String(selectedOrder.value.id)}/status`, {
    method: "PATCH",
    body: { status: nextStatus.value },
  });
  statusDialog.value = false;
  await load();
}

onMounted(load);
watch([status, restaurantId, page], load);
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-3">
      <div class="flex gap-2">
        <button
          v-for="pill in ['','PENDING','CONFIRMED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED']"
          :key="pill || 'ALL'"
          class="px-3 h-9 rounded-pill text-xs border"
          :class="status === pill ? 'bg-nv-green-lt text-nv-green border-nv-green' : 'border-admin-border text-admin-muted'"
          @click="status = pill"
        >
          {{ pill || "ALL" }}
        </button>
      </div>
      <input v-model="restaurantId" placeholder="Restaurant ID" class="h-9 rounded-md border border-admin-border px-3 text-sm" />
      <input v-model="fromDate" type="date" class="h-9 rounded-md border border-admin-border px-3 text-sm" />
      <input v-model="toDate" type="date" class="h-9 rounded-md border border-admin-border px-3 text-sm" />
      <input v-model="search" placeholder="Search order ID" class="h-9 rounded-md border border-admin-border px-3 text-sm" />
    </div>

    <DataTable
      :rows="rows"
      :columns="[
        { key: 'id', label: 'Order ID' },
        { key: 'customer', label: 'Customer' },
        { key: 'restaurantId', label: 'Restaurant' },
        { key: 'items', label: 'Items' },
        { key: 'total', label: 'Total' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created' },
        { key: 'actions', label: 'Actions' }
      ]"
      :on-row-click="(row) => navigateTo(`/orders/${String(row.id)}`)"
    >
      <template #cell-id="{ row }"><span class="font-mono text-xs">{{ String(row.id).slice(0, 10) }}...</span></template>
      <template #cell-customer="{ row }">{{ row.customer?.name ?? "-" }}</template>
      <template #cell-items="{ row }">{{ (row.items as unknown[])?.length ?? 0 }}</template>
      <template #cell-total="{ row }">${{ Number(row.total ?? 0).toFixed(2) }}</template>
      <template #cell-status="{ row }"><StatusBadge :status="String(row.status)" /></template>
      <template #cell-actions="{ row }">
        <button class="text-xs px-2 py-1 border rounded border-admin-border" @click.stop="openStatusDialog(row)">
          Update Status
        </button>
      </template>
    </DataTable>

    <Pagination :current-page="page" :total-pages="totalPages" :on-page-change="(nextPage) => (page = nextPage)" />

    <TransitionRoot :show="statusDialog" as="template">
      <Dialog as="div" class="relative z-50" @close="statusDialog = false">
        <div class="fixed inset-0 bg-black/20" />
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100">
            <DialogPanel class="w-full max-w-sm bg-white border border-admin-border rounded-lg p-5">
              <DialogTitle class="font-semibold">Update Status</DialogTitle>
              <select v-model="nextStatus" class="mt-4 h-10 w-full rounded-md border border-admin-border px-3 text-sm">
                <option value="">Select next status</option>
                <option
                  v-for="next in transitions[String(selectedOrder?.status ?? '')] || statusOptions"
                  :key="next"
                  :value="next"
                >
                  {{ next }}
                </option>
              </select>
              <div class="mt-4 flex justify-end gap-2">
                <button class="px-3 py-2 text-sm border border-admin-border rounded-md" @click="statusDialog = false">Cancel</button>
                <button class="px-3 py-2 text-sm bg-nv-green text-white rounded-md" @click="updateStatus">Confirm</button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
