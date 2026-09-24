import { useState } from "react";
import { createPortal } from "react-dom";
import { Divider } from "@/components/primitives/Divider";
import { SolidButton } from "@/components/primitives/SolidButton";

interface ScopeOption {
  key: string;
  label: string;
}

interface MultiScopePickerModalProps {
  options: ScopeOption[];
  selectedKeys: string[];
  onApply: (keys: string[]) => void;
  onClose: () => void;
}

// Edits a draft and only reports it on APPLY, so ticking several scopes
// triggers one refetch rather than one per tap. Tapping outside discards.
export function MultiScopePickerModal({ options, selectedKeys, onApply, onClose }: MultiScopePickerModalProps) {
  const [draft, setDraft] = useState<string[]>(selectedKeys);
  const allSelected = options.every((opt) => draft.includes(opt.key));

  function toggle(key: string) {
    setDraft((prev) => {
      if (!prev.includes(key)) return options.map((o) => o.key).filter((k) => k === key || prev.includes(k));
      // Keep at least one scope selected — an empty selection has nothing to show.
      return prev.length === 1 ? prev : prev.filter((k) => k !== key);
    });
  }

  function toggleAll() {
    if (!allSelected) setDraft(options.map((o) => o.key));
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-8"
      onClick={onClose}
    >
      <div
        className="receipt-grain w-full max-w-[23.75rem] rounded-xl bg-paper px-5 py-4 sm:max-w-[26.875rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-[2] flex flex-col">
          <CheckRow label="All" checked={allSelected} onToggle={toggleAll} bordered={false} />
          <Divider />
          {options.map((opt) => (
            <CheckRow
              key={opt.key}
              label={opt.label}
              checked={draft.includes(opt.key)}
              onToggle={() => toggle(opt.key)}
            />
          ))}
          <SolidButton rounded className="mt-4" onClick={() => onApply(draft)}>
            Apply
          </SolidButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface CheckRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  bordered?: boolean;
}

function CheckRow({ label, checked, onToggle, bordered = true }: CheckRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={[
        "flex items-center justify-between px-2 py-3 text-left",
        bordered ? "border-b border-dashed border-ink-muted" : "",
        "font-mono-receipt text-sm font-bold uppercase tracking-wide",
        checked ? "text-ink" : "text-ink-muted",
      ].join(" ")}
    >
      {label}
      <span
        aria-hidden="true"
        className={[
          "flex h-5 w-5 items-center justify-center border-2 border-ink text-xs leading-none",
          checked ? "bg-ink text-paper" : "bg-transparent",
        ].join(" ")}
      >
        {checked ? "✓" : ""}
      </span>
    </button>
  );
}
