import { useState } from "react";
import { AnalyticsSection, AnalyticsSectionEmpty } from "@/components/analytics/AnalyticsSection";
import { formatCurrency } from "@/lib/format";

export interface CategoryRow {
  id: string;
  name: string;
  online: number;
  offline: number;
}

interface CategoryBreakdownProps {
  rows: CategoryRow[];
}

export function CategoryBreakdown({ rows }: CategoryBreakdownProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = rows
    .map((row) => ({ ...row, total: row.online + row.offline }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);
  const largest = sorted[0]?.total ?? 0;
  const grandTotal = sorted.reduce((acc, row) => acc + row.total, 0);

  return (
    <AnalyticsSection title="By Category" aside={<Legend />}>
      {sorted.length === 0 ? (
        <AnalyticsSectionEmpty message="Nothing spent" />
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
                    <span className="shrink-0">
                      <span className="mr-2 text-[10px] text-ink-muted">
                        {Math.round((row.total / grandTotal) * 100)}%
                      </span>
                      <span className="font-bold">{formatCurrency(Math.round(row.total))}</span>
                    </span>
                  </div>

                  <div className="flex h-2.5" style={{ width: `${(row.total / largest) * 100}%` }}>
                    <span className="h-full bg-online" style={{ width: `${(row.online / row.total) * 100}%` }} />
                    <span className="h-full bg-offline" style={{ width: `${(row.offline / row.total) * 100}%` }} />
                  </div>
                </button>

                {/* Same lighter fill as a receipt line item's expanded detail. */}
                {isExpanded && (
                  <p className="bg-paper-alt/40 py-1.5 text-[10px] uppercase tracking-wide text-ink-muted">
                    Online {formatCurrency(Math.round(row.online))} · Offline{" "}
                    {formatCurrency(Math.round(row.offline))}
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

function Legend() {
  return (
    <span className="flex items-center gap-3 text-[10px]">
      <span className="flex items-center gap-1">
        <span aria-hidden="true" className="h-2 w-2 bg-online" />
        Online
      </span>
      <span className="flex items-center gap-1">
        <span aria-hidden="true" className="h-2 w-2 bg-offline" />
        Offline
      </span>
    </span>
  );
}
