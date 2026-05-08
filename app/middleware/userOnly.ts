export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, isAdmin } = useAuth();
  // allow only authenticated non-admin users
  if (!isAuthenticated.value || isAdmin.value) {
    return navigateTo(
      `/auth/login?redirect=${encodeURIComponent(to.fullPath)}`,
    );
  }
});
