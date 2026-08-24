import { RECEIPT_GRID_COLS } from "@/components/receipt/receiptGrid";

export function SplitDetailDivider() {
  return (
    <div className={`grid ${RECEIPT_GRID_COLS} my-1 gap-2`} aria-hidden="true">
      <span />
      <span className="divider-dashed-thin col-span-3" />
      <span />
    </div>
  );
}
