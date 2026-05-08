<script setup lang="ts">
const { login, register, isLoading, error, user } = useAuth();
const router = useRouter();
const route = useRoute();

const isLoginMode = ref(true);
const formData = reactive({
  name: "",
  email: "",
  password: "",
});

async function handleSubmit() {
  if (isLoginMode.value) {
    const success = await login(formData.email, formData.password);
    if (success) {
      const redirect =
        (route.query.redirect as string) ||
        (user.value?.role === "ADMIN" || user.value?.role === "STAFF"
          ? "/dashboard"
          : "/");
      router.push(redirect);
    }
  } else {
    const success = await register(
      formData.name,
      formData.email,
      formData.password,
    );
    if (success) {
      const redirect =
        (route.query.redirect as string) ||
        (user.value?.role === "ADMIN" || user.value?.role === "STAFF"
          ? "/dashboard"
          : "/");
      router.push(redirect);
    }
  }
}

useHead({
  title: "Login — Nuvé",
  meta: [{ name: "description", content: "Login to your Nuvé account" }],
});
</script>

<template>
  <div
    class="min-h-screen bg-nv-void flex items-center justify-center px-4 py-16"
  >
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <img src="/images/nuveLogo.png" alt="Nuvé" class="h-12 w-auto" />
        </NuxtLink>
      </div>

      <!-- Card -->
      <div class="bg-nv-surface border border-nv-border rounded-[16px] p-8">
        <!-- Heading -->
        <h1 class="nv-heading text-2xl mb-2 text-center">
          {{ isLoginMode ? "Welcome Back" : "Create Account" }}
        </h1>
        <p class="text-nv-muted text-sm text-center mb-6">
          {{ isLoginMode ? "Sign in to your account" : "Join us today" }}
        </p>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md"
        >
          {{ error }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name -->
          <div v-if="!isLoginMode">
            <label class="block text-sm font-medium text-nv-text mb-2">
              Full Name
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              placeholder="John Doe"
              class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-nv-text mb-2">
              Email
            </label>
            <input
              v-model="formData.email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-nv-text mb-2">
              Password
            </label>
            <input
              v-model="formData.password"
              :type="isLoginMode ? 'password' : 'password'"
              required
              :placeholder="
                isLoginMode ? '••••••••' : 'Min 8 chars, 1 uppercase, 1 number'
              "
              class="w-full bg-nv-void border border-nv-border rounded-md px-3 py-2 text-nv-text placeholder:text-nv-dim focus:outline-none focus:border-nv-green/50 transition-colors"
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-nv-green text-nv-void font-semibold py-2 rounded-md hover:bg-nv-green/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              isLoading
                ? "Loading..."
                : isLoginMode
                  ? "Sign In"
                  : "Create Account"
            }}
          </button>
        </form>

        <!-- Toggle -->
        <div class="mt-6 text-center">
          <p class="text-sm text-nv-muted">
            {{
              isLoginMode
                ? "Don't have an account?"
                : "Already have an account?"
            }}
            <button
              type="button"
              @click="isLoginMode = !isLoginMode"
              class="text-nv-green hover:underline font-medium"
            >
              {{ isLoginMode ? "Sign up" : "Sign in" }}
            </button>
          </p>
        </div>

        <!-- Demo -->
        <div v-if="isLoginMode" class="mt-6 pt-6 border-t border-nv-border">
          <p class="text-xs text-nv-dim text-center mb-3">Demo Credentials</p>
          <div class="space-y-2 text-xs">
            <button
              type="button"
              @click="
                () => {
                  formData.email = 'admin@nuve.com';
                  formData.password = 'Admin123';
                }
              "
              class="w-full text-left p-2 bg-nv-void border border-nv-border/50 rounded hover:border-nv-green/50 transition-colors text-nv-muted hover:text-nv-text"
            >
              Admin: admin@nuve.com / Admin123
            </button>
            <button
              type="button"
              @click="
                () => {
                  formData.email = 'user@nuve.com';
                  formData.password = 'User123';
                }
              "
              class="w-full text-left p-2 bg-nv-void border border-nv-border/50 rounded hover:border-nv-green/50 transition-colors text-nv-muted hover:text-nv-text"
            >
              User: user@nuve.com / User123
            </button>
          </div>
        </div>
      </div>

      <!-- Back to home -->
      <div class="text-center mt-6">
        <NuxtLink
          to="/"
          class="text-sm text-nv-muted hover:text-nv-green transition-colors"
        >
          ← Back to home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
