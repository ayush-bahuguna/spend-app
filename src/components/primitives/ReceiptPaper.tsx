import type { ReactNode } from "react";

interface ReceiptPaperProps {
  children: ReactNode;
  className?: string;
}

export function ReceiptPaper({ children, className = "" }: ReceiptPaperProps) {
  return (
    <div
      className={`receipt-grain relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-paper pt-[env(safe-area-inset-top)] ${className}`}
    >
      <div className="relative z-[2] flex h-full min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
