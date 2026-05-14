<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Restaurants";

const { request } = useApi();
const query = ref("");
const statusFilter = ref<"ALL" | "ACTIVE" | "INACTIVE" | "UNVERIFIED">("ALL");
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);
const rows = ref<Record<string, unknown>[]>([]);
const confirmOpen = ref(false);
const selected = ref<Record<string, unknown> | null>(null);

async function load() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: "10",
      search: query.value,
    });
    const data = await request<{ items: Record<string, unknown>[]; totalPages: number }>(
      `/restaurants?${params.toString()}`,
    );
    rows.value = data.items;
    totalPages.value = data.totalPages || 1;
  } finally {
    loading.value = false;
  }
}

function filteredRows() {
  return rows.value.filter((row) => {
    if (statusFilter.value === "ACTIVE") return row.isActive === true;
    if (statusFilter.value === "INACTIVE") return row.isActive === false;
    if (statusFilter.value === "UNVERIFIED") return row.isVerified === false;
    return true;
  });
}

async function confirmDelete() {
  if (!selected.value?.id) return;
  await request(`/restaurants/${String(selected.value.id)}`, { method: "DELETE" });
  confirmOpen.value = false;
  selected.value = null;
  await load();
}

async function toggleActive(row: Record<string, unknown>) {
  await request(`/restaurants/${String(row.id)}`, {
    method: "PATCH",
    body: { isActive: !Boolean(row.isActive) },
  });
  await load();
}

async function createRestaurant() {
  await request("/restaurants", {
    method: "POST",
    body: {
      name: `New Restaurant ${Date.now()}`,
      description: "Modern kitchen by Nuvé.",
      cuisine: "Fusion",
      cuisines: ["Fusion"],
      deliveryTime: 30,
      minOrder: 10,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    },
  });
  await load();
}

onMounted(load);
watch([query, page], load);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Restaurants</h2>
      <button class="h-10 px-4 rounded-md bg-nv-green text-white text-sm flex items-center gap-2" @click="createRestaurant">
        <Icon name="lucide:plus" size="16" />
        Add Restaurant
      </button>
    </div>

    <div class="flex flex-wrap gap-3">
      <input v-model="query" placeholder="Search restaurants..." class="h-10 w-[280px] rounded-md border border-admin-border bg-white px-3 text-sm" />
      <select v-model="statusFilter" class="h-10 rounded-md border border-admin-border bg-white px-3 text-sm">
        <option value="ALL">All</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="UNVERIFIED">Unverified</option>
      </select>
    </div>

    <DataTable
      :loading="loading"
      :rows="filteredRows()"
      :columns="[
        { key: 'name', label: 'Restaurant' },
        { key: 'rating', label: 'Rating' },
        { key: 'isActive', label: 'Status' },
        { key: 'isVerified', label: 'Verified' },
        { key: 'actions', label: 'Actions' }
      ]"
    >
      <template #cell-name="{ row }">
        <button class="text-left" @click="navigateTo(`/restaurants/${String(row.id)}`)">
          <div class="flex items-center gap-3">
            <img :src="String(row.image)" alt="" class="w-10 h-10 rounded-sm object-cover" />
            <div>
              <p class="text-sm font-medium">{{ row.name }}</p>
              <p class="text-xs text-admin-muted">{{ row.cuisine }}</p>
            </div>
          </div>
        </button>
      </template>
      <template #cell-rating="{ row }">⭐ {{ Number(row.rating ?? 0).toFixed(1) }}</template>
      <template #cell-isActive="{ row }"><StatusBadge :status="row.isActive ? 'ACTIVE' : 'INACTIVE'" /></template>
      <template #cell-isVerified="{ row }">
        <Icon :name="row.isVerified ? 'lucide:check' : 'lucide:minus'" :class="row.isVerified ? 'text-nv-green' : 'text-admin-muted'" />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <button class="text-xs px-2 py-1 rounded border border-admin-border" @click="navigateTo(`/restaurants/${String(row.id)}`)">Edit</button>
          <button class="text-xs px-2 py-1 rounded border border-admin-border" @click="toggleActive(row)">Toggle</button>
          <button
            class="text-xs px-2 py-1 rounded border border-admin-red text-admin-red"
            @click="
              selected = row;
              confirmOpen = true;
            "
          >
            Delete
          </button>
        </div>
      </template>
    </DataTable>

    <Pagination :current-page="page" :total-pages="totalPages" :on-page-change="(nextPage) => (page = nextPage)" />

    <ConfirmDialog
      :open="confirmOpen"
      title="Are you sure?"
      :message="`Delete ${String(selected?.name ?? 'this restaurant')}?`"
      confirm-label="Delete"
      confirm-variant="danger"
      :on-cancel="() => (confirmOpen = false)"
      :on-confirm="confirmDelete"
    />
  </div>
</template>
