import { supabase } from "@/lib/supabaseClient";
import type { ArchiveEntry, Expense, ExpenseSplit, SplitType } from "@/data/types";
import { formatMonthShortLabel } from "@/lib/format";

export type Scope = { type: "personal" } | { type: "group"; groupId: string; groupName: string };

interface ExpenseRow {
  id: string;
  date: string;
  item: string;
  amount: number;
  paid_by: string;
  category_id: string | null;
  split_type: SplitType;
  splits: ExpenseSplit[];
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    date: row.date,
    item: row.item,
    amount: Number(row.amount),
    paidBy: row.paid_by,
    categoryId: row.category_id ?? undefined,
    splitType: row.split_type,
    splits: row.splits,
  };
}

function monthRange(monthKey: string): { start: string; end: string } {
  const [year, month] = monthKey.split("-").map(Number);
  const start = `${monthKey}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, end };
}

export async function fetchExpensesForMonth(scope: Scope, monthKey: string): Promise<Expense[]> {
  const { start, end } = monthRange(monthKey);
  let query = supabase
    .from("expenses")
    .select("id, date, item, amount, paid_by, category_id, split_type, splits")
    .gte("date", start)
    .lt("date", end);

  query = scope.type === "personal" ? query.is("group_id", null) : query.eq("group_id", scope.groupId);

  const { data, error } = await query.order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToExpense);
}

export async function fetchMonthlyTotals(scope: Scope): Promise<ArchiveEntry[]> {
  let query = supabase.from("expenses").select("date, amount");
  query = scope.type === "personal" ? query.is("group_id", null) : query.eq("group_id", scope.groupId);

  const { data, error } = await query;
  if (error) throw error;

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const monthKey = String(row.date).slice(0, 7);
    totals.set(monthKey, (totals.get(monthKey) ?? 0) + Number(row.amount));
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, total]) => ({ monthKey, shortLabel: formatMonthShortLabel(monthKey), total }));
}

export async function addExpense(scope: Scope, expense: Expense): Promise<void> {
  const { error } = await supabase.from("expenses").insert({
    date: expense.date,
    item: expense.item,
    amount: expense.amount,
    paid_by: expense.paidBy,
    category_id: expense.categoryId ?? null,
    split_type: expense.splitType,
    splits: expense.splits,
    group_id: scope.type === "group" ? scope.groupId : null,
  });
  if (error) throw error;
}
