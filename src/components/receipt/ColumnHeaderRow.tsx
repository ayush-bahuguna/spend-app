import { RECEIPT_GRID_COLS } from "@/components/receipt/receiptGrid";

export function ColumnHeaderRow() {
  return (
    <div
      className={`grid ${RECEIPT_GRID_COLS} gap-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted sm:text-xs`}
    >
      <span className="whitespace-nowrap">Date</span>
      <span>Item</span>
      <span className="whitespace-nowrap">Paid By</span>
      <span className="whitespace-nowrap text-right">Amount</span>
      <span aria-hidden="true" />
    </div>
  );
}
