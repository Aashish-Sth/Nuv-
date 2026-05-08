<script setup lang="ts">
import { Switch } from "@headlessui/vue";
import { useAuthStore } from "~/stores/authStore";

definePageMeta({ layout: false });

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";
  try {
    await auth.login(email.value, password.value);
    await router.push("/dashboard");
  } catch (error) {
    const message = (error as Error).message || "Invalid credentials";
    errorMessage.value = message;
  }
}
</script>

<template>
  <div class="min-h-screen bg-admin-bg grid place-items-center p-6">
    <div class="w-full max-w-[400px] bg-admin-surface border border-admin-border rounded-lg p-12">
      <div class="flex items-center gap-2">
        <img src="/images/nuveLogo.png" alt="Nuvé" class="h-6 w-auto" />
        <p class="text-[12px] uppercase tracking-[0.1em] text-admin-muted">Admin Panel</p>
      </div>
      <h1 class="mt-6 text-2xl font-semibold text-admin-text">Welcome back</h1>
      <p class="mt-1 text-sm text-admin-muted">Sign in to your Nuvé dashboard</p>

      <div class="mt-8 space-y-4">
        <FormField label="Email">
          <input
            v-model="email"
            type="email"
            class="w-full h-[42px] px-3 rounded-md border border-admin-border text-sm bg-admin-surface focus:border-nv-green focus:outline-none focus:ring-4 focus:ring-[rgba(61,186,122,0.12)]"
            placeholder="you@nuve.co"
          />
        </FormField>

        <FormField label="Password" :error="errorMessage">
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full h-[42px] px-3 pr-12 rounded-md border border-admin-border text-sm bg-admin-surface focus:border-nv-green focus:outline-none focus:ring-4 focus:ring-[rgba(61,186,122,0.12)]"
              placeholder="••••••••"
              @keyup.enter="handleLogin"
            />
            <Switch
              v-model="showPassword"
              class="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md grid place-items-center text-admin-muted hover:bg-admin-bg"
            >
              <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" size="16" />
            </Switch>
          </div>
        </FormField>

        <button
          class="w-full h-11 rounded-md bg-nv-green text-white text-[15px] font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
          :disabled="auth.isLoading"
          @click="handleLogin"
        >
          <span v-if="auth.isLoading" class="spin-loader" />
          {{ auth.isLoading ? "Signing in..." : "Sign in" }}
        </button>
      </div>
    </div>
  </div>
</template>
