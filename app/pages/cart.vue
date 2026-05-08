<script setup lang="ts">
useHead({ title: "Cart — Nuvé" });

const { cartItems, subtotal, deliveryFee, total, updateQty, removeItem } =
  useCart();

const { isAuthenticated } = useAuth();
const router = useRouter();

function handleCheckout() {
  if (!isAuthenticated.value) {
    // redirect to login with return URL
    return router.push(
      `/auth/login?redirect=${encodeURIComponent("/checkout")}`,
    );
  }
  router.push("/checkout");
}
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container">
      <h1 class="nv-heading text-4xl mb-8">
        Your <em class="text-nv-green italic">Cart</em>
      </h1>

      <div v-if="cartItems.length" class="grid lg:grid-cols-3 gap-8">
        <!-- Items -->
        <div class="lg:col-span-2 space-y-4">
          <TransitionGroup name="cart-item">
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
                <p class="text-xs text-nv-muted mt-0.5">
                  {{ item.restaurant }}
                </p>
                <p class="text-nv-green font-semibold text-sm mt-2">
                  ${{ item.price.toFixed(2) }}
                </p>
              </div>
              <div class="flex flex-col items-end justify-between shrink-0">
                <button
                  class="text-nv-dim hover:text-red-400 transition-colors duration-300"
                  aria-label="Remove"
                  @click="removeItem(item.id)"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div class="flex items-center gap-3">
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-full border border-nv-border text-nv-muted hover:border-nv-green hover:text-nv-green transition-colors duration-300"
                    @click="updateQty(item.id, -1)"
                  >
                    −
                  </button>
                  <span
                    class="text-sm font-medium text-nv-text w-4 text-center"
                    >{{ item.quantity }}</span
                  >
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-full border border-nv-border text-nv-muted hover:border-nv-green hover:text-nv-green transition-colors duration-300"
                    @click="updateQty(item.id, 1)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Summary -->
        <div
          class="bg-nv-surface border border-nv-border rounded-[12px] p-6 h-fit lg:sticky lg:top-24"
        >
          <h3 class="font-semibold text-nv-text mb-6">Order Summary</h3>
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
            @click="handleCheckout"
            class="w-full bg-nv-green hover:bg-nv-green-dk text-nv-void font-semibold text-sm py-3.5 rounded-[10px] transition-all duration-300 active:scale-[0.97]"
          >
            Checkout
          </button>
          <NuxtLink
            to="/menu"
            class="block text-center text-sm text-nv-muted mt-4 hover:text-nv-green transition-colors duration-300"
          >
            ← Continue browsing
          </NuxtLink>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20">
        <div
          class="w-16 h-16 mx-auto mb-6 bg-nv-surface border border-nv-border rounded-full flex items-center justify-center"
        >
          <svg
            class="w-7 h-7 text-nv-dim"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <h2 class="nv-heading text-2xl mb-2">Your cart is empty</h2>
        <p class="text-nv-muted text-sm mb-6">
          Discover our curated menu and add something delicious.
        </p>
        <NuxtLink
          to="/menu"
          class="inline-flex items-center gap-2 bg-nv-green hover:bg-nv-green-dk text-nv-void font-semibold text-sm px-7 py-3.5 rounded-[10px] transition-all duration-300"
        >
          Explore Menu
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.cart-item-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
