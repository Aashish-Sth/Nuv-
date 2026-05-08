<script setup lang="ts">
const activeCategory = ref('All')

const categories = ['All', 'Italian', 'Asian', 'American', 'Healthy', 'Desserts']

const dishes = [
  {
    id: 'r1',
    name: 'Truffle Mushroom Risotto',
    restaurant: 'Osteria Verde',
    image: '/images/food-pasta.png',
    price: 24.50,
    rating: 4.9,
    cuisine: 'Italian',
    deliveryTime: '30-40 min',
  },
  {
    id: 'r2',
    name: 'Salmon Poké Bowl',
    restaurant: 'Pacific Bowl Co.',
    image: '/images/food-pokebowl.png',
    price: 18.90,
    rating: 4.7,
    cuisine: 'Asian',
    deliveryTime: '20-30 min',
  },
  {
    id: 'r3',
    name: 'Wagyu Smash Burger',
    restaurant: 'The Grill Room',
    image: '/images/food-burger.png',
    price: 21.00,
    rating: 4.8,
    cuisine: 'American',
    deliveryTime: '25-35 min',
  },
  {
    id: 'r4',
    name: 'Spicy Tuna Tartare',
    restaurant: 'Sakura Kitchen',
    image: '/images/food-pokebowl.png',
    price: 19.50,
    rating: 4.6,
    cuisine: 'Asian',
    deliveryTime: '20-30 min',
  },
  {
    id: 'r5',
    name: 'Carbonara Classica',
    restaurant: 'Osteria Verde',
    image: '/images/food-pasta.png',
    price: 22.00,
    rating: 4.8,
    cuisine: 'Italian',
    deliveryTime: '30-40 min',
  },
  {
    id: 'r6',
    name: 'BBQ Bacon Stack',
    restaurant: 'The Grill Room',
    image: '/images/food-burger.png',
    price: 19.90,
    rating: 4.5,
    cuisine: 'American',
    deliveryTime: '25-35 min',
  },
]

const filteredDishes = computed(() => {
  if (activeCategory.value === 'All') return dishes
  return dishes.filter((d) => d.cuisine === activeCategory.value)
})
</script>

<template>
  <section class="nv-section bg-nv-base">
    <div class="nv-container">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <span class="text-nv-green text-sm font-medium tracking-wider uppercase mb-2 block">Curated For You</span>
          <h2 class="nv-heading text-3xl sm:text-4xl">
            Today's <em class="text-nv-green italic">Picks</em>
          </h2>
        </div>
        <NuxtLink
          to="/menu"
          class="nv-link text-sm font-medium text-nv-muted self-start sm:self-auto"
        >
          View full menu →
        </NuxtLink>
      </div>

      <!-- Category filters -->
      <div class="flex flex-wrap gap-2 mb-10">
        <button
          v-for="cat in categories"
          :key="cat"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-[0.97]"
          :class="
            activeCategory === cat
              ? 'bg-nv-green text-nv-void'
              : 'bg-nv-surface border border-nv-border text-nv-muted hover:border-nv-green/40 hover:text-nv-text'
          "
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <TransitionGroup
          name="card"
          tag="div"
          class="contents"
        >
          <UiFoodCard
            v-for="dish in filteredDishes"
            :key="dish.id"
            v-bind="dish"
          />
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card-enter-active,
.card-leave-active {
  transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.card-enter-from {
  opacity: 0;
  transform: translateY(24px);
}
.card-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
