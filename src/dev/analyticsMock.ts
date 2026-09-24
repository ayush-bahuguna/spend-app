import type { CategoryRow } from "@/components/analytics/CategoryBreakdown";
import type { PersonRow } from "@/components/analytics/PersonBreakdown";
import type { RangeKey } from "@/components/analytics/RangeSelector";
import type { TimeBucket } from "@/components/analytics/SpendOverTime";
import type { TopExpenseRow } from "@/components/analytics/TopExpenses";
import type { SpendBasis, TotalFigures } from "@/components/analytics/TotalCard";
import type { Category, Expense, Person } from "@/data/types";

// Mock data for the kitchen ANALYTICS tab: about a year of mixed
// personal/group spends, so every analytics component has realistic input.

export type AnalyticsMockExpense = Expense & { groupId: string | null };

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
): AnalyticsMockExpense {
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

export const ANALYTICS_EXPENSES: AnalyticsMockExpense[] = [
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

// Quick, dev-only stand-in for the real aggregation (which lands with the app
// wiring): enough to drive the kitchen components from the pickers above.

const MOCK_USER_ID = "p1";

// [first, last] month offsets from the current month, inclusive.
const RANGE_MONTHS: Record<RangeKey, [number, number]> = {
  "this-month": [0, 0],
  "last-month": [-1, -1],
  "3m": [-2, 0],
  "6m": [-5, 0],
  "12m": [-11, 0],
};

export const COMPARISON_LABELS: Record<RangeKey, string> = {
  "this-month": "vs last month",
  "last-month": "vs month before",
  "3m": "vs prev 3 months",
  "6m": "vs prev 6 months",
  "12m": "vs prev 12 months",
};

function monthKeyFromNow(delta: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function inMonths(e: AnalyticsMockExpense, first: number, last: number): boolean {
  const key = e.date.slice(0, 7);
  return key >= monthKeyFromNow(first) && key <= monthKeyFromNow(last);
}

function inScopes(e: AnalyticsMockExpense, scopeKeys: string[]): boolean {
  return scopeKeys.includes(e.groupId ?? "personal");
}

function myShare(e: AnalyticsMockExpense): number {
  if (e.groupId === null) return e.amount;
  return e.splits.find((s) => s.personId === MOCK_USER_ID)?.amount ?? 0;
}

function figures(
  current: AnalyticsMockExpense[],
  previous: AnalyticsMockExpense[],
  amountOf: (e: AnalyticsMockExpense) => number,
): TotalFigures {
  const sum = (list: AnalyticsMockExpense[]) => list.reduce((acc, e) => acc + amountOf(e), 0);
  return {
    total: sum(current),
    prevTotal: sum(previous),
    online: sum(current.filter((e) => e.isOnline)),
  };
}

export function mockTotals(range: RangeKey, scopeKeys: string[]): { share: TotalFigures; full: TotalFigures } {
  const [first, last] = RANGE_MONTHS[range];
  const length = last - first + 1;
  const scoped = ANALYTICS_EXPENSES.filter((e) => inScopes(e, scopeKeys));
  const current = scoped.filter((e) => inMonths(e, first, last));
  const previous = scoped.filter((e) => inMonths(e, first - length, last - length));
  return {
    share: figures(current, previous, myShare),
    full: figures(current, previous, (e) => e.amount),
  };
}

const MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Daily buckets for single-month ranges, monthly buckets otherwise.
export function mockOverTime(range: RangeKey, scopeKeys: string[], basis: SpendBasis): TimeBucket[] {
  const [first, last] = RANGE_MONTHS[range];
  const amountOf = basis === "share" ? myShare : (e: AnalyticsMockExpense) => e.amount;
  const scoped = ANALYTICS_EXPENSES.filter((e) => inScopes(e, scopeKeys) && inMonths(e, first, last));

  function split(list: AnalyticsMockExpense[]): { online: number; offline: number } {
    let online = 0;
    let offline = 0;
    for (const e of list) {
      if (e.isOnline) online += amountOf(e);
      else offline += amountOf(e);
    }
    return { online, offline };
  }

  if (first === last) {
    const monthKey = monthKeyFromNow(first);
    const [year, month] = monthKey.split("-").map(Number);
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return {
        label: String(i + 1),
        detail: `${i + 1} ${MONTH_SHORT[month - 1]}`,
        ...split(scoped.filter((e) => e.date === `${monthKey}-${day}`)),
      };
    });
  }

  return Array.from({ length: last - first + 1 }, (_, i) => {
    const monthKey = monthKeyFromNow(first + i);
    const [year, month] = monthKey.split("-").map(Number);
    return {
      label: MONTH_SHORT[month - 1],
      detail: `${MONTH_SHORT[month - 1]} ${year}`,
      ...split(scoped.filter((e) => e.date.startsWith(monthKey))),
    };
  });
}

export function mockByCategory(range: RangeKey, scopeKeys: string[], basis: SpendBasis): CategoryRow[] {
  const [first, last] = RANGE_MONTHS[range];
  const amountOf = basis === "share" ? myShare : (e: AnalyticsMockExpense) => e.amount;
  const scoped = ANALYTICS_EXPENSES.filter((e) => inScopes(e, scopeKeys) && inMonths(e, first, last));

  const byId = new Map<string, CategoryRow>();
  for (const e of scoped) {
    const id = e.categoryId ?? "uncategorized";
    const row = byId.get(id) ?? {
      id,
      name: ANALYTICS_CATEGORIES.find((c) => c.id === id)?.name ?? "UNCATEGORIZED",
      online: 0,
      offline: 0,
    };
    if (e.isOnline) row.online += amountOf(e);
    else row.offline += amountOf(e);
    byId.set(id, row);
  }
  return Array.from(byId.values());
}

// Group expenses only: personal spends are always paid and owned by you, so
// they'd just inflate your row without saying anything about who owes whom.
export function mockByPerson(range: RangeKey, scopeKeys: string[]): PersonRow[] {
  const [first, last] = RANGE_MONTHS[range];
  const scoped = ANALYTICS_EXPENSES.filter(
    (e) => e.groupId !== null && inScopes(e, scopeKeys) && inMonths(e, first, last),
  );

  const byId = new Map<string, PersonRow>(
    ANALYTICS_PEOPLE.map((p) => [p.id, { id: p.id, name: p.name, paid: 0, share: 0 }]),
  );
  for (const e of scoped) {
    const payer = byId.get(e.paidBy);
    if (payer) payer.paid += e.amount;
    for (const s of e.splits) {
      const person = byId.get(s.personId);
      if (person) person.share += s.amount;
    }
  }
  return Array.from(byId.values());
}

export function mockTopExpenses(range: RangeKey, scopeKeys: string[], basis: SpendBasis): TopExpenseRow[] {
  const [first, last] = RANGE_MONTHS[range];
  return ANALYTICS_EXPENSES.filter((e) => inScopes(e, scopeKeys) && inMonths(e, first, last)).map((e) => ({
    id: e.id,
    date: e.date,
    item: e.item,
    scope: e.groupId === null ? "PERSONAL" : (ANALYTICS_GROUPS.find((g) => g.id === e.groupId)?.name ?? ""),
    isOnline: e.isOnline,
    amount: basis === "share" ? myShare(e) : e.amount,
    fullAmount: e.amount,
  }));
}
