import { useState } from "react";
import { Divider } from "@/components/primitives/Divider";
import { ScopePickerModal } from "@/components/primitives/ScopePickerModal";
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
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 bg-paper px-5 pt-6">
        <h2 className="text-center text-lg font-bold uppercase tracking-widest">History</h2>
        <Divider className="my-3" />
        <div className="flex justify-center pb-3">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 font-mono-receipt text-xs font-bold uppercase tracking-wide text-paper"
          >
            {scopeLabel}
            <span aria-hidden="true">▾</span>
          </button>
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

      {pickerOpen && (
        <ScopePickerModal
          options={scopeOptions}
          selectedKey={selectedScopeKey}
          onSelect={(key) => {
            onSelectScope(key);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
