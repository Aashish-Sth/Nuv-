<script setup lang="ts">
const { checkAuth } = useAuth();
const route = useRoute();

const hideGlobalChrome = computed(() => route.path.startsWith("/dashboard"));

onMounted(async () => {
  await checkAuth();
});
</script>

<template>
  <div class="min-h-screen bg-nv-void text-nv-text font-body">
    <LayoutAppHeader v-if="!hideGlobalChrome" />
    <main>
      <NuxtPage />
    </main>
    <LayoutAppFooter v-if="!hideGlobalChrome" />
    <UiToast />
  </div>
</template>
