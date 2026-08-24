interface LabelValueRowProps {
  label: string;
  value: string;
  bold?: boolean;
  indent?: boolean;
  className?: string;
}

export function LabelValueRow({
  label,
  value,
  bold = false,
  indent = false,
  className = "",
}: LabelValueRowProps) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-1 text-sm ${
        indent ? "pl-4" : ""
      } ${className}`}
    >
      <span className={`uppercase tracking-wide ${bold ? "font-bold" : ""}`}>{label}</span>
      <span className={`tabular-nums ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}
