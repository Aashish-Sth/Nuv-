<script setup lang="ts">
const { accessToken } = useAuth();

interface Restaurant {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  restaurantId: string;
}

const restaurants = ref<Restaurant[]>([]);
const selectedRestaurantId = ref("");
const menuItems = ref<MenuItem[]>([]);
const isLoading = ref(false);
const showAddForm = ref(false);
const formData = reactive({
  name: "",
  price: 0,
  description: "",
  category: "",
  image: "",
});
const imagePreview = ref("");

const baseUrl = computed(() => {
  try {
    const config = useRuntimeConfig();
    return config.public.backendUrl || "";
  } catch {
    return "";
  }
});

const router = useRouter();

function goToEditor(item: MenuItem) {
  try {
    router.push({
      path: "/dashboard/menu-editor",
      query: { restaurantId: selectedRestaurantId.value, itemId: item.id },
    });
  } catch (e) {
    console.error("Navigation failed:", e);
  }
}

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

async function loadMenuItems() {
  if (!selectedRestaurantId.value) return;

  isLoading.value = true;
  try {
    const res = await makeAuthRequest(
      `/restaurants/${selectedRestaurantId.value}/menu`,
      "GET",
    );
    if ((res as any).success) {
      const grouped = (res as any).data;
      menuItems.value = Object.values(grouped).flat() as MenuItem[];
    }
  } catch (e) {
    console.error("Failed to load menu:", e);
  } finally {
    isLoading.value = false;
  }
}

async function handleAddMenuItem() {
  if (!selectedRestaurantId.value) return;

  isLoading.value = true;
  try {
    const res = await makeAuthRequest(
      `/restaurants/${selectedRestaurantId.value}/menu`,
      "POST",
      {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        category: formData.category,
        image: formData.image || null,
      },
    );
    if ((res as any).success) {
      menuItems.value.push((res as any).data);
      showAddForm.value = false;
      formData.name = "";
      formData.price = 0;
      formData.description = "";
      formData.category = "";
      formData.image = "";
      imagePreview.value = "";
    }
  } catch (e: any) {
    console.error("Failed to add menu item:", e.message);
  } finally {
    isLoading.value = false;
  }
}

async function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result || "");
    formData.image = result;
    imagePreview.value = result;
  };
  reader.readAsDataURL(file);
}

async function handleDeleteMenuItem(itemId: string) {
  if (!selectedRestaurantId.value) return;

  if (!confirm("Delete this item?")) return;

  try {
    const res = await makeAuthRequest(
      `/restaurants/${selectedRestaurantId.value}/menu/${itemId}`,
      "DELETE",
    );
    if ((res as any).success) {
      menuItems.value = menuItems.value.filter((i) => i.id !== itemId);
    }
  } catch (e: any) {
    console.error("Failed to delete item:", e.message);
  }
}

watch(selectedRestaurantId, () => {
  menuItems.value = [];
  showAddForm.value = false;
  if (selectedRestaurantId.value) {
    loadMenuItems();
  }
});

onMounted(() => {
  loadRestaurants();
});
</script>

<template>
  <div>
    <!-- Select Restaurant -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-nv-text mb-2"
        >Select Restaurant</label
      >
      <select
        v-model="selectedRestaurantId"
        class="w-full max-w-xs bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text focus:outline-none focus:border-nv-green/50"
      >
        <option value="">Choose a restaurant...</option>
        <option v-for="r in restaurants" :key="r.id" :value="r.id">
          {{ r.name }}
        </option>
      </select>

      <!-- Add Button -->
      <button
        v-if="selectedRestaurantId"
        @click="showAddForm = !showAddForm"
        class="mb-6 px-4 py-2 bg-nv-green text-nv-void rounded-md font-medium hover:bg-nv-green/90 transition-colors"
      >
        {{ showAddForm ? "Cancel" : "+ Add Menu Item" }}
      </button>

      <!-- Add Form -->
      <div
        v-if="showAddForm && selectedRestaurantId"
        class="bg-nv-surface border border-nv-border rounded-md p-6 mb-8"
      >
        <h3 class="font-semibold text-nv-text mb-4">New Menu Item</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            v-model="formData.name"
            placeholder="Item name"
            class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
          />
          <input
            v-model.number="formData.price"
            type="number"
            step="0.1"
            placeholder="Price"
            class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
          />
          <input
            v-model="formData.category"
            placeholder="Category (e.g. Bowls, Sushi)"
            class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
          />
          <input
            v-model="formData.image"
            placeholder="Image URL (optional)"
            class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50"
          />
          <input
            type="file"
            accept="image/*"
            @change="handleImageSelect"
            class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text file:mr-3 file:rounded file:border-0 file:bg-nv-green/20 file:px-3 file:py-1 file:text-nv-green"
          />
          <textarea
            v-model="formData.description"
            placeholder="Description"
            class="md:col-span-2 bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 h-20 resize-none"
          ></textarea>
          <div v-if="imagePreview || formData.image" class="md:col-span-2">
            <p class="text-xs text-nv-dim mb-2">Image Preview</p>
            <img
              :src="imagePreview || formData.image"
              alt="Preview"
              class="w-40 h-28 object-cover rounded border border-nv-border"
            />
          </div>
        </div>
        <button
          @click="handleAddMenuItem"
          :disabled="isLoading"
          class="mt-4 px-4 py-2 bg-nv-green text-nv-void rounded font-medium hover:bg-nv-green/90 disabled:opacity-50 transition-colors"
        >
          {{ isLoading ? "Adding..." : "Add Item" }}
        </button>
      </div>
    </div>

    <!-- Menu Items List -->
    <div v-if="selectedRestaurantId && !isLoading" class="space-y-4">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="bg-nv-surface border border-nv-border rounded-md p-4 flex items-start justify-between"
      >
        <div class="flex-1">
          <h4 class="font-semibold text-nv-text">{{ item.name }}</h4>
          <p class="text-sm text-nv-muted">{{ item.category }}</p>
          <p class="text-sm text-nv-dim mt-1">{{ item.description }}</p>
        </div>
        <div class="flex items-center gap-4 ml-4">
          <span class="font-semibold text-nv-green"
            >${{ item.price.toFixed(2) }}</span
          >
          <button
            @click="goToEditor(item)"
            class="inline-flex items-center justify-center w-8 h-8 text-nv-muted border border-nv-border rounded hover:text-nv-green hover:border-nv-green/50 transition-colors"
            title="Edit item"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 3.487a2.1 2.1 0 113.03 2.9L9.75 16.1l-4.5 1.2 1.2-4.5 10.412-9.313z"
              />
            </svg>
          </button>
          <button
            @click="handleDeleteMenuItem(item.id)"
            class="text-sm px-2 py-1 text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div v-if="menuItems.length === 0" class="text-center py-8 text-nv-muted">
        No menu items yet. Add one above.
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="selectedRestaurantId && isLoading" class="text-center py-8">
      <p class="text-nv-muted">Loading menu...</p>
    </div>
  </div>
</template>
