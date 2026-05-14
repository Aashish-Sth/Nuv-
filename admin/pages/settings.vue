<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
const title = usePageTitle();
title.value = "Settings";
</script>

<template>
  <div class="bg-white border border-admin-border rounded-lg p-8">
    <h2 class="text-lg font-semibold text-admin-text">Settings</h2>
    <p class="text-sm text-admin-muted mt-2">Account and workspace settings can be added here.</p>
  </div>
</template>
