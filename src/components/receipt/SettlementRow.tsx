import { LabelValueRow } from "@/components/primitives/LabelValueRow";

interface SettlementRowProps {
  name: string;
  amount: string;
  indent?: boolean;
}

export function SettlementRow({ name, amount, indent = false }: SettlementRowProps) {
  return <LabelValueRow label={`${name} OWES YOU`} value={amount} indent={indent} />;
}
