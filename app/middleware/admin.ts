export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated.value || !isAdmin.value) {
    return navigateTo(
      `/auth/login?redirect=${encodeURIComponent(to.fullPath)}`,
    );
  }
});
