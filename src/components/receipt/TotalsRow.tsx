import { LabelValueRow } from "@/components/primitives/LabelValueRow";

interface TotalsRowProps {
  label: string;
  amount: string;
  bold?: boolean;
  indent?: boolean;
}

export function TotalsRow({ label, amount, bold = true, indent = false }: TotalsRowProps) {
  return <LabelValueRow label={label} value={amount} bold={bold} indent={indent} />;
}
