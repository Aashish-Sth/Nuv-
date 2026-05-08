export const useApi = () => {
  const config = useRuntimeConfig();
  const raw = String(config.public.backendUrl || "").trim();
  const baseUrl = /^https?:\/\//i.test(raw)
    ? raw.replace(/\/+$/, "")
    : raw.startsWith("/")
      ? `http://localhost:3001${raw}`.replace(/\/+$/, "")
      : "http://localhost:3001";

  async function tryFetch(url: string) {
    try {
      return await $fetch(url);
    } catch (e) {
      return null;
    }
  }

  async function fetchMenu(restaurantId: string) {
    const endpoints = [];
    const hasApiSuffix = /\/api$/i.test(baseUrl);
    endpoints.push(
      hasApiSuffix
        ? `${baseUrl}/restaurants/${restaurantId}/menu`
        : `${baseUrl}/api/restaurants/${restaurantId}/menu`,
    );

    for (const url of endpoints) {
      const res = await tryFetch(url);
      if (res && (res as any).success) {
        const grouped = (res as any).data || {};
        const items = Object.values(grouped).flat() as any[];
        return items;
      }
    }

    return null;
  }

  return { fetchMenu };
};

export default useApi;
