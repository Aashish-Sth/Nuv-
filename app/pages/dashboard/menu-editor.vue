<script setup lang="ts">
definePageMeta({ middleware: "admin" });

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
  image?: string | null;
}

const { accessToken } = useAuth();
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const saveLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const restaurants = ref<Restaurant[]>([]);
const selectedRestaurantId = ref("");
const menuItems = ref<MenuItem[]>([]);

const targetRestaurantId = computed(() =>
  String(route.query.restaurantId || ""),
);
const targetItemId = computed(() => String(route.query.itemId || ""));

const editingId = ref<string | null>(null);
const editForm = reactive({
  name: "",
  price: 0,
  description: "",
  category: "",
  image: "",
  isAvailable: true,
});

const baseUrl = computed(() => {
  try {
    const config = useRuntimeConfig();
    return config.public.backendUrl || "";
  } catch {
    return "";
  }
});

function clearMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

async function makeAuthRequest(endpoint: string, method: string, body?: any) {
  const url = baseUrl.value
    ? `${baseUrl.value}/api${endpoint}`
    : `/api${endpoint}`;

  return await $fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body,
  });
}

async function loadRestaurants() {
  clearMessages();
  isLoading.value = true;
  try {
    const res = await makeAuthRequest("/restaurants", "GET");
    if ((res as any).success) {
      restaurants.value = (res as any).data.items || [];
    }
  } catch (error: any) {
    errorMessage.value =
      error?.data?.error || error?.message || "Failed to load restaurants.";
  } finally {
    isLoading.value = false;
  }
}

async function loadMenuItems() {
  if (!selectedRestaurantId.value) return;
  clearMessages();
  isLoading.value = true;
  try {
    const res = await makeAuthRequest(
      `/restaurants/${selectedRestaurantId.value}/menu`,
      "GET",
    );
    if ((res as any).success) {
      const grouped = (res as any).data || {};
      menuItems.value = Object.values(grouped).flat() as MenuItem[];

      if (targetItemId.value) {
        const found = menuItems.value.find(
          (item) => item.id === targetItemId.value,
        );
        if (found) {
          startEdit(found);
        }
      }
    }
  } catch (error: any) {
    errorMessage.value =
      error?.data?.error || error?.message || "Failed to load menu items.";
  } finally {
    isLoading.value = false;
  }
}

function startEdit(item: MenuItem) {
  clearMessages();
  editingId.value = item.id;
  editForm.name = item.name;
  editForm.price = Number(item.price || 0);
  editForm.description = item.description || "";
  editForm.category = item.category || "";
  editForm.image = item.image || "";
  editForm.isAvailable = true;
}

function cancelEdit() {
  editingId.value = null;
}

async function saveEdit(itemId: string) {
  if (!selectedRestaurantId.value) return;
  clearMessages();
  saveLoading.value = true;
  try {
    const payload = {
      name: editForm.name,
      price: Number(editForm.price),
      description: editForm.description,
      category: editForm.category,
      image: editForm.image || null,
      isAvailable: editForm.isAvailable,
    };

    const res = await makeAuthRequest(
      `/restaurants/${selectedRestaurantId.value}/menu/${itemId}`,
      "PATCH",
      payload,
    );

    if ((res as any).success) {
      const updated = (res as any).data;
      menuItems.value = menuItems.value.map((item) =>
        item.id === itemId ? ({ ...item, ...updated } as MenuItem) : item,
      );
      successMessage.value = "Menu item updated successfully.";
      editingId.value = null;
    }
  } catch (error: any) {
    errorMessage.value =
      error?.data?.error || error?.message || "Failed to update menu item.";
  } finally {
    saveLoading.value = false;
  }
}

watch(selectedRestaurantId, async () => {
  menuItems.value = [];
  editingId.value = null;
  if (selectedRestaurantId.value) {
    await loadMenuItems();
  }
});

onMounted(async () => {
  await loadRestaurants();
  if (targetRestaurantId.value) {
    selectedRestaurantId.value = targetRestaurantId.value;
  }
});

