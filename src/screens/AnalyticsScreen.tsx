import { CategoryBreakdown, type CategoryRow } from "@/components/analytics/CategoryBreakdown";
import { PersonBreakdown, type PersonRow } from "@/components/analytics/PersonBreakdown";
import { RangeSelector, type RangeKey } from "@/components/analytics/RangeSelector";
import { SpendOverTime, type TimeBucket } from "@/components/analytics/SpendOverTime";
import { TopExpenses, type TopExpenseRow } from "@/components/analytics/TopExpenses";
import { TotalCard, type SpendBasis, type TotalFigures } from "@/components/analytics/TotalCard";
import { Divider } from "@/components/primitives/Divider";
import { EmptyState } from "@/components/primitives/EmptyState";
import { MultiScopePill } from "@/components/primitives/MultiScopePill";

interface ScopeOption {
  key: string;
  label: string;
}

// Everything below the pickers, already computed for the current range,
// scopes and basis — the screen only lays it out.
export interface AnalyticsData {
  totals: { share: TotalFigures; full: TotalFigures };
  comparisonLabel: string;
  overTime: TimeBucket[];
  byCategory: CategoryRow[];
  byPerson?: PersonRow[]; // omitted when no group is selected
  top: TopExpenseRow[];
}

interface AnalyticsScreenProps {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  scopeOptions: ScopeOption[];
  selectedScopes: string[];
  onScopesChange: (keys: string[]) => void;
  basis: SpendBasis;
  onBasisChange: (basis: SpendBasis) => void;
  currentUserId: string;
  data: AnalyticsData | undefined; // undefined while loading
}

export function AnalyticsScreen({
  range,
  onRangeChange,
  scopeOptions,
  selectedScopes,
  onScopesChange,
  basis,
  onBasisChange,
  currentUserId,
  data,
}: AnalyticsScreenProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 bg-paper px-5 pt-6">
        <h2 className="text-center text-lg font-bold uppercase tracking-widest">Analytics</h2>
        <Divider className="my-3" />
        <RangeSelector value={range} onChange={onRangeChange} />
        <div className="flex justify-center pt-2 pb-3">
          <MultiScopePill options={scopeOptions} selectedKeys={selectedScopes} onChange={onScopesChange} />
        </div>
        <Divider />
      </div>

      <div className="px-5 pt-5 pb-8">
        {!data ? (
          <p className="py-10 text-center text-xs uppercase tracking-wide text-ink-muted">Loading…</p>
        ) : data.totals.full.total === 0 ? (
          // Judged on full amounts: a group can have spends where your share
          // is nothing, and those should still show the charts.
          <EmptyState message="Not a rupee spent in this stretch. Very disciplined, or very forgetful." />
        ) : (
          <div className="flex flex-col gap-8">
            <TotalCard
              share={data.totals.share}
              full={data.totals.full}
              basis={basis}
              onBasisChange={onBasisChange}
              comparisonLabel={data.comparisonLabel}
            />
            {/* Keyed on the range so a tapped bar doesn't carry over to a different axis. */}
            <SpendOverTime key={range} buckets={data.overTime} />
            <CategoryBreakdown rows={data.byCategory} />
            {data.byPerson && <PersonBreakdown rows={data.byPerson} currentUserId={currentUserId} />}
            <TopExpenses rows={data.top} />
          </div>
        )}
      </div>
    </div>
  );
}
