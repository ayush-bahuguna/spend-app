import { RECEIPT_GRID_COLS } from "@/components/receipt/receiptGrid";
import { toSentenceCase } from "@/lib/format";

interface NoteSectionProps {
  note: string;
}

export function NoteSection({ note }: NoteSectionProps) {
  return (
    <div className={`grid ${RECEIPT_GRID_COLS} gap-2 text-[11px] sm:text-xs`}>
      <span aria-hidden="true" />
      <span className="col-span-3 break-words text-ink-muted">{toSentenceCase(note)}</span>
      <span aria-hidden="true" />
    </div>
  );
}
