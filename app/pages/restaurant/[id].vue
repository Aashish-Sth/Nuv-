<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;
const { addItem } = useCart();

const addedItems = ref<Record<string, boolean>>({});

const restaurantMap: Record<string, any> = {
  r1: {
    name: "Osteria Verde",
    cuisine: "Italian",
    rating: 4.9,
    deliveryTime: "30-40 min",
    description:
      "Authentic Italian flavours crafted with locally sourced ingredients. Every dish tells a story of tradition meeting modern technique.",
    image: "/images/food-pasta.png",
    menu: [
      { id: "d1", name: "Truffle Mushroom Risotto", price: 24.50, image: "/images/food-pasta.png" },
      { id: "d5", name: "Carbonara Classica",       price: 22.00, image: "/images/food-pasta.png" },
      { id: "d8", name: "Margherita Napoletana",    price: 17.00, image: "/images/food-pasta.png" },
    ],
  },
  r2: {
    name: "Pacific Bowl Co.",
    cuisine: "Asian",
    rating: 4.7,
    deliveryTime: "20-30 min",
    description:
      "Fresh, vibrant bowls inspired by Pacific Rim flavours. Sustainably sourced seafood meets bold, clean ingredients.",
    image: "/images/food-pokebowl.png",
    menu: [
      { id: "d2", name: "Salmon Poké Bowl",    price: 18.90, image: "/images/food-pokebowl.png" },
      { id: "d9", name: "Teriyaki Salmon Bowl", price: 20.50, image: "/images/food-pokebowl.png" },
    ],
  },
  r3: {
    name: "The Grill Room",
    cuisine: "American",
    rating: 4.8,
    deliveryTime: "25-35 min",
    description:
      "Premium burgers and grilled classics. Dry-aged beef, house-made sauces, and brioche baked fresh daily.",
    image: "/images/food-burger.png",
    menu: [
      { id: "d3",  name: "Wagyu Smash Burger",      price: 21.00, image: "/images/food-burger.png" },
      { id: "d6",  name: "BBQ Bacon Stack",         price: 19.90, image: "/images/food-burger.png" },
      { id: "d16", name: "Crispy Chicken Sandwich", price: 17.50, image: "/images/food-burger.png" },
    ],
  },
  r4: {
    name: "Sakura Kitchen",
    cuisine: "Asian",
    rating: 4.7,
    deliveryTime: "20-30 min",
    description:
      "Refined Japanese-inspired cuisine with seasonal produce and premium cuts. Where centuries of tradition become tomorrow's flavour.",
    image: "/images/food-pokebowl.png",
    menu: [
      { id: "d4",  name: "Spicy Tuna Tartare", price: 19.50, image: "/images/food-pokebowl.png" },
      { id: "d15", name: "Miso Black Cod",     price: 26.00, image: "/images/food-pokebowl.png" },
    ],
  },
  r5: {
    name: "Verdant Kitchen",
    cuisine: "Healthy",
    rating: 4.6,
    deliveryTime: "20-25 min",
    description:
      "Nourishing, plant-forward bowls and salads built around seasonal, locally sourced vegetables and superfoods.",
    image: "/images/food-pokebowl.png",
    menu: [
      { id: "d7",  name: "Green Goddess Bowl",   price: 16.50, image: "/images/food-pokebowl.png" },
      { id: "d10", name: "Açaí Power Bowl",      price: 15.50, image: "/images/food-pokebowl.png" },
      { id: "d11", name: "Quinoa Buddha Bowl",   price: 14.90, image: "/images/food-pokebowl.png" },
      { id: "d17", name: "Avocado & Kale Salad", price: 13.90, image: "/images/food-pokebowl.png" },
    ],
  },
  r6: {
    name: "Sweet Lab",
    cuisine: "Desserts",
    rating: 4.9,
    deliveryTime: "25-35 min",
    description:
      "Artisan pastry and desserts crafted by Michelin-trained chefs. Every creation balances comfort with culinary precision.",
    image: "/images/food-pasta.png",
    menu: [
      { id: "d12", name: "Chocolate Lava Cake",      price: 11.50, image: "/images/food-pasta.png" },
      { id: "d13", name: "Matcha Tiramisu",          price: 10.90, image: "/images/food-pokebowl.png" },
      { id: "d14", name: "Vanilla Bean Panna Cotta", price: 9.90,  image: "/images/food-pasta.png" },
      { id: "d18", name: "Crème Brûlée",             price: 10.50, image: "/images/food-pasta.png" },
    ],
  },
};

