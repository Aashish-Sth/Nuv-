<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const isScrolled = ref(false);
const isMobileOpen = ref(false);
const { itemCount } = useCart();
const { user, isAdmin, logout, checkAuth } = useAuth();

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const userInitial = computed(
  () => user.value?.name?.charAt(0)?.toUpperCase() || "U",
);
const profileRoute = computed(() =>
  isAdmin.value ? "/profile" : "/account/profile",
);

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  checkAuth();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

function handleScroll() {
  isScrolled.value = window.scrollY > 20;
}

function isActive(to: string) {
  return route.path === to;
}

watch(
  () => route.path,
  () => {
    isMobileOpen.value = false;
  },
);

async function handleLogout() {
  await logout();
  router.push("/");
}
</script>

<template>
  <header
    id="app-header"
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="
      isScrolled
        ? 'bg-nv-void/85 backdrop-blur-xl border-b border-nv-border'
        : 'bg-transparent'
    "
  >
    <div class="nv-container flex items-center justify-between h-16 md:h-20">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 shrink-0 py-2">
        <img
          src="/images/nuveLogo.png"
          alt="Nuvé"
          class="h-10 md:h-12 w-auto"
        />
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nv-link text-sm font-medium tracking-wide"
          :class="{ active: isActive(link.to) }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-2 md:gap-3">
        <!-- Admin Dashboard -->
        <NuxtLink
          v-if="isAdmin"
          to="/dashboard"
          class="hidden sm:inline-flex text-sm px-3 py-1.5 rounded border border-nv-border text-nv-muted hover:text-nv-green hover:border-nv-green/50 transition-colors"
        >
          Admin
        </NuxtLink>

        <!-- Profile -->
        <NuxtLink
          v-if="user"
          :to="profileRoute"
          class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-nv-border text-nv-muted hover:text-nv-green hover:border-nv-green/50 transition-colors"
          aria-label="Profile"
        >
          <span class="text-xs font-semibold">{{ userInitial }}</span>
        </NuxtLink>

        <!-- Cart -->
        <NuxtLink
          to="/cart"
          class="relative group flex items-center justify-center w-10 h-10 rounded-full border border-nv-border hover:border-nv-green/40 transition-all duration-300"
        >
          <svg
            class="w-5 h-5 text-nv-muted group-hover:text-nv-green transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <Transition name="badge">
            <span
              v-if="itemCount > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-nv-green text-nv-void text-[10px] font-bold flex items-center justify-center rounded-full px-[3px]"
            >
              {{ itemCount > 99 ? '99+' : itemCount }}
            </span>
          </Transition>
        </NuxtLink>

        <!-- Auth -->
        <div v-if="user" class="flex items-center gap-2">
          <span
            class="text-xs text-nv-muted hidden lg:inline max-w-[120px] truncate"
            >{{ user.name }}</span
          >
          <button
            class="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded border border-nv-border text-nv-muted hover:text-red-400 hover:border-red-400/50 transition-colors"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
        <NuxtLink
          v-else
          to="/auth/login"
          class="text-sm px-3 py-1.5 rounded border border-nv-green/50 text-nv-green hover:bg-nv-green/10 transition-colors"
        >
          Login
        </NuxtLink>

        <!-- Mobile Toggle -->
        <button
          class="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
          aria-label="Toggle menu"
          @click="isMobileOpen = !isMobileOpen"
        >
          <span
            class="block w-full h-px bg-nv-text transition-all duration-300"
            :class="isMobileOpen ? 'rotate-45 translate-y-[4px]' : ''"
          />
          <span
            class="block w-full h-px bg-nv-text transition-all duration-300"
            :class="isMobileOpen ? '-rotate-45 -translate-y-[3px]' : ''"
          />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <div
        v-if="isMobileOpen"
        class="md:hidden bg-nv-base/95 backdrop-blur-xl border-b border-nv-border"
      >
        <nav class="nv-container py-6 flex flex-col gap-4">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-lg font-medium transition-colors duration-300"
            :class="
              isActive(link.to)
                ? 'text-nv-green'
                : 'text-nv-muted hover:text-nv-text'
            "
          >
            {{ link.label }}
          </NuxtLink>

          <NuxtLink
            v-if="user"
            :to="profileRoute"
            class="text-lg font-medium transition-colors duration-300 text-nv-muted hover:text-nv-text"
          >
            Profile
          </NuxtLink>
          <NuxtLink
            v-if="isAdmin"
            to="/dashboard"
            class="text-lg font-medium transition-colors duration-300 text-nv-muted hover:text-nv-text"
          >
            Admin Dashboard
          </NuxtLink>
          <NuxtLink
            v-if="!user"
            to="/auth/login"
            class="text-lg font-medium transition-colors duration-300 text-nv-muted hover:text-nv-text"
          >
            Login
          </NuxtLink>
          <button
            v-if="user"
            class="text-left text-lg font-medium transition-colors duration-300 text-red-400 hover:text-red-300"
            @click="handleLogout"
          >
            Logout
          </button>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    opacity 300ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.badge-enter-active,
.badge-leave-active {
  transition: opacity 200ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-enter-from,
.badge-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
