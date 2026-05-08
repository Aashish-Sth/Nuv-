<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Menu Items";
</script>

<template>
  <div class="bg-white border border-admin-border rounded-lg p-8">
    <h2 class="text-lg font-semibold text-admin-text">Menu Items</h2>
    <p class="text-sm text-admin-muted mt-2">
      Use each restaurant detail page to manage menu items by category with inline availability toggles.
    </p>
    <NuxtLink to="/restaurants" class="mt-4 inline-flex items-center gap-2 text-sm text-nv-green">
      <Icon name="lucide:arrow-right" />
      Go to Restaurants
    </NuxtLink>
  </div>
</template>
