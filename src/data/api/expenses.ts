import { supabase } from "@/lib/supabaseClient";
import type { Expense, ExpenseSplit, ScopedExpense, SplitType } from "@/data/types";

export type Scope = { type: "personal" } | { type: "group"; groupId: string; groupName: string };

interface ExpenseRow {
  id: string;
  date: string;
  item: string;
  amount: number;
  is_online: boolean | null;
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
    isOnline: row.is_online ?? false,
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
    .select("id, date, item, amount, is_online, paid_by, category_id, split_type, splits")
    .gte("date", start)
    .lt("date", end);

  query = scope.type === "personal" ? query.is("group_id", null) : query.eq("group_id", scope.groupId);

  const { data, error } = await query.order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToExpense);
}

export interface MultiScope {
  personal: boolean;
  groupIds: string[];
}

// Expenses dated in [start, end) across personal and/or several groups at once.
export async function fetchExpensesInRange(
  scopes: MultiScope,
  start: string,
  end: string,
): Promise<ScopedExpense[]> {
  if (!scopes.personal && scopes.groupIds.length === 0) return [];

  let query = supabase
    .from("expenses")
    .select("id, date, item, amount, is_online, paid_by, category_id, split_type, splits, group_id")
    .gte("date", start)
    .lt("date", end);

  const inGroups = `group_id.in.(${scopes.groupIds.join(",")})`;
  if (scopes.personal && scopes.groupIds.length > 0) query = query.or(`group_id.is.null,${inGroups}`);
  else if (scopes.personal) query = query.is("group_id", null);
  else query = query.in("group_id", scopes.groupIds);

  const { data, error } = await query.order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: ExpenseRow & { group_id: string | null }) => ({
    ...rowToExpense(row),
    groupId: row.group_id,
  }));
}

export async function addExpense(scope: Scope, expense: Expense): Promise<void> {
  const { error } = await supabase.from("expenses").insert({
    date: expense.date,
    item: expense.item,
    amount: expense.amount,
    is_online: expense.isOnline,
    paid_by: expense.paidBy,
    category_id: expense.categoryId ?? null,
    split_type: expense.splitType,
    splits: expense.splits,
    group_id: scope.type === "group" ? scope.groupId : null,
  });
  if (error) throw error;
}

export async function updateExpense(expense: Expense): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .update({
      date: expense.date,
      item: expense.item,
      amount: expense.amount,
      is_online: expense.isOnline,
      paid_by: expense.paidBy,
      category_id: expense.categoryId ?? null,
      split_type: expense.splitType,
      splits: expense.splits,
    })
    .eq("id", expense.id);
  if (error) throw error;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
