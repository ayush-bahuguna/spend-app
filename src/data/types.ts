export type PersonId = string;

export interface Person {
  id: PersonId;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export type SplitType = "equal" | "custom" | "none";

export interface ExpenseSplit {
  personId: PersonId;
  amount: number;
}

export interface Expense {
  id: string;
  date: string; // ISO date, e.g. '2026-08-02'
  item: string;
  amount: number;
  paidBy: PersonId;
  categoryId?: string;
  splitType: SplitType;
  splits: ExpenseSplit[];
}

export interface SettlementLine {
  personId: PersonId;
  owesYou: boolean;
  amount: number;
}

export interface MonthSummary {
  monthKey: string;
  label: string;
  totalExpenses: number;
  youPaid: number;
  othersPaid: number;
  settlements: SettlementLine[];
  netBalance: number;
}

export interface ArchiveEntry {
  monthKey: string;
  shortLabel: string;
  total: number;
}
