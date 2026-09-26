import { SOLAR_DISCOUNTS } from "./prizes";

export const REWARD_FILTERS = [
  { value: "", label: "All" },
  ...SOLAR_DISCOUNTS.map((d) => ({ value: String(d), label: `${d}% off` })),
  { value: "pending", label: "Not spun yet" },
];

export type LeadFilters = { q: string; reward: string };

export function readLeadFilters(params: Record<string, string | string[] | undefined>): LeadFilters {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const reward = first(params.reward);
  return {
    q: first(params.q).trim().slice(0, 80),
    reward: REWARD_FILTERS.some((f) => f.value === reward) ? reward : "",
  };
}

/** SQL WHERE clause (for `leads l`) shared by the leads table and the CSV export. */
export function leadWhere({ q, reward }: LeadFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (q) {
    const escaped = q.replace(/[\\%_]/g, "\\$&");
    params.push(`%${escaped}%`);
    const text = `$${params.length}`;
    const search = [`l.name ILIKE ${text}`, `l.coupon ILIKE ${text}`];
    const digits = q.replace(/\D/g, "");
    if (digits.length >= 3) {
      params.push(`%${digits}%`);
      search.push(`l.phone LIKE $${params.length}`);
    }
    conditions.push(`(${search.join(" OR ")})`);
  }

  if (reward === "pending") {
    conditions.push("l.status <> 'completed'");
  } else if (reward) {
    params.push(Number(reward));
    conditions.push(`l.status = 'completed' AND l.discount = $${params.length}`);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "", params };
}

export function filtersToQuery(filters: Partial<LeadFilters> & { page?: number }) {
  const search = new URLSearchParams();
  if (filters.q) search.set("q", filters.q);
  if (filters.reward) search.set("reward", filters.reward);
  if (filters.page && filters.page > 1) search.set("page", String(filters.page));
  const s = search.toString();
  return s ? `?${s}` : "";
}
