import { useState } from "react";
import { AnalyticsSection, AnalyticsSectionEmpty } from "@/components/analytics/AnalyticsSection";
import { formatCurrency } from "@/lib/format";

export interface TimeBucket {
  label: string; // short axis label, e.g. "15" or "SEP"
  detail: string; // full label for the readout, e.g. "15 SEP" or "SEP 2026"
  online: number;
  offline: number;
}

// Daily buckets are too narrow to label each one, so only every Nth is shown.
const DAILY_LABEL_EVERY = 7;

interface SpendOverTimeProps {
  buckets: TimeBucket[];
}

function bucketTotal(bucket: TimeBucket): number {
  return bucket.online + bucket.offline;
}

export function SpendOverTime({ buckets }: SpendOverTimeProps) {
  const peak = Math.max(0, ...buckets.map(bucketTotal));
  const peakIndex = buckets.findIndex((b) => bucketTotal(b) === peak);
  const [selected, setSelected] = useState<number | null>(null);

  // Show the tapped bar, falling back to the busiest one.
  const activeIndex = selected !== null && selected < buckets.length ? selected : peakIndex;
  const active = buckets[activeIndex];
  const sparseLabels = buckets.length > 12;

  // With sparse labels the active bar is always labelled, and nearby regular
  // labels step aside so the two don't collide.
  function showLabel(i: number): boolean {
    if (!sparseLabels || i === activeIndex) return true;
    return i % DAILY_LABEL_EVERY === 0 && Math.abs(i - activeIndex) > 2;
  }

  // A row of zero-height bars reads as broken, so say so plainly instead.
  if (peak === 0) {
    return (
      <AnalyticsSection title="Spend Over Time">
        <AnalyticsSectionEmpty message="Nothing spent" />
      </AnalyticsSection>
    );
  }

  return (
    <AnalyticsSection
      title="Spend Over Time"
      aside={
        <>
          {active.detail} ·{" "}
          <span className="font-bold text-ink">{formatCurrency(Math.round(bucketTotal(active)))}</span>
        </>
      }
    >
      <div className="flex h-32 items-end gap-[2px] border-b-2 border-ink">
        {buckets.map((bucket, i) => {
          const total = bucketTotal(bucket);
          const heightPct = peak > 0 ? (total / peak) * 100 : 0;
          return (
            <button
              key={i}
              type="button"
              aria-label={`${bucket.detail}: ${formatCurrency(Math.round(total))}`}
              onClick={() => setSelected(i)}
              className="flex h-full min-w-0 flex-1 items-end"
            >
              {/* Offline stacked on top of online; everything but the active bar fades back. */}
              <span
                className={[
                  "flex w-full flex-col transition-opacity",
                  i === activeIndex ? "opacity-100" : "opacity-40",
                ].join(" ")}
                // Keep non-zero days visible even when dwarfed by the peak.
                style={{ height: total > 0 ? `max(${heightPct}%, 2px)` : 0 }}
              >
                <span className="w-full bg-offline" style={{ height: `${(bucket.offline / (total || 1)) * 100}%` }} />
                <span className="w-full bg-online" style={{ height: `${(bucket.online / (total || 1)) * 100}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="-mt-1 flex gap-[2px]">
        {buckets.map((bucket, i) => (
          <span
            key={i}
            className={[
              "min-w-0 flex-1 whitespace-nowrap text-center text-[9px] uppercase tracking-wide",
              i === activeIndex ? "font-bold text-ink" : "text-ink-muted",
            ].join(" ")}
          >
            {showLabel(i) ? bucket.label : ""}
          </span>
        ))}
      </div>

      {/* Legend doubling as the active bar's split. */}
      <div className="flex justify-center gap-4 text-[10px] uppercase tracking-wide text-ink-muted">
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="h-2 w-2 bg-online" />
          Online <span className="font-bold text-ink">{formatCurrency(Math.round(active.online))}</span>
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="h-2 w-2 bg-offline" />
          Offline <span className="font-bold text-ink">{formatCurrency(Math.round(active.offline))}</span>
        </span>
      </div>
    </AnalyticsSection>
  );
}
