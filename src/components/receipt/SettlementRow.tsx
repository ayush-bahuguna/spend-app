import { LabelValueRow } from "@/components/primitives/LabelValueRow";

interface SettlementRowProps {
  name: string;
  amount: string;
  owesYou: boolean;
  indent?: boolean;
}

export function SettlementRow({ name, amount, owesYou, indent = false }: SettlementRowProps) {
  const label = owesYou ? `${name} OWES YOU` : `YOU OWE ${name}`;
  return <LabelValueRow label={label} value={amount} indent={indent} />;
}
