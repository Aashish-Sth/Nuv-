import { useAuthStore } from "~/stores/authStore";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login") return;

  const auth = useAuthStore();
  if (!auth.accessToken) {
    try {
      await auth.refreshToken();
      await auth.fetchMe();
    } catch {
      return navigateTo("/login");
    }
  } else if (!auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      return navigateTo("/login");
    }
  }

  if (auth.user?.role === "STAFF" && to.path.startsWith("/users")) {
    return navigateTo("/dashboard");
  }
});
