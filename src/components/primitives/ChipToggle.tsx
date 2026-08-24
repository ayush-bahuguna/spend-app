interface ChipToggleProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function ChipToggle({ label, selected, onToggle }: ChipToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={[
        "inline-flex items-center gap-1 border-2 border-ink px-3 py-1.5",
        "font-mono-receipt text-xs font-bold uppercase tracking-wide",
        selected ? "bg-ink text-paper" : "bg-transparent text-ink hover:bg-paper-alt",
      ].join(" ")}
    >
      {label}
      {selected && <span aria-hidden="true">✓</span>}
    </button>
  );
}
