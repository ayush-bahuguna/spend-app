import { useState } from "react";
import { ChipToggle } from "@/components/primitives/ChipToggle";
import { Divider } from "@/components/primitives/Divider";
import { IconButton } from "@/components/primitives/IconButton";
import { SelectField } from "@/components/primitives/SelectField";
import { SolidButton } from "@/components/primitives/SolidButton";
import { TextField } from "@/components/primitives/TextField";
import { ExpenseRow } from "@/components/receipt/ExpenseRow";
import type { Expense, Person, SplitType } from "@/data/types";
import { formatCurrency, formatDateShort } from "@/lib/format";

interface AddItemScreenProps {
  people: Person[];
  currentUserId: string;
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}

const SPLIT_OPTIONS = [
  { value: "equal", label: "Equal Split" },
  { value: "none", label: "No Split" },
];

export function AddItemScreen({ people, currentUserId, onClose, onAdd }: AddItemScreenProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [item, setItem] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [date, setDate] = useState(today);
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [participants, setParticipants] = useState<string[]>(people.map((p) => p.id));
  const [error, setError] = useState<string | undefined>();

  const amount = Number(amountStr) || 0;
  const shareCount = Math.max(participants.length, 1);
  const perPersonShare = splitType === "equal" ? Math.round(amount / shareCount) : amount;
  const isSplit = splitType === "equal" && participants.length > 1;

  function toggleParticipant(id: string) {
    setParticipants((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function handleSubmit() {
    if (!item.trim() || amount <= 0) {
      setError("ENTER AN ITEM NAME AND AMOUNT");
      return;
    }
    setError(undefined);
    const splits =
      splitType === "equal" && participants.length > 0
        ? participants.map((personId) => ({ personId, amount: perPersonShare }))
        : [{ personId: paidBy, amount }];

    onAdd({
      id: `e${Date.now()}`,
      date,
      item: item.trim().toUpperCase(),
      amount,
      paidBy,
      splitType,
      splits,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <IconButton label="Close" onClick={onClose}>
          ✕
        </IconButton>
        <h2 className="text-lg font-bold uppercase tracking-widest">Add Item</h2>
        <span className="w-8" />
      </div>
      <Divider weight="thin" className="my-3" />

      <div className="flex flex-col gap-4">
        <TextField
          label="What did you spend on?"
          value={item}
          onChange={setItem}
          placeholder="Dinner"
        />
        <TextField
          label="Amount"
          value={amountStr}
          onChange={setAmountStr}
          prefix="₹"
          type="number"
          placeholder="0"
          error={error}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Paid By"
            value={paidBy}
            onChange={setPaidBy}
            options={people.map((p) => ({ value: p.id, label: p.name }))}
          />
          <TextField label="Date" value={date} onChange={setDate} type="date" />
        </div>
        <SelectField
          label="Split With"
          value={splitType}
          onChange={(v) => setSplitType(v as SplitType)}
          options={SPLIT_OPTIONS}
        />
        {splitType === "equal" && (
          <div>
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
              With Whom?
            </span>
            <div className="flex flex-wrap gap-2">
              {people.map((p) => (
                <ChipToggle
                  key={p.id}
                  label={p.name}
                  selected={participants.includes(p.id)}
                  onToggle={() => toggleParticipant(p.id)}
                />
              ))}
            </div>
            {amount > 0 && participants.length > 0 && (
              <div className="mt-3 border border-dashed border-ink-muted px-3 py-2 text-center text-xs">
                <p className="font-bold">{formatCurrency(perPersonShare)} EACH</p>
                <p className="text-ink-muted">TOTAL {formatCurrency(amount)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Divider className="my-4" />
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
        Preview In Receipt
      </p>
      <ExpenseRow
        date={formatDateShort(date)}
        item={item.trim() || "ITEM NAME"}
        paidBy={people.find((p) => p.id === paidBy)?.name ?? ""}
        amount={amount > 0 ? formatCurrency(amount) : "₹0"}
        split={isSplit}
      />
      {isSplit && (
        <p className="text-[11px] text-ink-muted">Split between {participants.length} people</p>
      )}

      <Divider className="my-4" />
      <SolidButton onClick={handleSubmit} rounded>
        + Add To Receipt
      </SolidButton>
    </div>
  );
}
