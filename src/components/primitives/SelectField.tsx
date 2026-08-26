interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: boolean;
  className?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error = false,
  className = "",
}: SelectFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span
        className={`mb-1 block text-xs font-bold uppercase tracking-wide ${
          error ? "text-red-600" : "text-ink-muted"
        }`}
      >
        {label}
      </span>
      <span
        className={[
          "flex items-center justify-between gap-2 border-0 bg-transparent px-1 py-2",
          error ? "border-b-2 border-red-600" : "border-b-2 border-ink focus-within:border-b-[3px]",
        ].join(" ")}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-transparent font-mono-receipt text-base outline-none ${
            error ? "text-red-600" : "text-ink"
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className={error ? "text-red-600" : "text-ink"}>
          ▼
        </span>
      </span>
    </label>
  );
}
