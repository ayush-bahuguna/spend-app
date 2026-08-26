import { createPortal } from "react-dom";

interface ScopeOption {
  key: string;
  label: string;
}

interface ScopePickerModalProps {
  options: ScopeOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

export function ScopePickerModal({ options, selectedKey, onSelect, onClose }: ScopePickerModalProps) {
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
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className={[
                "flex items-center justify-between border-b border-dashed border-ink-muted px-2 py-3 text-left last:border-b-0",
                "font-mono-receipt text-sm font-bold uppercase tracking-wide",
                opt.key === selectedKey ? "text-ink" : "text-ink-muted",
              ].join(" ")}
            >
              {opt.label}
              {opt.key === selectedKey && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
