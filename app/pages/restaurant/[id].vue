<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const restaurants: Record<string, any> = {
  r1: {
    name: "Osteria Verde",
    cuisine: "Italian",
    rating: 4.9,
    deliveryTime: "30-40 min",
    description:
      "Authentic Italian flavours crafted with locally sourced ingredients. Every dish tells a story of tradition meeting modern technique.",
    image: "/images/food-pasta.png",
    menu: [
      {
        id: "m1",
        name: "Truffle Mushroom Risotto",
        price: 24.5,
        image: "/images/food-pasta.png",
      },
      {
        id: "m2",
        name: "Carbonara Classica",
        price: 22.0,
        image: "/images/food-pasta.png",
      },
      {
        id: "m3",
        name: "Margherita Napoletana",
        price: 17.0,
        image: "/images/food-pasta.png",
      },
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
      {
        id: "m4",
        name: "Salmon Poké Bowl",
        price: 18.9,
        image: "/images/food-pokebowl.png",
      },
      {
        id: "m5",
        name: "Spicy Tuna Tartare",
        price: 19.5,
        image: "/images/food-pokebowl.png",
      },
      {
        id: "m6",
        name: "Teriyaki Salmon Bowl",
        price: 20.5,
        image: "/images/food-pokebowl.png",
      },
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
      {
        id: "m7",
        name: "Wagyu Smash Burger",
        price: 21.0,
        image: "/images/food-burger.png",
      },
      {
        id: "m8",
        name: "BBQ Bacon Stack",
        price: 19.9,
        image: "/images/food-burger.png",
      },
    ],
  },
};

const restaurant = computed(() => restaurants[id] || restaurants["r1"]);

const api = useApi();
const { addItem } = useCart();
const menuItems = ref(restaurant.value.menu || []);

onMounted(async () => {
  const remote = await api.fetchMenu(id);
  if (remote && remote.length > 0) {
    // map server items to local shape
    menuItems.value = remote.map((it: any) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      image: it.image ?? "/images/food-pasta.png",
    }));
  }
});

useHead({ title: `${restaurant.value.name} — Nuvé` });
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container">
      <!-- Back -->
      <NuxtLink
        to="/menu"
        class="inline-flex items-center gap-1.5 text-sm text-nv-muted hover:text-nv-green transition-colors duration-300 mb-8"
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
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
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
            <span class="text-xs text-nv-dim">{{
              restaurant.deliveryTime
            }}</span>
          </div>
          <h1 class="nv-heading text-3xl sm:text-4xl mb-4">
            {{ restaurant.name }}
          </h1>
          <p class="text-nv-muted leading-relaxed mb-6">
            {{ restaurant.description }}
          </p>
          <div class="flex items-center gap-1.5">
            <svg
              class="w-5 h-5 text-nv-green"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            <span class="font-semibold text-nv-text">{{
              restaurant.rating
            }}</span>
            <span class="text-sm text-nv-muted ml-1">· Excellent</span>
          </div>
        </div>
      </div>

      <!-- Menu -->
      <div>
        <h2 class="nv-heading text-2xl mb-8">Menu</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in menuItems"
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
                <h3 class="font-semibold text-nv-text text-sm">
                  {{ item.name }}
                </h3>
                <p class="text-nv-green font-semibold text-sm mt-1">
                  ${{ item.price.toFixed(2) }}
                </p>
              </div>
              <button
                class="w-9 h-9 flex items-center justify-center rounded-full border border-nv-border text-nv-muted hover:border-nv-green hover:text-nv-green hover:bg-nv-green/10 transition-all duration-300 active:scale-[0.97]"
                @click.stop.prevent="
                  addItem({
                    id: item.id,
                    menuItemId: String(item.id),
                    restaurantId: id,
                    name: item.name,
                    restaurant: restaurant.name,
                    price: item.price,
                    quantity: 1,
                    image: item.image,
                  })
                "
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
