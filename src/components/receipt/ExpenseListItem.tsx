import { ExpenseRow } from "@/components/receipt/ExpenseRow";
import { NoteSection } from "@/components/receipt/NoteSection";
import { SplitDetailDivider } from "@/components/receipt/SplitDetailDivider";
import { SplitDetailHeaderRow } from "@/components/receipt/SplitDetailHeaderRow";
import { SplitDetailRow } from "@/components/receipt/SplitDetailRow";
import { categoryName, personName } from "@/data/selectors";
import type { Category, Expense, Person } from "@/data/types";
import { formatCurrency, formatDateShort } from "@/lib/format";

interface ExpenseListItemProps {
  expense: Expense;
  people: Person[];
  categories: Category[];
  isSplit: boolean;
  expanded: boolean;
  onToggle: () => void;
}

export function ExpenseListItem({
  expense,
  people,
  categories,
  isSplit,
  expanded,
  onToggle,
}: ExpenseListItemProps) {
  return (
    <div>
      <ExpenseRow
        date={formatDateShort(expense.date)}
        item={categoryName(categories, expense.categoryId)}
        paidBy={personName(people, expense.paidBy)}
        amount={formatCurrency(expense.amount)}
        split={isSplit}
        active={expanded}
        onClick={onToggle}
      />
      {expanded && (
        <div className="mb-2 flex flex-col gap-2 bg-paper-alt/40 pt-2 pb-1">
          <NoteSection note={expense.item} />
          {isSplit && (
            <div className="flex flex-col">
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
      )}
    </div>
  );
}
