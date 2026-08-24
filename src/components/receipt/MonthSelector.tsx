import { IconButton } from "@/components/primitives/IconButton";

interface MonthSelectorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

export function MonthSelector({ label, onPrev, onNext, prevDisabled, nextDisabled }: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-1">
      <IconButton label="Previous month" onClick={onPrev} disabled={prevDisabled}>
        ‹
      </IconButton>
      <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
      <IconButton label="Next month" onClick={onNext} disabled={nextDisabled}>
        ›
      </IconButton>
    </div>
  );
}
