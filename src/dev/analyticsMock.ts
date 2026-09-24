import type { RangeKey } from "@/components/analytics/RangeSelector";
import type { SpendBasis } from "@/components/analytics/TotalCard";
import { computeAnalytics, rangeWindow, type AnalyticsData } from "@/data/analytics";
import type { Category, Person, ScopedExpense } from "@/data/types";

// Mock data for the kitchen ANALYTICS tab: about a year of mixed
// personal/group spends, so every analytics component has realistic input.

export const ANALYTICS_PEOPLE: Person[] = [
  { id: "p1", name: "You" },
  { id: "p2", name: "Riya" },
  { id: "p3", name: "Kabir" },
];

export const ANALYTICS_GROUPS = [
  { id: "g1", name: "Flat 402" },
  { id: "g2", name: "Goa Trip" },
];

export const ANALYTICS_CATEGORIES: Category[] = [
  { id: "c1", name: "FOOD" },
  { id: "c2", name: "TRAVEL" },
  { id: "c3", name: "UTILITIES" },
  { id: "c4", name: "SHOPPING" },
  { id: "c5", name: "RENT" },
];

let seq = 0;

function mock(
  date: string,
  item: string,
  amount: number,
  opts: { online?: boolean; paidBy?: string; categoryId?: string; groupId?: string; splitWith?: string[] },
): ScopedExpense {
  const paidBy = opts.paidBy ?? "p1";
  const people = opts.splitWith ?? [paidBy];
  const each = Math.round(amount / people.length);
  return {
    id: `a${++seq}`,
    date,
    item,
    amount,
    isOnline: opts.online ?? false,
    paidBy,
    categoryId: opts.categoryId,
    splitType: people.length > 1 ? "equal" : "none",
    splits: people.map((personId) => ({ personId, amount: each })),
    groupId: opts.groupId ?? null,
  };
}

const FLAT = ["p1", "p2", "p3"];
const TRIP = ["p1", "p3"];

export const ANALYTICS_EXPENSES: ScopedExpense[] = [
  mock("2025-10-05", "RENT OCT", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2025-10-18", "SHOES", 4200, { online: true, categoryId: "c4" }),
  mock("2025-11-05", "RENT NOV", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2025-11-22", "BIRYANI", 900, { categoryId: "c1", groupId: "g1", paidBy: "p2", splitWith: FLAT }),
  mock("2025-12-05", "RENT DEC", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2025-12-27", "FLIGHTS GOA", 14800, { online: true, categoryId: "c2", groupId: "g2", splitWith: TRIP }),
  mock("2025-12-29", "BEACH SHACK", 3200, { categoryId: "c1", groupId: "g2", paidBy: "p3", splitWith: TRIP }),
  mock("2025-12-30", "SCOOTY RENT", 1600, { categoryId: "c2", groupId: "g2", paidBy: "p3", splitWith: TRIP }),
  mock("2026-01-05", "RENT JAN", 36000, { online: true, categoryId: "c5", groupId: "g1", paidBy: "p2", splitWith: FLAT }),
  mock("2026-02-05", "RENT FEB", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2026-02-14", "GIFT", 2500, { categoryId: "c4" }),
  mock("2026-03-05", "RENT MAR", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2026-04-05", "RENT APR", 36000, { online: true, categoryId: "c5", groupId: "g1", paidBy: "p3", splitWith: FLAT }),
  mock("2026-04-19", "BOOKS", 1100, { online: true }),
  mock("2026-05-05", "RENT MAY", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2026-06-05", "RENT JUN", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2026-06-11", "HEADPHONES", 6500, { online: true, categoryId: "c4" }),
  mock("2026-07-05", "RENT JUL", 36000, { online: true, categoryId: "c5", groupId: "g1", paidBy: "p2", splitWith: FLAT }),
  mock("2026-07-20", "ELECTRICITY", 2400, { online: true, categoryId: "c3", groupId: "g1", splitWith: FLAT }),
  mock("2026-08-05", "RENT AUG", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2026-08-09", "GROCERIES", 1850, { categoryId: "c1", groupId: "g1", paidBy: "p3", splitWith: FLAT }),
  mock("2026-08-23", "METRO CARD", 500, { categoryId: "c2" }),
  mock("2026-09-02", "DINNER", 1400, { online: true, categoryId: "c1" }),
  mock("2026-09-05", "RENT SEP", 36000, { online: true, categoryId: "c5", groupId: "g1", splitWith: FLAT }),
  mock("2026-09-08", "CAB", 320, { categoryId: "c2" }),
  mock("2026-09-12", "WIFI", 1180, { online: true, categoryId: "c3", groupId: "g1", paidBy: "p2", splitWith: FLAT }),
  mock("2026-09-17", "SUPERMARKET", 2300, { categoryId: "c1", groupId: "g1", splitWith: FLAT }),
  mock("2026-09-21", "CHAI", 60, {}),
];

// Runs the real Stats aggregation over the mock expenses, doing the scope
// filtering that fetchExpensesInRange does server-side in the app.
export function mockAnalytics(range: RangeKey, scopeKeys: string[], basis: SpendBasis): AnalyticsData {
  const groupIds = scopeKeys.filter((k) => k !== "personal");
  const scoped = ANALYTICS_EXPENSES.filter((e) => scopeKeys.includes(e.groupId ?? "personal"));
  return computeAnalytics(scoped, {
    range,
    window: rangeWindow(range),
    basis,
    currentUserId: "p1",
    categories: ANALYTICS_CATEGORIES,
    people: ANALYTICS_PEOPLE,
    groupNames: Object.fromEntries(ANALYTICS_GROUPS.map((g) => [g.id, g.name])),
    includePeople: groupIds.length > 0,
  });
}
