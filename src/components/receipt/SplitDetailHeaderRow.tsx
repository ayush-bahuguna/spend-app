import { RECEIPT_GRID_COLS } from "@/components/receipt/receiptGrid";

export function SplitDetailHeaderRow() {
  return (
    <div
      className={`grid ${RECEIPT_GRID_COLS} gap-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-muted sm:text-xs`}
    >
      <span aria-hidden="true" />
      <span>Person</span>
      <span aria-hidden="true" />
      <span className="whitespace-nowrap text-right">Share</span>
      <span aria-hidden="true" />
    </div>
  );
}
