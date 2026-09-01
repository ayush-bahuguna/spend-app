import { createPortal } from "react-dom";

interface ExpenseActionSheetProps {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ExpenseActionSheet({ onEdit, onDelete, onClose }: ExpenseActionSheetProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-8"
      onClick={onClose}
    >
      <div
        className="receipt-grain w-full max-w-[23.75rem] rounded-xl bg-paper px-5 py-4 sm:max-w-[26.875rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-[2] flex flex-col">
          <button
            type="button"
            onClick={onEdit}
            className="border-b border-dashed border-ink-muted px-2 py-3 text-left font-mono-receipt text-sm font-bold uppercase tracking-wide text-ink"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-2 py-3 text-left font-mono-receipt text-sm font-bold uppercase tracking-wide text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
