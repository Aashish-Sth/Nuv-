<script setup lang="ts">
useHead({ title: 'Menu — Nuvé', meta: [{ name: 'description', content: 'Browse our curated selection of dishes from premium cloud kitchens.' }] })

const search = ref('')
const activeCategory = ref('All')
const categories = ['All', 'Italian', 'Asian', 'American', 'Healthy', 'Desserts']

const allDishes = [
  { id: 'r1', name: 'Truffle Mushroom Risotto', restaurant: 'Osteria Verde', image: '/images/food-pasta.png', price: 24.5, rating: 4.9, cuisine: 'Italian', deliveryTime: '30-40 min' },
  { id: 'r2', name: 'Salmon Poké Bowl', restaurant: 'Pacific Bowl Co.', image: '/images/food-pokebowl.png', price: 18.9, rating: 4.7, cuisine: 'Asian', deliveryTime: '20-30 min' },
  { id: 'r3', name: 'Wagyu Smash Burger', restaurant: 'The Grill Room', image: '/images/food-burger.png', price: 21.0, rating: 4.8, cuisine: 'American', deliveryTime: '25-35 min' },
  { id: 'r4', name: 'Spicy Tuna Tartare', restaurant: 'Sakura Kitchen', image: '/images/food-pokebowl.png', price: 19.5, rating: 4.6, cuisine: 'Asian', deliveryTime: '20-30 min' },
  { id: 'r5', name: 'Carbonara Classica', restaurant: 'Osteria Verde', image: '/images/food-pasta.png', price: 22.0, rating: 4.8, cuisine: 'Italian', deliveryTime: '30-40 min' },
  { id: 'r6', name: 'BBQ Bacon Stack', restaurant: 'The Grill Room', image: '/images/food-burger.png', price: 19.9, rating: 4.5, cuisine: 'American', deliveryTime: '25-35 min' },
  { id: 'r7', name: 'Green Goddess Bowl', restaurant: 'Verdant Kitchen', image: '/images/food-pokebowl.png', price: 16.5, rating: 4.7, cuisine: 'Healthy', deliveryTime: '20-25 min' },
  { id: 'r8', name: 'Margherita Napoletana', restaurant: 'Osteria Verde', image: '/images/food-pasta.png', price: 17.0, rating: 4.6, cuisine: 'Italian', deliveryTime: '25-35 min' },
  { id: 'r9', name: 'Teriyaki Salmon Bowl', restaurant: 'Pacific Bowl Co.', image: '/images/food-pokebowl.png', price: 20.5, rating: 4.8, cuisine: 'Asian', deliveryTime: '20-30 min' },
]

const filteredDishes = computed(() => {
  let result = allDishes
  if (activeCategory.value !== 'All') result = result.filter((d) => d.cuisine === activeCategory.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((d) => d.name.toLowerCase().includes(q) || d.restaurant.toLowerCase().includes(q))
  }
  return result
})
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container">
      <!-- Page header -->
      <div class="mb-10">
        <h1 class="nv-heading text-4xl sm:text-5xl mb-4">Our <em class="text-nv-green italic">Menu</em></h1>
        <p class="text-nv-muted text-base max-w-lg">Handpicked dishes from our curated partner kitchens. Every item crafted with care.</p>
      </div>

      <!-- Search + Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-10">
        <div class="relative flex-1 max-w-md">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-nv-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Search dishes or restaurants…"
            class="w-full bg-nv-surface border border-nv-border rounded-[10px] pl-10 pr-4 py-3 text-sm text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors duration-300"
          />
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat"
            class="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-[0.97]"
            :class="activeCategory === cat ? 'bg-nv-green text-nv-void' : 'bg-nv-surface border border-nv-border text-nv-muted hover:border-nv-green/40 hover:text-nv-text'"
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Results count -->
      <p class="text-sm text-nv-dim mb-6">{{ filteredDishes.length }} dishes found</p>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiFoodCard v-for="dish in filteredDishes" :key="dish.id" v-bind="dish" />
      </div>

      <!-- Empty state -->
      <div v-if="filteredDishes.length === 0" class="text-center py-20">
        <p class="text-nv-muted text-lg mb-2">No dishes found</p>
        <p class="text-nv-dim text-sm">Try adjusting your search or filters.</p>
      </div>
    </div>
  </div>
</template>