const restaurant = computed(() => restaurantMap[id]);

if (!restaurant.value) {
  await navigateTo("/menu");
}

useHead({ title: `${restaurant.value?.name ?? "Restaurant"} — Nuvé` });

function addToCart(item: { id: string; name: string; price: number; image: string }) {
  addItem({
    id: item.id,
    menuItemId: item.id,
    restaurantId: id,
    name: item.name,
    restaurant: restaurant.value.name,
    price: item.price,
    quantity: 1,
    image: item.image,
  });
  addedItems.value[item.id] = true;
  setTimeout(() => {
    delete addedItems.value[item.id];
  }, 1500);
}
</script>

<template>
  <div v-if="restaurant" class="pt-24 pb-16">
    <div class="nv-container">
      <!-- Back -->
      <NuxtLink
        to="/menu"
        class="inline-flex items-center gap-1.5 text-sm text-nv-muted hover:text-nv-green transition-colors duration-300 mb-8"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to menu
      </NuxtLink>

      <!-- Restaurant Header -->
      <div class="grid md:grid-cols-2 gap-8 mb-14">
        <div class="rounded-[16px] overflow-hidden border border-nv-border">
          <img
            :src="restaurant.image"
            :alt="restaurant.name"
            class="w-full aspect-[16/10] object-cover"
          />
        </div>
        <div class="flex flex-col justify-center">
          <div class="flex items-center gap-3 mb-3">
            <UiTagBadge :label="restaurant.cuisine" />
            <span class="text-xs text-nv-dim">{{ restaurant.deliveryTime }}</span>
          </div>
          <h1 class="nv-heading text-3xl sm:text-4xl mb-4">{{ restaurant.name }}</h1>
          <p class="text-nv-muted leading-relaxed mb-6">{{ restaurant.description }}</p>
          <div class="flex items-center gap-1.5">
            <svg class="w-5 h-5 text-nv-green" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="font-semibold text-nv-text">{{ restaurant.rating }}</span>
            <span class="text-sm text-nv-muted ml-1">· Excellent</span>
          </div>
        </div>
      </div>

      <!-- Menu -->
      <div>
        <h2 class="nv-heading text-2xl mb-8">Menu</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in restaurant.menu"
            :key="item.id"
            class="bg-nv-surface border border-nv-border rounded-[12px] overflow-hidden group hover:border-nv-green/30 transition-colors duration-300"
          >
            <div class="aspect-[4/3] overflow-hidden">
              <img
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>
            <div class="p-4 flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-nv-text text-sm">{{ item.name }}</h3>
                <p class="text-nv-green font-semibold text-sm mt-1">${{ item.price.toFixed(2) }}</p>
              </div>
              <button
                class="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 active:scale-[0.95]"
                :class="addedItems[item.id]
                  ? 'border-nv-green bg-nv-green/15 text-nv-green'
                  : 'border-nv-border text-nv-muted hover:border-nv-green hover:text-nv-green hover:bg-nv-green/10'"
                :aria-label="`Add ${item.name} to cart`"
                @click="addToCart(item)"
              >
                <Transition name="icon-swap" mode="out-in">
                  <svg v-if="!addedItems[item.id]" key="plus" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <svg v-else key="check" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </Transition>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.icon-swap-enter-from,
.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
</style>
