import type { Category, Expense, MonthSummary, Person, SettlementLine } from "@/data/types";

/**
 * Derives every totals/settlement figure shown on the receipt from the raw
 * expense list, so the printed numbers can never drift out of sync with the
 * line items above them.
 */
export function computeMonthSummary(
  expenses: Expense[],
  currentUserId: string,
  monthKey: string,
  label: string,
): MonthSummary {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const youPaid = expenses
    .filter((e) => e.paidBy === currentUserId)
    .reduce((sum, e) => sum + e.amount, 0);
  const othersPaid = totalExpenses - youPaid;

  const netByPerson = new Map<string, number>();

  for (const expense of expenses) {
    if (expense.paidBy === currentUserId) {
      for (const split of expense.splits) {
        if (split.personId === currentUserId) continue;
        netByPerson.set(split.personId, (netByPerson.get(split.personId) ?? 0) + split.amount);
      }
    } else {
      const yourShare = expense.splits.find((s) => s.personId === currentUserId)?.amount ?? 0;
      if (yourShare > 0) {
        netByPerson.set(expense.paidBy, (netByPerson.get(expense.paidBy) ?? 0) - yourShare);
      }
    }
  }

  const settlements: SettlementLine[] = Array.from(netByPerson.entries())
    .filter(([, amount]) => amount !== 0)
    .map(([personId, amount]) => ({
      personId,
      owesYou: amount > 0,
      amount: Math.abs(amount),
    }));

  const netBalance = settlements.reduce(
    (sum, s) => sum + (s.owesYou ? s.amount : -s.amount),
    0,
  );

  return { monthKey, label, totalExpenses, youPaid, othersPaid, settlements, netBalance };
}

export function personName(people: Person[], id: string): string {
  return people.find((p) => p.id === id)?.name ?? id;
}

export function categoryName(categories: Category[], id?: string): string {
  return categories.find((c) => c.id === id)?.name ?? "UNCATEGORIZED";
}

export function isSplitExpense(expense: Expense): boolean {
  return expense.splits.some((s) => s.personId !== expense.paidBy) || expense.splits.length > 1;
}
