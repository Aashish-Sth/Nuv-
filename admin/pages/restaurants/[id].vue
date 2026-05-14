<script setup lang="ts">
import { Switch } from "@headlessui/vue";

definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Restaurant Details";

const route = useRoute();
const { request } = useApi();
const restaurant = ref<Record<string, unknown> | null>(null);
const draft = ref<Record<string, unknown>>({});
const groupedMenu = ref<Record<string, Record<string, unknown>[]>>({});
const changed = computed(
  () => JSON.stringify(draft.value) !== JSON.stringify(restaurant.value ?? {}),
);

async function load() {
  const data = await request<Record<string, unknown>>(
    `/restaurants/${String(route.params.id)}`,
  );
  restaurant.value = data;
  draft.value = { ...data };
  groupedMenu.value =
    (data.groupedMenu as Record<string, Record<string, unknown>[]>) ?? {};
}

async function saveChanges() {
  await request(`/restaurants/${String(route.params.id)}`, {
    method: "PATCH",
    body: {
      name: draft.value.name,
      description: draft.value.description,
      cuisine: draft.value.cuisine,
      deliveryTime: draft.value.deliveryTime,
      minOrder: draft.value.minOrder,
      isActive: draft.value.isActive,
    },
  });
  if (
    Boolean(restaurant.value?.isVerified) !== Boolean(draft.value.isVerified)
  ) {
    await request(`/restaurants/${String(route.params.id)}/verify`, {
      method: "PATCH",
    });
  }
  await load();
}

async function toggleMenuAvailability(itemId: string, current: boolean) {
  await request(`/restaurants/${String(route.params.id)}/menu/${itemId}`, {
    method: "PATCH",
    body: { isAvailable: !current },
  });
  await load();
}

async function deleteMenuItem(itemId: string) {
  await request(`/restaurants/${String(route.params.id)}/menu/${itemId}`, {
    method: "DELETE",
  });
  await load();
}

async function addMenuItem(category: string) {
  await request(`/restaurants/${String(route.params.id)}/menu`, {
    method: "POST",
    body: {
      name: `New ${category} Item`,
      description: "Freshly added menu item",
      price: 9.99,
      category,
      image: null,
      isAvailable: true,
    },
  });
  await load();
}

onMounted(load);
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
    <div class="space-y-4">
      <div class="bg-white border border-admin-border rounded-lg p-6 space-y-4">
        <FormField label="Name"
          ><input
            v-model="draft.name"
            class="h-10 w-full rounded-md border border-admin-border px-3"
        /></FormField>
        <FormField label="Description">
          <textarea
            v-model="draft.description"
            class="w-full rounded-md border border-admin-border px-3 py-2 min-h-[90px]"
          ></textarea>
        </FormField>
        <div class="grid grid-cols-2 gap-3">
          <FormField label="Cuisine"
            ><input
              v-model="draft.cuisine"
              class="h-10 w-full rounded-md border border-admin-border px-3"
          /></FormField>
          <FormField label="Delivery Time"
            ><input
              v-model="draft.deliveryTime"
              type="number"
              class="h-10 w-full rounded-md border border-admin-border px-3"
          /></FormField>
          <FormField label="Min Order"
            ><input
              v-model="draft.minOrder"
              type="number"
              class="h-10 w-full rounded-md border border-admin-border px-3"
          /></FormField>
        </div>
        <div class="flex gap-8">
          <label class="flex items-center gap-2 text-sm">
            <Switch
              v-model="draft.isActive"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="draft.isActive ? 'bg-nv-green' : 'bg-admin-border'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="draft.isActive ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
            Active
          </label>
          <label class="flex items-center gap-2 text-sm">
            <Switch
              v-model="draft.isVerified"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="draft.isVerified ? 'bg-nv-green' : 'bg-admin-border'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="draft.isVerified ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
            Verified
          </label>
        </div>
        <div v-if="changed" class="flex gap-2">
          <button
            class="h-10 px-4 rounded-md bg-nv-green text-white text-sm"
            @click="saveChanges"
          >
            Save
          </button>
          <button
            class="h-10 px-4 rounded-md border border-admin-border text-sm"
            @click="draft = { ...(restaurant || {}) }"
          >
            Discard
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white border border-admin-border rounded-lg p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-sm">Menu Items</h3>
      </div>
      <div
        v-for="(items, category) in groupedMenu"
        :key="category"
        class="mb-4"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs uppercase tracking-[0.08em] text-admin-muted">
            {{ category }}
          </p>
          <button
            class="text-xs text-nv-green"
            @click="addMenuItem(String(category))"
          >
            Add item
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="item in items"
            :key="String(item.id)"
            class="border border-admin-border rounded-md p-3 flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-medium">{{ item.name }}</p>
              <p class="text-xs text-admin-muted">
                ${{ Number(item.price).toFixed(2) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Switch
                :model-value="Boolean(item.isAvailable)"
                class="relative inline-flex h-6 w-11 items-center rounded-full"
                :class="item.isAvailable ? 'bg-nv-green' : 'bg-admin-border'"
                @update:model-value="
                  toggleMenuAvailability(
                    String(item.id),
                    Boolean(item.isAvailable),
                  )
                "
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                  :class="item.isAvailable ? 'translate-x-6' : 'translate-x-1'"
                />
              </Switch>
              <button
                class="text-xs text-admin-red"
                @click="deleteMenuItem(String(item.id))"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
