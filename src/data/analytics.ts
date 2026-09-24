import type { CategoryRow } from "@/components/analytics/CategoryBreakdown";
import type { PersonRow } from "@/components/analytics/PersonBreakdown";
import type { RangeKey } from "@/components/analytics/RangeSelector";
import type { TimeBucket } from "@/components/analytics/SpendOverTime";
import type { TopExpenseRow } from "@/components/analytics/TopExpenses";
import type { SpendBasis, TotalFigures } from "@/components/analytics/TotalCard";
import { categoryName, personName } from "@/data/selectors";
import type { Category, Person, ScopedExpense } from "@/data/types";

/**
 * Pure aggregation behind the Stats screen: turns the raw expenses fetched
 * for a range (plus its comparison period) into every figure the screen
 * shows, so the total, charts and lists can't disagree with each other.
 */

// Everything below the pickers, already computed for the current range,
// scopes and basis — the screen only lays it out.
export interface AnalyticsData {
  totals: { share: TotalFigures; full: TotalFigures };
  comparisonLabel: string;
  overTime: TimeBucket[];
  byCategory: CategoryRow[];
  byPerson?: PersonRow[]; // omitted when no group is selected
  top: TopExpenseRow[];
}

export interface RangeWindow {
  start: string; // ISO date, inclusive
  end: string; // ISO date, exclusive
  prevStart: string; // comparison period, same conventions
  prevEnd: string;
  daily: boolean; // single-month ranges chart by day, longer ones by month
  monthKeys: string[]; // 'YYYY-MM' for each month in the range, oldest first
}

// [first, last] month offsets from the current month, inclusive.
const RANGE_MONTHS: Record<RangeKey, [number, number]> = {
  "this-month": [0, 0],
  "last-month": [-1, -1],
  "3m": [-2, 0],
  "6m": [-5, 0],
  "12m": [-11, 0],
};

const COMPARISON_LABELS: Record<RangeKey, string> = {
  "this-month": "vs same days last month",
  "last-month": "vs month before",
  "3m": "vs prev 3 months",
  "6m": "vs prev 6 months",
  "12m": "vs prev 12 months",
};

const MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const UNCATEGORIZED = "UNCATEGORIZED";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthKeyOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function monthStartFrom(today: Date, delta: number): Date {
  return new Date(today.getFullYear(), today.getMonth() + delta, 1);
}

// Same day-of-month `delta` months away, clamped to that month's length
// (31 Mar - 1 month = 28/29 Feb).
function shiftMonthsClamped(d: Date, delta: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + delta, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay));
}

export function rangeWindow(range: RangeKey, today: Date = new Date()): RangeWindow {
  const [first, last] = RANGE_MONTHS[range];
  const length = last - first + 1;

  // A range that runs up to today is only partly over, so it's compared with
  // the same stretch of days one period earlier (1–24 Sep vs 1–24 Aug) rather
  // than with a whole, finished period.
  const prevEnd =
    last === 0
      ? (() => {
          const d = shiftMonthsClamped(today, -length);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        })()
      : monthStartFrom(today, last + 1 - length);

  return {
    start: isoDate(monthStartFrom(today, first)),
    end: isoDate(monthStartFrom(today, last + 1)),
    prevStart: isoDate(monthStartFrom(today, first - length)),
    prevEnd: isoDate(prevEnd),
    daily: length === 1,
    monthKeys: Array.from({ length }, (_, i) => monthKeyOf(monthStartFrom(today, first + i))),
  };
}

export interface AnalyticsContext {
  range: RangeKey;
  window: RangeWindow;
  basis: SpendBasis;
  currentUserId: string;
  categories: Category[];
  people: Person[];
  groupNames: Record<string, string>;
  includePeople: boolean; // false when no group is selected
}