watch(
  () => route.query,
  () => {
    if (
      targetRestaurantId.value &&
      selectedRestaurantId.value !== targetRestaurantId.value
    ) {
      selectedRestaurantId.value = targetRestaurantId.value;
      return;
    }

    if (targetItemId.value) {
      const found = menuItems.value.find(
        (item) => item.id === targetItemId.value,
      );
      if (found) {
        startEdit(found);
      }
    }
  },
);

useHead({
  title: "Edit Menu Items — Admin",
  meta: [
    { name: "description", content: "Edit existing restaurant menu items" },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-nv-void pt-24 pb-16">
    <div class="nv-container">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 class="nv-heading text-3xl">Edit Existing Menu Items</h1>
        <div class="flex items-center gap-2">
          <button
            v-if="targetItemId"
            @click="router.replace('/dashboard/menu-editor')"
            class="text-sm px-3 py-1.5 rounded border border-nv-border text-nv-muted hover:text-nv-green hover:border-nv-green/50 transition-colors"
          >
            Clear Target
          </button>
          <NuxtLink
            to="/dashboard"
            class="text-sm px-3 py-1.5 rounded border border-nv-border text-nv-muted hover:text-nv-green hover:border-nv-green/50 transition-colors"
          >
            Back to Dashboard
          </NuxtLink>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md"
      >
        {{ errorMessage }}
      </div>
      <div
        v-if="successMessage"
        class="mb-4 p-3 bg-nv-green/10 border border-nv-green/30 text-nv-green text-sm rounded-md"
      >
        {{ successMessage }}
      </div>

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
      </div>

      <div v-if="isLoading" class="text-nv-muted">Loading...</div>

      <div v-else-if="selectedRestaurantId" class="space-y-4">
        <div
          v-for="item in menuItems"
          :key="item.id"
          class="bg-nv-surface border border-nv-border rounded-md p-4"
        >
          <div
            v-if="editingId !== item.id"
            class="flex items-start justify-between gap-4"
          >
            <div class="flex-1">
              <h3 class="font-semibold text-nv-text">{{ item.name }}</h3>
              <p class="text-sm text-nv-muted">{{ item.category }}</p>
              <p class="text-sm text-nv-dim mt-1">{{ item.description }}</p>
              <p class="text-sm text-nv-green mt-2">
                ${{ Number(item.price).toFixed(2) }}
              </p>
            </div>
            <button
              @click="startEdit(item)"
              class="text-sm px-3 py-1.5 rounded border border-nv-border text-nv-muted hover:text-nv-green hover:border-nv-green/50 transition-colors"
            >
              Edit
            </button>
          </div>

          <div v-else class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                v-model="editForm.name"
                placeholder="Item name"
                class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text"
              />
              <input
                v-model.number="editForm.price"
                type="number"
                step="0.1"
                placeholder="Price"
                class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text"
              />
              <input
                v-model="editForm.category"
                placeholder="Category"
                class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text"
              />
              <input
                v-model="editForm.image"
                placeholder="Image URL or data URI"
                class="bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text"
              />
              <textarea
                v-model="editForm.description"
                placeholder="Description"
                class="md:col-span-2 bg-nv-void border border-nv-border rounded px-3 py-2 text-nv-text h-20 resize-none"
              ></textarea>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="saveEdit(item.id)"
                :disabled="saveLoading"
                class="text-sm px-3 py-1.5 rounded bg-nv-green text-nv-void hover:bg-nv-green/90 disabled:opacity-60"
              >
                {{ saveLoading ? "Saving..." : "Save" }}
              </button>
              <button
                @click="cancelEdit"
                class="text-sm px-3 py-1.5 rounded border border-nv-border text-nv-muted hover:text-nv-text"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="menuItems.length === 0"
          class="text-center py-8 text-nv-muted"
        >
          No menu items found for this restaurant.
        </div>
      </div>
    </div>
  </div>
</template>
