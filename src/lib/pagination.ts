export const PAGE_SIZE = 24;
export const MAX_PAGES = 20;

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_PAGES);
}

/** Cumulative take so ?page=3 is shareable and still a Load-more trail. */
export function takeForPage(page: number, pageSize = PAGE_SIZE) {
  return page * pageSize;
}

export function pageHref(basePath: string, page: number) {
  if (page <= 1) return basePath;
  return `${basePath}?page=${page}`;
}
