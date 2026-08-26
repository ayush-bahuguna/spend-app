import { useState } from "react";
import { ScopePickerModal } from "@/components/primitives/ScopePickerModal";

interface ScopeOption {
  key: string;
  label: string;
}

interface ScopePillProps {
  label: string;
  options: ScopeOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function ScopePill({ label, options, selectedKey, onSelect, className = "" }: ScopePillProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 font-mono-receipt text-xs font-bold uppercase tracking-wide text-paper ${className}`}
      >
        {label}
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <ScopePickerModal
          options={options}
          selectedKey={selectedKey}
          onSelect={(key) => {
            onSelect(key);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
