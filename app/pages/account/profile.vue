<script setup lang="ts">
definePageMeta({ middleware: "userOnly" });

const { user, updateProfile, isLoading, accessToken } = useAuth();
const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl || "";

const formData = reactive({
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
});

const saveMessage = ref("");
const saveError = ref("");
const orders = ref<Array<any>>([]);
const ordersLoading = ref(false);
const ordersError = ref("");

watch(
  () => user.value,
  (value) => {
    formData.name = value?.name || "";
    formData.email = value?.email || "";
  },
  { immediate: true },
);

async function fetchOrders() {
  if (!accessToken.value) return;
  ordersLoading.value = true;
  ordersError.value = "";
  try {
    const url = backendUrl ? `${backendUrl}/api/orders/my` : "/api/orders/my";
    const res = await $fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });
    orders.value = ((res as any)?.data?.items || []) as any[];
  } catch (error: any) {
    ordersError.value =
      error?.data?.error || error?.message || "Failed to load order history.";
  } finally {
    ordersLoading.value = false;
  }
}

async function handleSaveProfile() {
  saveMessage.value = "";
  saveError.value = "";

  const payload: any = {
    name: formData.name,
    email: formData.email,
  };

  if (formData.newPassword) {
    payload.currentPassword = formData.currentPassword;
    payload.newPassword = formData.newPassword;
  }

  const result = await updateProfile(payload);
  if (!result.success) {
    saveError.value = result.error || "Failed to update profile.";
    return;
  }

  formData.currentPassword = "";
  formData.newPassword = "";
  saveMessage.value = "Profile updated successfully.";
}

onMounted(fetchOrders);

useHead({
  title: "My Account — Nuvé",
  meta: [{ name: "description", content: "Profile and order history" }],
});
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container max-w-5xl">
      <h1 class="nv-heading text-3xl mb-6">My Account</h1>

      <div class="grid lg:grid-cols-2 gap-6">
        <section
          class="bg-nv-surface border border-nv-border rounded-[12px] p-6"
        >
          <h2 class="font-semibold text-nv-text mb-4">Profile Details</h2>

          <div
            v-if="saveError"
            class="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md"
          >
            {{ saveError }}
          </div>
          <div
            v-if="saveMessage"
            class="mb-4 p-3 bg-nv-green/10 border border-nv-green/40 text-nv-green text-sm rounded-md"
          >
            {{ saveMessage }}
          </div>

          <form @submit.prevent="handleSaveProfile" class="space-y-4">
            <div>
              <label class="block text-sm text-nv-muted mb-1">Full Name</label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text focus:outline-none focus:border-nv-green/50"
              />
            </div>
            <div>
              <label class="block text-sm text-nv-muted mb-1">Email</label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text focus:outline-none focus:border-nv-green/50"
              />
            </div>
            <div>
              <label class="block text-sm text-nv-muted mb-1"
                >Current Password</label
              >
              <input
                v-model="formData.currentPassword"
                type="password"
                placeholder="Only needed to change password"
                class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text focus:outline-none focus:border-nv-green/50"
              />
            </div>
            <div>
              <label class="block text-sm text-nv-muted mb-1"
                >New Password</label
              >
              <input
                v-model="formData.newPassword"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text focus:outline-none focus:border-nv-green/50"
              />
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="inline-flex items-center justify-center px-5 py-2.5 rounded bg-nv-green text-nv-void font-medium hover:bg-nv-green/90 disabled:opacity-60"
            >
              {{ isLoading ? "Saving..." : "Save Profile" }}
            </button>
          </form>
        </section>

        <section
          class="bg-nv-surface border border-nv-border rounded-[12px] p-6"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-nv-text">Order History</h2>
            <button
              @click="fetchOrders"
              class="text-sm px-3 py-1.5 rounded border border-nv-border text-nv-muted hover:text-nv-green hover:border-nv-green/50 transition-colors"
            >
              Refresh
            </button>
          </div>

          <p v-if="ordersLoading" class="text-nv-muted">Loading orders...</p>
          <div
            v-if="ordersError"
            class="mb-3 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md"
          >
            {{ ordersError }}
          </div>

          <div
            v-if="orders.length"
            class="space-y-3 max-h-[420px] overflow-auto pr-1"
          >
            <div
              v-for="order in orders"
              :key="order.id"
              class="border border-nv-border rounded-md p-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-medium text-nv-text">
                    Order {{ order.id.slice(-8) }}
                  </p>
                  <p class="text-xs text-nv-dim">
                    {{ order.restaurant?.name || "Restaurant" }}
                  </p>
                  <p class="text-xs text-nv-muted mt-1">{{ order.status }}</p>
                </div>
                <p class="font-semibold text-nv-green">
                  ${{ Number(order.total || 0).toFixed(2) }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="!ordersLoading" class="text-nv-muted text-sm">
            No orders yet.
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
