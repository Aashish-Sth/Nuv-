import { defineStore } from "pinia";
import type { User } from "@nuve/shared";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  user: User;
  accessToken: string;
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
    isLoading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    isAdmin: (state) => state.user?.role === "ADMIN",
    isStaff: (state) => state.user?.role === "STAFF",
  },
  actions: {
    getApiBase() {
      const config = useRuntimeConfig();
      const rawBase = String(config.public.apiBase || "").trim();

      if (/^https?:\/\//i.test(rawBase)) {
        return rawBase.replace(/\/+$/, "");
      }

      if (rawBase.startsWith("/")) {
        return `http://localhost:3001${rawBase}`.replace(/\/+$/, "");
      }

      return "http://localhost:3001/api";
    },

    async login(email: string, password: string) {
      const apiBase = this.getApiBase();
      this.isLoading = true;
      try {
        const res = await $fetch<{ success: boolean; data?: LoginResponse; error?: string }>(
          `${apiBase}/auth/login`,
          {
            method: "POST",
            credentials: "include",
            body: { email, password } as LoginPayload,
          },
        );

        if (!res.success || !res.data) {
          throw new Error(res.error ?? "Login failed");
        }

        this.user = res.data.user;
        this.accessToken = res.data.accessToken;
        return res.data;
      } finally {
        this.isLoading = false;
      }
    },
    async logout() {
      const apiBase = this.getApiBase();
      try {
        if (this.accessToken) {
          await $fetch(`${apiBase}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          });
        }
      } catch {
        // Ignore logout failures and clear local state anyway.
      } finally {
        this.user = null;
        this.accessToken = null;
        await navigateTo("/login");
      }
    },
    async refreshToken() {
      const apiBase = this.getApiBase();
      const res = await $fetch<{ success: boolean; data?: { accessToken: string }; error?: string }>(
        `${apiBase}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!res.success || !res.data?.accessToken) {
        throw new Error(res.error ?? "Session refresh failed");
      }
      this.accessToken = res.data.accessToken;
      return res.data.accessToken;
    },
    async fetchMe() {
      const apiBase = this.getApiBase();
      if (!this.accessToken) return null;
      const res = await $fetch<{ success: boolean; data?: User; error?: string }>(
        `${apiBase}/auth/me`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!res.success || !res.data) {
        throw new Error(res.error ?? "Failed to fetch user");
      }
      this.user = res.data;
      return res.data;
    },
  },
});
