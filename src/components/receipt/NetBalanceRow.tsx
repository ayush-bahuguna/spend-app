import { LabelValueRow } from "@/components/primitives/LabelValueRow";

interface NetBalanceRowProps {
  amount: string;
}

export function NetBalanceRow({ amount }: NetBalanceRowProps) {
  return <LabelValueRow label="NET BALANCE" value={amount} bold />;
}
