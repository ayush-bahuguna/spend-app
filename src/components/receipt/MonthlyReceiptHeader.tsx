import { Divider } from "@/components/primitives/Divider";
import { MonthSelector } from "@/components/receipt/MonthSelector";

interface MonthlyReceiptHeaderProps {
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

export function MonthlyReceiptHeader({
  monthLabel,
  onPrevMonth,
  onNextMonth,
  prevDisabled,
  nextDisabled,
}: MonthlyReceiptHeaderProps) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-[0.2em]">SPEND</h1>
      <Divider className="my-2" />
      <MonthSelector
        label={monthLabel}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
        prevDisabled={prevDisabled}
        nextDisabled={nextDisabled}
      />
      <Divider className="my-2" />
    </div>
  );
}