export function computeAnalytics(expenses: ScopedExpense[], ctx: AnalyticsContext): AnalyticsData {
  const { window, basis, currentUserId } = ctx;
  const current = expenses.filter((e) => e.date >= window.start && e.date < window.end);
  const previous = expenses.filter((e) => e.date >= window.prevStart && e.date < window.prevEnd);

  // Your share of an expense: all of a personal one, your split of a group one.
  const myShare = (e: ScopedExpense) =>
    e.groupId === null ? e.amount : (e.splits.find((s) => s.personId === currentUserId)?.amount ?? 0);
  const amountOf = basis === "share" ? myShare : (e: ScopedExpense) => e.amount;

  return {
    totals: {
      share: totalFigures(current, previous, myShare),
      full: totalFigures(current, previous, (e) => e.amount),
    },
    comparisonLabel: COMPARISON_LABELS[ctx.range],
    overTime: overTime(current, window, amountOf),
    byCategory: byCategory(current, ctx.categories, amountOf),
    byPerson: ctx.includePeople ? byPerson(current, ctx.people) : undefined,
    top: current.map((e) => ({
      id: e.id,
      date: e.date,
      item: e.item,
      scope: e.groupId === null ? "PERSONAL" : (ctx.groupNames[e.groupId] ?? "GROUP"),
      isOnline: e.isOnline,
      amount: amountOf(e),
      fullAmount: e.amount,
    })),
  };
}

function totalFigures(
  current: ScopedExpense[],
  previous: ScopedExpense[],
  amountOf: (e: ScopedExpense) => number,
): TotalFigures {
  const sum = (list: ScopedExpense[]) => list.reduce((acc, e) => acc + amountOf(e), 0);
  return {
    total: sum(current),
    prevTotal: sum(previous),
    online: sum(current.filter((e) => e.isOnline)),
  };
}

function splitOnline(
  list: ScopedExpense[],
  amountOf: (e: ScopedExpense) => number,
): { online: number; offline: number } {
  let online = 0;
  let offline = 0;
  for (const e of list) {
    if (e.isOnline) online += amountOf(e);
    else offline += amountOf(e);
  }
  return { online, offline };
}

function overTime(
  current: ScopedExpense[],
  window: RangeWindow,
  amountOf: (e: ScopedExpense) => number,
): TimeBucket[] {
  if (window.daily) {
    const monthKey = window.monthKeys[0];
    const [year, month] = monthKey.split("-").map(Number);
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => ({
      label: String(i + 1),
      detail: `${i + 1} ${MONTH_SHORT[month - 1]}`,
      ...splitOnline(
        current.filter((e) => e.date === `${monthKey}-${pad(i + 1)}`),
        amountOf,
      ),
    }));
  }

  return window.monthKeys.map((monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);
    return {
      label: MONTH_SHORT[month - 1],
      detail: `${MONTH_SHORT[month - 1]} ${year}`,
      ...splitOnline(
        current.filter((e) => e.date.startsWith(monthKey)),
        amountOf,
      ),
    };
  });
}

// Grouped by resolved name rather than id: an expense whose category was
// since deleted resolves to UNCATEGORIZED, and should merge with the
// expenses that never had one.
function byCategory(
  current: ScopedExpense[],
  categories: Category[],
  amountOf: (e: ScopedExpense) => number,
): CategoryRow[] {
  const rows = new Map<string, CategoryRow>();
  for (const e of current) {
    const name = e.categoryId ? categoryName(categories, e.categoryId) : UNCATEGORIZED;
    const row = rows.get(name) ?? { id: name, name, online: 0, offline: 0 };
    if (e.isOnline) row.online += amountOf(e);
    else row.offline += amountOf(e);
    rows.set(name, row);
  }
  return Array.from(rows.values());
}

// Group expenses only: personal spends are always paid and owned by you, so
// they'd just inflate your row without saying anything about who owes whom.
function byPerson(current: ScopedExpense[], people: Person[]): PersonRow[] {
  const rows = new Map<string, PersonRow>();
  const rowFor = (id: string) => {
    const row = rows.get(id) ?? { id, name: personName(people, id), paid: 0, share: 0 };
    rows.set(id, row);
    return row;
  };
  for (const e of current) {
    if (e.groupId === null) continue;
    rowFor(e.paidBy).paid += e.amount;
    for (const s of e.splits) rowFor(s.personId).share += s.amount;
  }
  return Array.from(rows.values());
}
