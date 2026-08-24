import { ExpenseRow } from "@/components/receipt/ExpenseRow";
import { SplitDetailDivider } from "@/components/receipt/SplitDetailDivider";
import { SplitDetailHeaderRow } from "@/components/receipt/SplitDetailHeaderRow";
import { SplitDetailRow } from "@/components/receipt/SplitDetailRow";
import { personName } from "@/data/selectors";
import type { Expense, Person } from "@/data/types";
import { formatCurrency, formatDateShort } from "@/lib/format";

interface ExpenseListItemProps {
  expense: Expense;
  people: Person[];
  isSplit: boolean;
  expanded: boolean;
  onToggle: () => void;
}

export function ExpenseListItem({ expense, people, isSplit, expanded, onToggle }: ExpenseListItemProps) {
  return (
    <div>
      <ExpenseRow
        date={formatDateShort(expense.date)}
        item={expense.item}
        paidBy={personName(people, expense.paidBy)}
        amount={formatCurrency(expense.amount)}
        split={isSplit}
        active={expanded}
        onClick={isSplit ? onToggle : undefined}
      />
      {isSplit && expanded && (
        <div className="mb-2 bg-paper-alt/40 py-1">
          <SplitDetailDivider />
          <SplitDetailHeaderRow />
          {expense.splits.map((s) => (
            <SplitDetailRow
              key={s.personId}
              name={personName(people, s.personId)}
              amount={formatCurrency(s.amount)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
