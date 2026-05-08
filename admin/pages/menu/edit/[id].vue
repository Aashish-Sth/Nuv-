<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRuntimeConfig, definePageMeta } from "#imports";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const BASE = config.public.backendUrl ?? "http://localhost:3001";

// Expecting route: /menu/edit/[id]?restaurantId=xxx
const itemId = route.params.id as string;
const restaurantId = route.query.restaurantId as string;

const loading = ref(true);
const saving = ref(false);
const toast = ref("");
const imagePreview = ref("");

const form = reactive({
  name: "",
  description: "",
  price: 0,
  category: "",
  isAvailable: true,
  image: "" as string | null,
});

// ── Fetch existing item ──────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await fetch(`${BASE}/api/restaurants/${restaurantId}/menu`, {
      credentials: "include",
    });
    const json = await res.json();
    if (!json.success) throw new Error("Failed to load menu");

    // Menu is grouped by category — flatten and find our item
    const allItems = Object.values(json.data).flat() as any[];
    const item = allItems.find((i: any) => i.id === itemId);
    if (!item) throw new Error("Item not found");

    form.name = item.name;
    form.description = item.description;
    form.price = item.price;
    form.category = item.category;
    form.isAvailable = item.isAvailable;
    form.image = item.image ?? "";
    imagePreview.value = item.image ?? "";
  } catch (e: any) {
    toast.value = e.message ?? "Error loading item";
  } finally {
    loading.value = false;
  }
});

// ── Image upload → base64 ────────────────────────────────────────────────────
function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    form.image = reader.result as string;
    imagePreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

// ── Save ─────────────────────────────────────────────────────────────────────
async function save() {
  saving.value = true;
  toast.value = "";
  try {
    const res = await fetch(
      `${BASE}/api/restaurants/${restaurantId}/menu/${itemId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          isAvailable: form.isAvailable,
          image: form.image || null,
        }),
      },
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Save failed");
    toast.value = "✅ Changes saved!";
    setTimeout(() => (toast.value = ""), 3000);
  } catch (e: any) {
    toast.value = `❌ ${e.message}`;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toast"
        class="fixed top-4 right-4 z-50 rounded-lg px-5 py-3 text-sm font-medium shadow-lg"
        :class="
          toast.startsWith('❌')
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        "
      >
        {{ toast }}
      </div>
    </transition>

    <div class="mx-auto max-w-2xl">
      <!-- Header -->
      <div class="mb-6 flex items-center gap-4">
        <button
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          @click="router.back()"
        >
          ← Cancel
        </button>
        <h1 class="text-2xl font-bold text-gray-800">Edit Menu Item</h1>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center text-gray-400 py-20">
        Loading...
      </div>

      <!-- Form -->
      <div v-else class="rounded-2xl bg-white p-8 shadow-sm space-y-6">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Name</label
          >
          <input
            v-model="form.name"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Description</label
          >
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Price ($)</label
          >
          <input
            v-model="form.price"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Category</label
          >
          <input
            v-model="form.category"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <!-- Availability -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="form.isAvailable ? 'bg-indigo-500' : 'bg-gray-300'"
            @click="form.isAvailable = !form.isAvailable"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              :class="form.isAvailable ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
          <span class="text-sm text-gray-700">
            {{ form.isAvailable ? "Available" : "Unavailable" }}
          </span>
        </div>

        <!-- Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Image</label
          >
          <input
            type="file"
            accept="image/*"
            class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            @change="onImageChange"
          />
          <img
            v-if="imagePreview"
            :src="imagePreview"
            class="mt-3 h-40 w-full rounded-lg object-cover border border-gray-200"
            alt="Preview"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            class="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            @click="router.back()"
          >
            Cancel
          </button>
          <button
            class="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
