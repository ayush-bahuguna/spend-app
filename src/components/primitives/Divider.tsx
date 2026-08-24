interface DividerProps {
  weight?: "thin" | "thick";
  className?: string;
}

export function Divider({ weight = "thick", className = "" }: DividerProps) {
  const cls = weight === "thick" ? "divider-dashed" : "divider-dashed-thin";
  return <div aria-hidden="true" className={`w-full ${cls} ${className}`} />;
}
