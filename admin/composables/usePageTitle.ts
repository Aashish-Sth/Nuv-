export function usePageTitle() {
  return useState<string>("admin-page-title", () => "Dashboard");
}
