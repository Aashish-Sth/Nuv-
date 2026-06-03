<script setup lang="ts">
interface Props {
  id: string | number;
  restaurantId?: string;
  name: string;
  restaurant: string;
  image: string;
  price: number;
  rating: number;
  cuisine: string;
  deliveryTime?: string;
}

const props = withDefaults(defineProps<Props>(), {
  deliveryTime: "25-35 min",
});

const { addItem } = useCart();
const justAdded = ref(false);

const formattedPrice = computed(() => `$${props.price.toFixed(2)}`);

function handleAdd(e: Event) {
  e.stopPropagation();
  e.preventDefault();
  addItem({
    id: props.id,
    menuItemId: String(props.id),
    restaurantId: props.restaurantId,
    name: props.name,
    restaurant: props.restaurant,
    price: props.price,
    quantity: 1,
    image: props.image,
  });
  justAdded.value = true;
  setTimeout(() => {
    justAdded.value = false;
  }, 1500);
}
</script>

<template>
  <NuxtLink
    :to="`/restaurant/${restaurantId ?? id}`"
    class="group block bg-nv-surface border border-nv-border rounded-[12px] overflow-hidden transition-all duration-300 hover:border-nv-green/40 hover:-translate-y-1"
  >
    <!-- Image -->
    <div class="relative aspect-[4/3] overflow-hidden">
      <img
        :src="image"
        :alt="name"
        class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-nv-void/60 via-transparent to-transparent"
      />

      <!-- Rating badge -->
      <div
        class="absolute top-3 right-3 flex items-center gap-1 bg-nv-void/70 backdrop-blur-sm px-2 py-1 rounded-full"
      >
        <svg
          class="w-3.5 h-3.5 text-nv-green"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
        <span class="text-xs font-medium text-nv-text">{{
          rating.toFixed(1)
        }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <div class="flex items-center gap-2 mb-2">
        <UiTagBadge :label="cuisine" variant="filled" size="sm" />
        <span class="text-xs text-nv-dim">{{ deliveryTime }}</span>
      </div>
      <h3
        class="font-body font-semibold text-nv-text text-base mb-1 group-hover:text-nv-green transition-colors duration-300"
      >
        {{ name }}
      </h3>
      <p class="text-sm text-nv-muted mb-3">{{ restaurant }}</p>
      <div class="flex items-center justify-between">
        <span class="text-nv-green font-semibold">{{ formattedPrice }}</span>
        <button
          class="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.92]"
          :class="justAdded ? 'text-nv-green' : 'text-nv-muted hover:text-nv-green'"
          @click.stop.prevent="handleAdd"
        >
          <Transition name="icon-swap" mode="out-in">
            <svg v-if="!justAdded" key="plus" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <svg v-else key="check" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </Transition>
          {{ justAdded ? 'Added!' : 'Add' }}
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
