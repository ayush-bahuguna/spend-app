import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SolidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  rounded?: boolean;
  fullWidth?: boolean;
}

export function SolidButton({
  children,
  className = "",
  rounded = false,
  fullWidth = true,
  ...props
}: SolidButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 border-0",
        fullWidth ? "w-full" : "w-auto",
        rounded ? "rounded-xl" : "rounded-none",
        "bg-ink px-5 py-3.5",
        "font-mono-receipt text-sm font-bold uppercase tracking-wide text-paper",
        "hover:bg-ink/85 active:scale-[0.97]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
