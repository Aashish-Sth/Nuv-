<script setup lang="ts">
definePageMeta({ middleware: "userOnly" });
useHead({ title: "Checkout — Nuvé" });

const { cartItems, subtotal, deliveryFee, total, clearCart } = useCart();
const { accessToken } = useAuth();
const router = useRouter();
const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl || "";
const deliveryAddress = ref("123 Main Street, City, Country");
const notes = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

async function placeOrder() {
  errorMessage.value = "";

  if (!accessToken.value) {
    return router.push(
      `/auth/login?redirect=${encodeURIComponent("/checkout")}`,
    );
  }

  if (!deliveryAddress.value || deliveryAddress.value.trim().length < 10) {
    errorMessage.value =
      "Please provide a valid delivery address (min 10 characters).";
    return;
  }

  const orderItems = cartItems.value
    .filter((item: any) => item.menuItemId && item.restaurantId)
    .map((item: any) => ({
      menuItemId: String(item.menuItemId),
      qty: Number(item.quantity || 1),
      restaurantId: String(item.restaurantId),
    }));

  if (!orderItems.length) {
    errorMessage.value =
      "Your cart has items that cannot be ordered yet. Please add items again from the live menu.";
    return;
  }

  const restaurantId = orderItems[0].restaurantId;
  const mixedRestaurant = orderItems.some(
    (item) => item.restaurantId !== restaurantId,
  );
  if (mixedRestaurant) {
    errorMessage.value = "Please checkout items from one restaurant at a time.";
    return;
  }

  const payload = {
    restaurantId,
    items: orderItems.map(({ menuItemId, qty }) => ({ menuItemId, qty })),
    deliveryAddress: deliveryAddress.value.trim(),
    notes: notes.value.trim() || undefined,
  };

  try {
    isSubmitting.value = true;
    const url = backendUrl ? `${backendUrl}/api/orders` : "/api/orders";
    const res = await $fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: payload,
    });

    if ((res as any)?.success) {
      clearCart();
      await router.push("/orders");
      return;
    }

    errorMessage.value = (res as any)?.error || "Failed to place order.";
  } catch (error: any) {
    errorMessage.value =
      error?.data?.error || error?.message || "Failed to place order.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container">
      <h1 class="nv-heading text-4xl mb-8">Checkout</h1>
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md"
      >
        {{ errorMessage }}
      </div>
      <div v-if="cartItems.length" class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="flex gap-4 bg-nv-surface border border-nv-border rounded-[12px] p-4"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-20 h-20 rounded-[8px] object-cover shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-nv-text text-sm truncate">
                {{ item.name }}
              </h3>
              <p class="text-xs text-nv-muted mt-0.5">{{ item.restaurant }}</p>
              <p class="text-nv-green font-semibold text-sm mt-2">
                ${{ item.price.toFixed(2) }}
              </p>
            </div>
            <div class="flex items-center gap-3">x{{ item.quantity }}</div>
          </div>
        </div>

        <div
          class="bg-nv-surface border border-nv-border rounded-[12px] p-6 h-fit lg:sticky lg:top-24"
        >
          <h3 class="font-semibold text-nv-text mb-6">Order Summary</h3>
          <div class="space-y-3 mb-6">
            <div>
              <label class="block text-sm text-nv-muted mb-1"
                >Delivery Address</label
              >
              <textarea
                v-model="deliveryAddress"
                rows="3"
                class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors"
                placeholder="Enter your full delivery address"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm text-nv-muted mb-1"
                >Notes (optional)</label
              >
              <input
                v-model="notes"
                type="text"
                class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors"
                placeholder="Any delivery notes"
              />
            </div>
          </div>
          <div class="space-y-3 text-sm mb-6">
            <div class="flex justify-between">
              <span class="text-nv-muted">Subtotal</span
              ><span class="text-nv-text">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-nv-muted">Delivery</span
              ><span class="text-nv-text">${{ deliveryFee.toFixed(2) }}</span>
            </div>
            <div
              class="border-t border-nv-border pt-3 flex justify-between font-semibold"
            >
              <span class="text-nv-text">Total</span
              ><span class="text-nv-green">${{ total.toFixed(2) }}</span>
            </div>
          </div>
          <button
            @click="placeOrder"
            :disabled="isSubmitting"
            class="w-full bg-nv-green hover:bg-nv-green-dk disabled:opacity-60 disabled:cursor-not-allowed text-nv-void font-semibold text-sm py-3.5 rounded-[10px] transition-all duration-300 active:scale-[0.97]"
          >
            {{ isSubmitting ? "Placing..." : "Place Order" }}
          </button>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <h2 class="nv-heading text-2xl mb-2">Your cart is empty</h2>
        <NuxtLink
          to="/menu"
          class="inline-flex items-center gap-2 bg-nv-green hover:bg-nv-green-dk text-nv-void font-semibold text-sm px-7 py-3.5 rounded-[10px] transition-all duration-300"
          >Explore Menu</NuxtLink
        >
      </div>
    </div>
  </div>
</template>
