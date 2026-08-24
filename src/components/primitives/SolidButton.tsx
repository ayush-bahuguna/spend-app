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
        "inline-flex items-center justify-center gap-2",
        fullWidth ? "w-full" : "w-auto",
        "bg-ink px-5 py-3.5",
        "font-mono-receipt text-sm font-bold uppercase tracking-wide text-paper",
        "hover:bg-ink/85",
        "disabled:cursor-not-allowed disabled:opacity-40",
        rounded
          ? "rounded-xl border-0 active:scale-[0.97]"
          : [
              "border-2 border-ink shadow-pixel-sm",
              "active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-pressed",
              "disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0",
            ].join(" "),
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
