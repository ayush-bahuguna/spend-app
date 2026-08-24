import { RECEIPT_GRID_COLS } from "@/components/receipt/receiptGrid";

interface SplitDetailRowProps {
  name: string;
  amount: string;
}

export function SplitDetailRow({ name, amount }: SplitDetailRowProps) {
  return (
    <div className={`grid w-full ${RECEIPT_GRID_COLS} items-baseline gap-2 py-1 text-xs sm:text-sm`}>
      <span aria-hidden="true" />
      <span className="truncate uppercase text-ink">{name}</span>
      <span aria-hidden="true" />
      <span className="text-right tabular-nums text-ink">{amount}</span>
      <span aria-hidden="true" />
    </div>
  );
}
