import type { ButtonHTMLAttributes, ReactNode } from "react";

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function OutlineButton({ children, className = "", ...props }: OutlineButtonProps) {
  return (
    <button
      className={[
        "inline-flex w-full items-center justify-center gap-2",
        "border-2 border-ink bg-transparent px-5 py-3",
        "font-mono-receipt text-sm font-bold uppercase tracking-wide text-ink",
        "hover:bg-ink hover:text-paper",
        "active:translate-x-[1px] active:translate-y-[1px]",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
