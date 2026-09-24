import { useState } from "react";
import { AnalyticsSection, AnalyticsSectionEmpty } from "@/components/analytics/AnalyticsSection";
import { formatCurrency } from "@/lib/format";

export interface PersonRow {
  id: string;
  name: string;
  paid: number; // what they put down for group expenses
  share: number; // what those expenses cost them, per the splits
}

interface PersonBreakdownProps {
  rows: PersonRow[];
  currentUserId: string;
}

export function PersonBreakdown({ rows, currentUserId }: PersonBreakdownProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = rows.filter((row) => row.paid > 0 || row.share > 0).sort((a, b) => b.paid - a.paid);
  // Paid and share bars share one scale so they can be compared directly.
  const largest = Math.max(0, ...sorted.flatMap((row) => [row.paid, row.share]));

  return (
    <AnalyticsSection title="By Person" aside={<Legend />}>
      {sorted.length === 0 ? (
        <AnalyticsSectionEmpty message="No group spends" />
      ) : (
        <div className="flex flex-col gap-1">
          {sorted.map((row) => {
            const isExpanded = row.id === expandedId;
            return (
              <div key={row.id}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedId(isExpanded ? null : row.id)}
                  // Same selected/hover fill as a receipt line item (ExpenseRow).
                  className={[
                    "flex w-full flex-col gap-1.5 py-1.5 text-left hover:bg-paper-alt/60",
                    isExpanded ? "bg-paper-alt/60" : "",
                  ].join(" ")}
                >
                  <div className="flex w-full items-baseline justify-between gap-3 text-xs uppercase tracking-wide">
                    <span className="truncate font-bold">{row.name}</span>
                    <span className="shrink-0 text-[10px] text-ink-muted">
                      Paid <span className="font-bold text-ink">{formatCurrency(Math.round(row.paid))}</span>
                      {" · "}
                      Share <span className="font-bold text-ink">{formatCurrency(Math.round(row.share))}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-[3px]">
                    <span className="h-1.5 bg-ink" style={{ width: `${(row.paid / largest) * 100}%` }} />
                    <span className="h-1.5 bg-ink-muted/35" style={{ width: `${(row.share / largest) * 100}%` }} />
                  </div>
                </button>

                {/* Same lighter fill as a receipt line item's expanded detail. */}
                {isExpanded && (
                  <p className="bg-paper-alt/40 py-1.5 text-[10px] uppercase tracking-wide text-ink-muted">
                    {netText(row, row.id === currentUserId)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AnalyticsSection>
  );
}

function netText(row: PersonRow, isYou: boolean): string {
  const net = Math.round(row.paid - row.share);
  if (net === 0) return isYou ? "You're all square" : "All square";
  const amount = formatCurrency(Math.abs(net));
  if (net > 0) return isYou ? `You're owed ${amount}` : `Is owed ${amount}`;
  return isYou ? `You owe ${amount}` : `Owes ${amount}`;
}

function Legend() {
  return (
    <span className="flex items-center gap-3 text-[10px]">
      <span className="flex items-center gap-1">
        <span aria-hidden="true" className="h-2 w-2 bg-ink" />
        Paid
      </span>
      <span className="flex items-center gap-1">
        <span aria-hidden="true" className="h-2 w-2 bg-ink-muted/35" />
        Share
      </span>
    </span>
  );
}
