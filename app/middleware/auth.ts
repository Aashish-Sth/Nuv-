export default defineRouteMiddleware((to, from) => {
  const { isAdmin } = useAuth();

  // Protect admin-only routes
  if (to.path.startsWith("/dashboard")) {
    if (!isAdmin.value) {
      return navigateTo("/auth/login");
    }
  }

  // Redirect authenticated users away from login
  if (to.path === "/auth/login") {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated.value) {
      return navigateTo("/");
    }
  }
});
