import { OutlineButton } from "@/components/primitives/OutlineButton";
import { SolidButton } from "@/components/primitives/SolidButton";

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-8">
      <div className="receipt-grain w-full max-w-[23.75rem] rounded-xl bg-paper px-5 py-6 sm:max-w-[26.875rem]">
        <p className="relative z-[2] text-center text-sm font-bold uppercase tracking-wide text-ink">
          {message}
        </p>
        <div className="relative z-[2] mt-5 flex gap-3">
          <OutlineButton onClick={onCancel} rounded className="flex-1">
            {cancelLabel}
          </OutlineButton>
          <SolidButton onClick={onConfirm} rounded className="flex-1 py-3 text-sm">
            {confirmLabel}
          </SolidButton>
        </div>
      </div>
    </div>
  );
}
