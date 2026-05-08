<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Order Detail";

const route = useRoute();
const { request } = useApi();
const order = ref<Record<string, unknown> | null>(null);
const nextStatus = ref("");

const transitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

async function load() {
  order.value = await request(`/orders/${String(route.params.id)}`);
}

async function updateStatus() {
  if (!nextStatus.value) return;
  await request(`/orders/${String(route.params.id)}/status`, {
    method: "PATCH",
    body: { status: nextStatus.value },
  });
  nextStatus.value = "";
  await load();
}

const itemRows = computed(() => (order.value?.items as Record<string, unknown>[]) ?? []);
const total = computed(() =>
  itemRows.value.reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.qty ?? 0), 0),
);

onMounted(load);
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4" v-if="order">
    <div class="bg-white border border-admin-border rounded-lg p-5">
      <h3 class="font-semibold text-sm mb-4">Order Items</h3>
      <table class="w-full text-sm">
        <thead class="text-admin-muted text-xs">
          <tr>
            <th class="text-left py-2">Name</th>
            <th class="text-left py-2">Qty</th>
            <th class="text-left py-2">Unit</th>
            <th class="text-left py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in itemRows" :key="String(item.id)" class="border-t border-admin-border">
            <td class="py-2">{{ item.name }}</td>
            <td class="py-2">{{ item.qty }}</td>
            <td class="py-2">${{ Number(item.price).toFixed(2) }}</td>
            <td class="py-2">${{ (Number(item.qty) * Number(item.price)).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4 pt-4 border-t border-admin-border text-right font-semibold">Total: ${{ total.toFixed(2) }}</div>
      <div class="mt-6 grid gap-4">
        <div class="p-4 rounded-md bg-admin-bg border border-admin-border">
          <p class="text-xs uppercase text-admin-muted mb-1">Delivery Address</p>
          <p class="text-sm">{{ order.deliveryAddress }}</p>
        </div>
        <div v-if="order.notes" class="p-4 rounded-md bg-admin-bg border border-admin-border">
          <p class="text-xs uppercase text-admin-muted mb-1">Notes</p>
          <p class="text-sm">{{ order.notes }}</p>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="bg-white border border-admin-border rounded-lg p-5">
        <h3 class="font-semibold text-sm mb-3">Status Timeline</h3>
        <div class="space-y-2">
          <div
            v-for="step in ['PENDING','CONFIRMED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED']"
            :key="step"
            class="flex items-center gap-2 text-sm"
            :class="order.status === step ? 'text-nv-green font-medium' : 'text-admin-muted'"
          >
            <span class="w-2 h-2 rounded-full" :class="order.status === step ? 'bg-nv-green' : 'bg-admin-border'" />
            {{ step }}
          </div>
        </div>
      </div>

      <div class="bg-white border border-admin-border rounded-lg p-5">
        <h3 class="font-semibold text-sm mb-3">Update Status</h3>
        <select v-model="nextStatus" class="w-full h-10 rounded-md border border-admin-border px-3 text-sm">
          <option value="">Select next status</option>
          <option v-for="step in transitions[String(order.status)] ?? []" :key="step" :value="step">{{ step }}</option>
        </select>
        <button class="mt-3 h-10 w-full rounded-md bg-nv-green text-white text-sm" @click="updateStatus">Confirm</button>
      </div>

      <div class="bg-white border border-admin-border rounded-lg p-5">
        <h3 class="font-semibold text-sm mb-2">Customer</h3>
        <p class="text-sm">{{ order.customer?.name }}</p>
        <p class="text-sm text-admin-muted">{{ order.customer?.email }}</p>
      </div>
    </div>
  </div>
</template>
