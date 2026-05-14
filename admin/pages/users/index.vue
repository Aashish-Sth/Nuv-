<script setup lang="ts">
import { useAuthStore } from "~/stores/authStore";

definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Users";

const auth = useAuthStore();
const { request } = useApi();
const rows = ref<Record<string, unknown>[]>([]);
const loading = ref(true);
const query = ref("");
const role = ref("");
const page = ref(1);
const totalPages = ref(1);

watchEffect(() => {
  if (auth.user?.role === "STAFF") {
    navigateTo("/dashboard");
  }
});

async function load() {
  loading.value = true;
  try {
    const data = await request<{ items: Record<string, unknown>[]; totalPages: number }>(
      `/users?page=${page.value}&limit=12`,
    );
    rows.value = data.items.filter((item) => {
      const matchesQuery = query.value
        ? String(item.name).toLowerCase().includes(query.value.toLowerCase()) ||
          String(item.email).toLowerCase().includes(query.value.toLowerCase())
        : true;
      const matchesRole = role.value ? item.role === role.value : true;
      return matchesQuery && matchesRole;
    });
    totalPages.value = data.totalPages || 1;
  } finally {
    loading.value = false;
  }
}

async function changeRole(userId: string, nextRole: string) {
  await request(`/users/${userId}/role`, { method: "PATCH", body: { role: nextRole } });
  await load();
}

async function toggleStatus(userId: string) {
  await request(`/users/${userId}/status`, { method: "PATCH" });
  await load();
}

onMounted(load);
watch(page, load);
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-3">
      <input v-model="query" class="h-10 w-[280px] rounded-md border border-admin-border px-3 text-sm" placeholder="Search users..." />
      <select v-model="role" class="h-10 rounded-md border border-admin-border px-3 text-sm">
        <option value="">All Roles</option>
        <option value="ADMIN">ADMIN</option>
        <option value="STAFF">STAFF</option>
        <option value="CUSTOMER">CUSTOMER</option>
      </select>
    </div>

    <DataTable
      :loading="loading"
      :rows="rows"
      :columns="[
        { key: 'name', label: 'User' },
        { key: 'role', label: 'Role' },
        { key: 'orders', label: 'Orders' },
        { key: 'createdAt', label: 'Join Date' },
        { key: 'isActive', label: 'Status' },
        { key: 'actions', label: 'Actions' }
      ]"
    >
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-nv-green-lt text-nv-green grid place-items-center text-xs font-semibold">
            {{ String(row.name).slice(0, 1) }}
          </div>
          <div>
            <p class="text-sm">{{ row.name }}</p>
            <p class="text-xs text-admin-muted">{{ row.email }}</p>
          </div>
        </div>
      </template>
      <template #cell-role="{ row }">
        <span
          class="px-2 py-1 rounded-pill text-xs font-medium"
          :class="
            row.role === 'ADMIN' ? 'bg-[#EDE9FE] text-[#7C3AED]' :
            row.role === 'STAFF' ? 'bg-admin-blue-lt text-admin-blue' :
            'bg-[#F2F4F7] text-[#667085]'
          "
        >
          {{ row.role }}
        </span>
      </template>
      <template #cell-orders="{ row }">{{ row._count?.orders ?? 0 }}</template>
      <template #cell-isActive="{ row }"><StatusBadge :status="row.isActive ? 'ACTIVE' : 'INACTIVE'" /></template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <select
            class="h-8 rounded border border-admin-border px-2 text-xs"
            :value="String(row.role)"
            @change="changeRole(String(row.id), ($event.target as HTMLSelectElement).value)"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
          <button class="h-8 px-2 rounded border border-admin-border text-xs" @click="toggleStatus(String(row.id))">
            Toggle Active
          </button>
        </div>
      </template>
    </DataTable>

    <Pagination :current-page="page" :total-pages="totalPages" :on-page-change="(nextPage) => (page = nextPage)" />
  </div>
</template>
