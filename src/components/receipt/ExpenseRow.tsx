import { RECEIPT_GRID_COLS } from "@/components/receipt/receiptGrid";

interface ExpenseRowProps {
  date: string;
  item: string;
  paidBy: string;
  amount: string;
  split?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function ExpenseRow({
  date,
  item,
  paidBy,
  amount,
  split = false,
  active = false,
  onClick,
}: ExpenseRowProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={[
        `grid w-full ${RECEIPT_GRID_COLS} items-start gap-2 py-1.5 text-left text-xs sm:text-sm`,
        onClick ? "cursor-pointer hover:bg-paper-alt/60" : "",
        active ? "bg-paper-alt/60" : "",
      ].join(" ")}
    >
      <span className="whitespace-nowrap text-ink-muted">{date}</span>
      <span className="break-words uppercase text-ink">{item}</span>
      <span className="truncate uppercase text-ink-muted">{paidBy}</span>
      <span className="text-right tabular-nums text-ink">{amount}</span>
      <span className="text-left text-ink">{split ? "*" : ""}</span>
    </div>
  );
}
