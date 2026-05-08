import { computed, ref } from "vue";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const authState = ref<AuthState>({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
});

function getBackendUrl() {
  try {
    const config = useRuntimeConfig();
    const raw = String(config.public.backendUrl || "").trim();

    if (/^https?:\/\//i.test(raw)) {
      return raw.replace(/\/+$/, "");
    }

    if (raw.startsWith("/")) {
      return `http://localhost:3001${raw}`.replace(/\/+$/, "");
    }

    return "http://localhost:3001";
  } catch {
    return "http://localhost:3001";
  }
}

async function makeAuthRequest(endpoint: string, method: string, body?: any) {
  const baseUrl = getBackendUrl();
  const hasApiSuffix = /\/api$/i.test(baseUrl);
  const url = hasApiSuffix ? `${baseUrl}${endpoint}` : `${baseUrl}/api${endpoint}`;

  const opts: any = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (authState.value.accessToken) {
    opts.headers.Authorization = `Bearer ${authState.value.accessToken}`;
  }

  if (body) {
    opts.body = body;
  }

  const res = await $fetch(url, opts);
  return res;
}

export const useAuth = () => {
  const user = computed(() => authState.value.user);
  const accessToken = computed(() => authState.value.accessToken);
  const isLoading = computed(() => authState.value.isLoading);
  const error = computed(() => authState.value.error);
  const isAuthenticated = computed(() => !!authState.value.user);
  const isAdmin = computed(
    () =>
      authState.value.user?.role === "ADMIN" ||
      authState.value.user?.role === "STAFF",
  );

  async function register(name: string, email: string, password: string) {
    authState.value.isLoading = true;
    authState.value.error = null;
    try {
      const res = await makeAuthRequest("/auth/register", "POST", {
        name,
        email,
        password,
      });
      if ((res as any).success) {
        const data = (res as any).data;
        authState.value.user = data.user;
        authState.value.accessToken = data.accessToken;
        // store token in sessionStorage
        sessionStorage.setItem("nuve_auth_token", data.accessToken);
        return true;
      }
      throw new Error((res as any).error || "Registration failed");
    } catch (e: any) {
      authState.value.error = e.message || "Registration failed";
      return false;
    } finally {
      authState.value.isLoading = false;
    }
  }

  async function login(email: string, password: string) {
    authState.value.isLoading = true;
    authState.value.error = null;
    try {
      const res = await makeAuthRequest("/auth/login", "POST", {
        email,
        password,
      });
      if ((res as any).success) {
        const data = (res as any).data;
        authState.value.user = data.user;
        authState.value.accessToken = data.accessToken;
        sessionStorage.setItem("nuve_auth_token", data.accessToken);
        return true;
      }
      throw new Error((res as any).error || "Login failed");
    } catch (e: any) {
      authState.value.error = e.message || "Login failed";
      return false;
    } finally {
      authState.value.isLoading = false;
    }
  }

  async function logout() {
    authState.value.isLoading = true;
    try {
      await makeAuthRequest("/auth/logout", "POST");
    } catch (e) {
      // ignore logout errors
    } finally {
      authState.value.user = null;
      authState.value.accessToken = null;
      sessionStorage.removeItem("nuve_auth_token");
      authState.value.isLoading = false;
    }
  }

  async function checkAuth() {
    const token = sessionStorage.getItem("nuve_auth_token");
    if (!token) return;

    authState.value.isLoading = true;
    authState.value.accessToken = token;
    try {
      const res = await makeAuthRequest("/auth/me", "GET");
      if ((res as any).success) {
        authState.value.user = (res as any).data;
        authState.value.accessToken = token;
        return true;
      }
    } catch (e) {
      sessionStorage.removeItem("nuve_auth_token");
      authState.value.accessToken = null;
    } finally {
      authState.value.isLoading = false;
    }
  }

  async function updateProfile(payload: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    authState.value.isLoading = true;
    authState.value.error = null;
    try {
      const res = await makeAuthRequest("/auth/me", "PATCH", payload);
      if ((res as any).success) {
        authState.value.user = (res as any).data;
        return { success: true, data: (res as any).data };
      }
      throw new Error((res as any).error || "Failed to update profile");
    } catch (e: any) {
      const message =
        e?.data?.error || e?.message || "Failed to update profile";
      authState.value.error = message;
      return { success: false, error: message };
    } finally {
      authState.value.isLoading = false;
    }
  }

  return {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    checkAuth,
    updateProfile,
  };
};
