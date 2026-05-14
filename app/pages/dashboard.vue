<script setup lang="ts">
definePageMeta({ middleware: "admin" });

const { user, isAdmin, logout } = useAuth();
const router = useRouter();

const activeTab = ref<"manage-restaurants" | "manage-menu">(
  "manage-restaurants",
);

async function handleLogout() {
  await logout();
  router.push("/auth/login");
}

useHead({
  title: "Admin Dashboard — Nuvé",
  meta: [{ name: "description", content: "Admin dashboard" }],
});
</script>

<template>
  <div class="min-h-screen bg-nv-void">
    <!-- Nav -->
    <nav class="bg-nv-surface border-b border-nv-border sticky top-0 z-40">
      <div class="nv-container flex items-center justify-between h-16">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/images/nuveLogo.png" alt="Nuvé" class="h-8 w-auto" />
          <span class="font-semibold text-nv-green">Admin</span>
        </NuxtLink>
        <div class="flex items-center gap-4">
          <span class="text-sm text-nv-muted">{{ user?.name }}</span>
          <button
            @click="handleLogout"
            class="text-sm px-3 py-1.5 rounded border border-nv-border text-nv-muted hover:text-nv-green hover:border-nv-green/50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <div class="nv-container py-8">
      <!-- Tabs -->
      <div class="flex gap-4 mb-8 border-b border-nv-border">
        <button
          @click="activeTab = 'manage-restaurants'"
          :class="[
            'px-4 py-3 font-medium transition-colors border-b-2',
            activeTab === 'manage-restaurants'
              ? 'text-nv-green border-nv-green'
              : 'text-nv-muted border-transparent hover:text-nv-text',
          ]"
        >
          Restaurants
        </button>
        <button
          @click="activeTab = 'manage-menu'"
          :class="[
            'px-4 py-3 font-medium transition-colors border-b-2',
            activeTab === 'manage-menu'
              ? 'text-nv-green border-nv-green'
              : 'text-nv-muted border-transparent hover:text-nv-text',
          ]"
        >
          Menu Items
        </button>
      </div>

      <!-- Restaurant Management -->
      <AdminRestaurantsTab v-if="activeTab === 'manage-restaurants'" />

      <!-- Menu Management -->
      <AdminMenuTab v-if="activeTab === 'manage-menu'" />
    </div>
  </div>
</template>
