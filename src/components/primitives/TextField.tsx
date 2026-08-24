interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  error?: string;
  type?: string;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  error,
  type = "text",
  className = "",
}: TextFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span
        className={`mb-1 block text-xs font-bold uppercase tracking-wide ${
          error ? "text-ink" : "text-ink-muted"
        }`}
      >
        {label}
      </span>
      <span
        className={[
          "flex items-center gap-2 border-0 bg-transparent px-1 py-2",
          error
            ? "border-b-4 border-double border-ink"
            : "border-b-2 border-ink focus-within:border-b-[3px]",
        ].join(" ")}
      >
        {prefix && <span className="font-bold text-ink">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent font-mono-receipt text-base text-ink outline-none placeholder:text-ink-muted/60"
        />
      </span>
      {error && <span className="mt-1 block text-xs font-bold text-ink">{error}</span>}
    </label>
  );
}
