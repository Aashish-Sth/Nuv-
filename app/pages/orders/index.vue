<script setup lang="ts">
definePageMeta({ middleware: "userOnly" });
useHead({ title: "My Orders — Nuvé" });

const { accessToken } = useAuth();
const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl || "";

const orders = ref<Array<any>>([]);
const isLoading = ref(false);
const errorMessage = ref("");

async function fetchOrders() {
  if (!accessToken.value) return;

  try {
    isLoading.value = true;
    errorMessage.value = "";
    const url = backendUrl ? `${backendUrl}/api/orders/my` : "/api/orders/my";
    const res = await $fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });
    orders.value = ((res as any)?.data?.items || []) as any[];
  } catch (error: any) {
    errorMessage.value =
      error?.data?.error || error?.message || "Failed to load orders.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchOrders);
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container">
      <h1 class="nv-heading text-3xl mb-6">My Orders</h1>
      <p v-if="isLoading" class="text-nv-muted">Loading orders...</p>
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md"
      >
        {{ errorMessage }}
      </div>
      <div v-if="orders.length" class="space-y-4">
        <div
          v-for="o in orders"
          :key="o.id"
          class="bg-nv-surface border border-nv-border rounded-[12px] p-4"
        >
          <div class="flex justify-between">
            <div>
              <div class="font-semibold">Order {{ o.id.slice(-8) }}</div>
              <div class="text-sm text-nv-muted">
                {{ o.restaurant?.name || "Restaurant" }}
              </div>
              <div class="text-sm text-nv-muted">{{ o.status }}</div>
            </div>
            <div class="text-nv-green font-semibold">
              ${{ Number(o.total || 0).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-20">
        <p class="text-nv-muted">You have no orders yet.</p>
        <NuxtLink
          to="/menu"
          class="inline-flex items-center gap-2 bg-nv-green hover:bg-nv-green-dk text-nv-void font-semibold text-sm px-7 py-3.5 rounded-[10px] transition-all duration-300"
          >Explore Menu</NuxtLink
        >
      </div>
    </div>
  </div>
</template>
