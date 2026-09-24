import { AnalyticsSection, AnalyticsSectionEmpty } from "@/components/analytics/AnalyticsSection";
import { formatCurrency, formatDateShort } from "@/lib/format";

export interface TopExpenseRow {
  id: string;
  date: string; // ISO
  item: string;
  scope: string; // "PERSONAL" or the group's name
  isOnline: boolean;
  amount: number; // on the current basis (your share, or the full amount)
  fullAmount: number;
}

const TOP_COUNT = 5;

// # / DATE / ITEM / AMOUNT — narrower cousin of the receipt's RECEIPT_GRID_COLS.
const TOP_GRID_COLS = "grid-cols-[1.25rem_3.4rem_1fr_auto] sm:grid-cols-[1.25rem_3.8rem_1fr_auto]";

interface TopExpensesProps {
  rows: TopExpenseRow[];
}

export function TopExpenses({ rows }: TopExpensesProps) {
  const top = rows
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, TOP_COUNT);

  return (
    <AnalyticsSection title={`Top ${TOP_COUNT} Expenses`}>
      {top.length === 0 ? (
        <AnalyticsSectionEmpty message="Nothing spent" />
      ) : (
        <ol className="flex flex-col">
          {top.map((row, i) => (
            <li
              key={row.id}
              className={`grid ${TOP_GRID_COLS} items-start gap-2 border-b border-dashed border-ink-muted/50 py-1.5 text-xs last:border-b-0 sm:text-sm`}
            >
              <span className="font-bold text-ink-muted">{i + 1}.</span>
              <span className="whitespace-nowrap text-ink-muted">{formatDateShort(row.date)}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="break-words uppercase">{row.item}</span>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-ink-muted">
                  <span
                    aria-label={row.isOnline ? "Online" : "Offline"}
                    className={`h-1.5 w-1.5 shrink-0 ${row.isOnline ? "bg-online" : "bg-offline"}`}
                  />
                  <span className="truncate">{row.scope}</span>
                </span>
              </span>
              <span className="flex flex-col items-end gap-0.5 text-right tabular-nums">
                <span className="font-bold">{formatCurrency(Math.round(row.amount))}</span>
                {/* On the share basis, show what the whole bill was. */}
                {Math.round(row.fullAmount) !== Math.round(row.amount) && (
                  <span className="text-[10px] uppercase tracking-wide text-ink-muted">
                    of {formatCurrency(Math.round(row.fullAmount))}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </AnalyticsSection>
  );
}
