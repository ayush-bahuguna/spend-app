import { Divider } from "@/components/primitives/Divider";
import { ScopePill } from "@/components/primitives/ScopePill";
import { TicketStub } from "@/components/receipt/TicketStub";
import type { ArchiveEntry } from "@/data/types";
import { formatCurrency } from "@/lib/format";

interface ScopeOption {
  key: string;
  label: string;
}

interface MonthArchiveScreenProps {
  entries: ArchiveEntry[];
  currentMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  scopeLabel: string;
  scopeOptions: ScopeOption[];
  selectedScopeKey: string;
  onSelectScope: (key: string) => void;
}

export function MonthArchiveScreen({
  entries,
  currentMonthKey,
  onSelectMonth,
  scopeLabel,
  scopeOptions,
  selectedScopeKey,
  onSelectScope,
}: MonthArchiveScreenProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 bg-paper px-5 pt-6">
        <h2 className="text-center text-lg font-bold uppercase tracking-widest">History</h2>
        <Divider className="my-3" />
        <div className="flex justify-center pb-3">
          <ScopePill
            label={scopeLabel}
            options={scopeOptions}
            selectedKey={selectedScopeKey}
            onSelect={onSelectScope}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-5 pb-24">
        {entries.map((entry) => (
          <TicketStub
            key={entry.monthKey}
            label={entry.shortLabel}
            amount={formatCurrency(entry.total)}
            selected={entry.monthKey === currentMonthKey}
            onClick={() => onSelectMonth(entry.monthKey)}
          />
        ))}
      </div>
    </div>
  );
}
