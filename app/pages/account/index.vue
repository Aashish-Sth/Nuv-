<script setup lang="ts">
definePageMeta({ middleware: "userOnly" });
const { user, logout } = useAuth();
useHead({ title: "My Account — Nuvé" });
</script>

<template>
  <div class="pt-24 pb-16">
    <div class="nv-container">
      <h1 class="nv-heading text-3xl mb-6">Account</h1>
      <div class="bg-nv-surface border border-nv-border rounded-[12px] p-6">
        <p class="text-sm text-nv-muted">Signed in as</p>
        <h2 class="font-semibold text-nv-text">
          {{ user?.name }} — {{ user?.email }}
        </h2>
        <div class="mt-4">
          <NuxtLink to="/orders" class="text-sm text-nv-green underline"
            >View orders</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>
