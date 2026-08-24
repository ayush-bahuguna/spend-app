interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function SelectField({ label, value, onChange, options, className = "" }: SelectFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <span className="flex items-center justify-between gap-2 border-0 border-b-2 border-ink bg-transparent px-1 py-2 focus-within:border-b-[3px]">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent font-mono-receipt text-base text-ink outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="text-ink">
          ▼
        </span>
      </span>
    </label>
  );
}
