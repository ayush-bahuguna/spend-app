import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={[
        "inline-flex h-8 w-8 items-center justify-center",
        "font-mono-receipt text-base font-bold text-ink",
        "hover:opacity-60 active:translate-y-[1px]",
        "disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:opacity-25",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
