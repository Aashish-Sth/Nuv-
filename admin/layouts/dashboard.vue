<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { useAuthStore } from "~/stores/authStore";

const route = useRoute();
const pageTitle = usePageTitle();
const auth = useAuthStore();

type NavItem = {
  label: string;
  to: string;
  icon: string;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: "lucide:layout-dashboard" },
  { label: "Restaurants", to: "/restaurants", icon: "lucide:store" },
  { label: "Orders", to: "/orders", icon: "lucide:receipt" },
  { label: "Menu Items", to: "/menu", icon: "lucide:utensils" },
  { label: "Users", to: "/users", icon: "lucide:users", adminOnly: true },
  { label: "Analytics", to: "/analytics", icon: "lucide:bar-chart-2" },
];

const visibleNavItems = computed(() =>
  navItems.filter((item) => !(item.adminOnly && !auth.isAdmin)),
);

const initials = computed(() => {
  const name = auth.user?.name ?? "A";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
});

function isActivePath(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`);
}
</script>

<template>
  <div class="flex min-h-screen bg-admin-bg">
    <aside class="w-[260px] h-screen bg-admin-surface border-r border-admin-border flex flex-col">
      <div class="h-[72px] px-5 flex items-center justify-between border-b border-admin-border">
        <img src="/images/nuveLogo.png" alt="Nuvé" class="h-7 w-auto" />
        <span class="text-[10px] px-2 py-1 rounded-pill bg-nv-green-lt text-nv-green font-medium">
          Admin
        </span>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in visibleNavItems"
            :key="item.to"
            :to="item.to"
            class="h-10 rounded-md px-3 flex items-center gap-3 text-sm transition-colors"
            :class="
              isActivePath(item.to)
                ? 'bg-nv-green-lt text-nv-green'
                : 'text-admin-muted hover:text-admin-text hover:bg-admin-bg'
            "
          >
            <Icon :name="item.icon" size="18" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="my-3 border-t border-admin-border" />
        <NuxtLink
          to="/settings"
          class="h-10 rounded-md px-3 flex items-center gap-3 text-sm text-admin-muted hover:text-admin-text hover:bg-admin-bg transition-colors"
          :class="isActivePath('/settings') ? 'bg-nv-green-lt text-nv-green' : ''"
        >
          <Icon name="lucide:settings" size="18" />
          <span>Settings</span>
        </NuxtLink>
      </div>

      <div class="p-3 border-t border-admin-border">
        <Menu as="div" class="relative">
          <MenuButton class="w-full p-2 rounded-md border border-admin-border hover:bg-admin-bg transition">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-nv-green-lt text-nv-green grid place-items-center text-xs font-semibold">
                {{ initials }}
              </div>
              <div class="text-left flex-1">
                <p class="text-[13px] font-medium text-admin-text">{{ auth.user?.name ?? "User" }}</p>
                <p class="text-[11px] text-admin-muted">{{ auth.user?.role ?? "STAFF" }}</p>
              </div>
            </div>
          </MenuButton>
          <MenuItems class="absolute bottom-12 left-0 w-full bg-white rounded-md border border-admin-border shadow-lg p-1">
            <MenuItem v-slot="{ active }">
              <button class="w-full text-left px-3 py-2 rounded text-sm" :class="active ? 'bg-admin-bg' : ''">
                Profile
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button
                class="w-full text-left px-3 py-2 rounded text-sm text-admin-red"
                :class="active ? 'bg-admin-red-lt' : ''"
                @click="auth.logout()"
              >
                Logout
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </aside>

    <main class="flex-1 min-w-0">
      <header class="h-[60px] sticky top-0 z-10 bg-admin-surface border-b border-admin-border px-8 flex items-center justify-between">
        <h1 class="text-base font-semibold text-admin-text">{{ pageTitle }}</h1>
        <div class="flex items-center gap-4">
          <button class="text-admin-muted hover:text-admin-text">
            <Icon name="lucide:bell" size="20" />
          </button>
          <div class="w-8 h-8 rounded-full bg-nv-green-lt text-nv-green grid place-items-center text-xs font-semibold">
            {{ initials }}
          </div>
        </div>
      </header>

      <section class="p-8">
        <slot />
      </section>
    </main>
  </div>
</template>
