import { useAuthStore } from "~/stores/authStore";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const rawBase = String(config.public.apiBase || "").trim();
  const apiBase = /^https?:\/\//i.test(rawBase)
    ? rawBase.replace(/\/+$/, "")
    : rawBase.startsWith("/")
      ? `http://localhost:3001${rawBase}`.replace(/\/+$/, "")
      : "http://localhost:3001/api";

  const api = $fetch.create({
    baseURL: apiBase,
    credentials: "include",
    async onRequest({ options }) {
      if (auth.accessToken) {
        const headers = new Headers(options.headers as HeadersInit | undefined);
        headers.set("Authorization", `Bearer ${auth.accessToken}`);
        options.headers = headers;
      }
    },
    async onResponseError(ctx) {
      const originalOptions = ctx.options as Record<string, unknown> & { _retry?: boolean };
      const isUnauthorized = ctx.response?.status === 401;
      if (!isUnauthorized || originalOptions._retry) {
        const responseData = (ctx.response?._data ?? {}) as ApiResponse<unknown>;
        throw createError({
          statusCode: ctx.response?.status ?? 500,
          statusMessage: responseData.error ?? "Request failed",
          data: responseData,
        });
      }

      try {
        await auth.refreshToken();
        originalOptions._retry = true;
        const headers = new Headers(ctx.options.headers as HeadersInit | undefined);
        if (auth.accessToken) {
          headers.set("Authorization", `Bearer ${auth.accessToken}`);
        }
        return await $fetch(ctx.request, {
          ...ctx.options,
          headers,
        });
      } catch {
        await auth.logout();
        throw createError({
          statusCode: 401,
          statusMessage: "Session expired",
        });
      }
    },
  });

  async function request<T>(path: string, options?: Parameters<typeof api<T>>[1]) {
    const res = await api<ApiResponse<T>>(path, options);
    if (!res.success) {
      throw createError({
        statusCode: 400,
        statusMessage: res.error ?? "Request failed",
        data: res,
      });
    }
    return res.data as T;
  }

  return { api, request };
}
