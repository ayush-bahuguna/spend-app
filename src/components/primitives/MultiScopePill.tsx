import { useState } from "react";
import { MultiScopePickerModal } from "@/components/primitives/MultiScopePickerModal";

interface ScopeOption {
  key: string;
  label: string;
}

interface MultiScopePillProps {
  options: ScopeOption[];
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
  className?: string;
}

function pillLabel(options: ScopeOption[], selectedKeys: string[]): string {
  if (options.every((opt) => selectedKeys.includes(opt.key))) return "All";
  if (selectedKeys.length === 1) return options.find((opt) => opt.key === selectedKeys[0])?.label ?? "1 Selected";
  return `${selectedKeys.length} Selected`;
}

export function MultiScopePill({ options, selectedKeys, onChange, className = "" }: MultiScopePillProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 font-mono-receipt text-xs font-bold uppercase tracking-wide text-paper ${className}`}
      >
        {pillLabel(options, selectedKeys)}
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <MultiScopePickerModal
          options={options}
          selectedKeys={selectedKeys}
          onApply={(keys) => {
            onChange(keys);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
