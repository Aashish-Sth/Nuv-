<script setup lang="ts">
const { accessToken } = useAuth();

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  description: string;
  image: string;
}

const restaurants = ref<Restaurant[]>([]);
const isLoading = ref(false);
const showAddForm = ref(false);
const formData = reactive({
  name: "",
  cuisine: "",
  cuisines: [] as string[],
  deliveryTime: 30,
  minOrder: 10,
  image: "",
  description: "",
});

const baseUrl = computed(() => {
  try {
    const config = useRuntimeConfig();
    return config.public.backendUrl || "";
  } catch {
    return "";
  }
});

async function makeAuthRequest(endpoint: string, method: string, body?: any) {
  const url = baseUrl.value
    ? `${baseUrl.value}/api${endpoint}`
    : `/api${endpoint}`;

  const opts: any = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body) {
    opts.body = JSON.stringify(body);
  }

  return await $fetch(url, opts);
}

async function loadRestaurants() {
  isLoading.value = true;
  try {
    const res = await makeAuthRequest("/restaurants", "GET");
    if ((res as any).success) {
      restaurants.value = (res as any).data.items || [];
    }
  } catch (e) {
    console.error("Failed to load restaurants:", e);
  } finally {
    isLoading.value = false;
  }
}

async function handleAddRestaurant() {
  isLoading.value = true;
  try {
    const res = await makeAuthRequest("/restaurants", "POST", {
      ...formData,
      cuisines: [formData.cuisine],
    });
    if ((res as any).success) {
      restaurants.value.push((res as any).data);
      showAddForm.value = false;
      formData.name = "";
      formData.cuisine = "";
      formData.description = "";
      formData.image = "";
    }
  } catch (e: any) {
    console.error("Failed to add restaurant:", e.message);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadRestaurants();
});
</script>

<template>
  <div>
    <!-- Add Button -->
    <button
      @click="showAddForm = !showAddForm"
      class="mb-6 px-4 py-2 bg-nv-green text-nv-void rounded-md font-medium hover:bg-nv-green/90 transition-colors"
    >
      {{ showAddForm ? "Cancel" : "+ Add Restaurant" }}
    </button>

    <!-- Add Form -->
    <div
      v-if="showAddForm"
      class="bg-nv-surface border border-nv-border rounded-md p-6 mb-8"
    >
      <h3 class="font-semibold text-nv-text mb-4">New Restaurant</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          v-model="formData.name"
          placeholder="Restaurant name"
          class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
        />
        <input
          v-model="formData.cuisine"
          placeholder="Cuisine type"
          class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
        />
        <input
          v-model.number="formData.deliveryTime"
          type="number"
          placeholder="Delivery time (min)"
          class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
        />
        <input
          v-model.number="formData.minOrder"
          type="number"
          placeholder="Min order"
          class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
        />
        <input
          v-model="formData.image"
          placeholder="Image URL"
          class="md:col-span-2 bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
        />
        <textarea
          v-model="formData.description"
          placeholder="Description"
          class="md:col-span-2 bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 h-24 resize-none"
        ></textarea>
      </div>
      <button
        @click="handleAddRestaurant"
        :disabled="isLoading"
        class="mt-4 px-4 py-2 bg-nv-green text-nv-void rounded font-medium hover:bg-nv-green/90 disabled:opacity-50 transition-colors"
      >
        {{ isLoading ? "Adding..." : "Add Restaurant" }}
      </button>
    </div>

    <!-- Restaurants List -->
    <div v-if="!isLoading" class="space-y-4">
      <div
        v-for="r in restaurants"
        :key="r.id"
        class="bg-nv-surface border border-nv-border rounded-md p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-nv-text">{{ r.name }}</h4>
            <p class="text-sm text-nv-muted">
              {{ r.cuisine }} · {{ r.deliveryTime }} min
            </p>
            <p class="text-sm text-nv-dim mt-1">{{ r.description }}</p>
          </div>
          <span class="text-sm text-nv-green font-medium"
            >⭐ {{ r.rating.toFixed(1) }}</span
          >
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="text-center py-8">
      <p class="text-nv-muted">Loading restaurants...</p>
    </div>
  </div>
</template>
