import type { ButtonHTMLAttributes, ReactNode } from "react";

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function RetroButton({ children, className = "", ...props }: RetroButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2",
        "border-2 border-ink bg-paper-alt px-5 py-3",
        "font-mono-receipt text-sm font-bold uppercase tracking-wide text-ink",
        "shadow-pixel-sm",
        "hover:bg-paper",
        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-pressed",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
        "disabled:active:translate-x-0 disabled:active:translate-y-0",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
