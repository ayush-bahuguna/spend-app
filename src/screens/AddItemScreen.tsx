import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ChipToggle } from "@/components/primitives/ChipToggle";
import { Divider } from "@/components/primitives/Divider";
import { IconButton } from "@/components/primitives/IconButton";
import { SelectField } from "@/components/primitives/SelectField";
import { TextField } from "@/components/primitives/TextField";
import { ExpenseRow } from "@/components/receipt/ExpenseRow";
import { NoteSection } from "@/components/receipt/NoteSection";
import { SplitDetailDivider } from "@/components/receipt/SplitDetailDivider";
import { SplitDetailHeaderRow } from "@/components/receipt/SplitDetailHeaderRow";
import { SplitDetailRow } from "@/components/receipt/SplitDetailRow";
import { personName } from "@/data/selectors";
import type { Category, Expense, ExpenseSplit, Person, SplitType } from "@/data/types";
import { ddmyyyyToISO, formatCurrency, formatDateShort, isoToDDMYYYY } from "@/lib/format";

interface AddItemScreenProps {
  people: Person[];
  categories: Category[];
  currentUserId: string;
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}

export interface AddItemScreenHandle {
  submit: () => void;
}

const SPLIT_OPTIONS = [
  { value: "equal", label: "Equal Split" },
  { value: "none", label: "No Split" },
  { value: "percentage", label: "Partial Split - Percentage" },
  { value: "value", label: "Partial Split - Value" },
];

export const AddItemScreen = forwardRef<AddItemScreenHandle, AddItemScreenProps>(function AddItemScreen(
  { people, categories, currentUserId, onClose, onAdd },
  ref,
) {
  const [item, setItem] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [amountStr, setAmountStr] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [dateStr, setDateStr] = useState(() => isoToDDMYYYY(new Date().toISOString()));
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [participants, setParticipants] = useState<string[]>(people.map((p) => p.id));
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | undefined>();
  const categoryFieldRef = useRef<HTMLDivElement>(null);

  const categoryError = categoryTouched && !categoryId;

  const isSolo = people.length <= 1;
  const amount = Number(amountStr) || 0;
  const shareCount = Math.max(participants.length, 1);
  const equalShare = Math.round(amount / shareCount);
  const isoDate = ddmyyyyToISO(dateStr);

  const customEntries = people
    .map((p) => ({ id: p.id, value: Number(customShares[p.id]) || 0 }))
    .filter((e) => e.value > 0);
  const customWeightSum = customEntries.reduce((sum, e) => sum + e.value, 0);

  let computedSplits: ExpenseSplit[];
  let isSplit: boolean;

  if (splitType === "equal" && participants.length > 0) {
    computedSplits = participants.map((personId) => ({ personId, amount: equalShare }));
    isSplit = participants.length > 1;
  } else if (splitType === "percentage" && customWeightSum > 0) {
    computedSplits = customEntries.map(({ id, value }) => ({
      personId: id,
      amount: Math.round((amount * value) / customWeightSum),
    }));
    isSplit = customEntries.length > 1;
  } else if (splitType === "value" && customEntries.length > 0) {
    computedSplits = customEntries.map(({ id, value }) => ({ personId: id, amount: value }));
    isSplit = customEntries.length > 1;
  } else {
    computedSplits = [{ personId: paidBy, amount }];
    isSplit = false;
  }

  function toggleParticipant(id: string) {
    setParticipants((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function handleSubmit() {
    if (!categoryId) {
      setCategoryTouched(true);
      categoryFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!item.trim() || amount <= 0 || !isoDate) {
      setError(!isoDate ? "ENTER A VALID DATE (D/M/YYYY)" : "ENTER AN ITEM NAME AND AMOUNT");
      return;
    }
    setError(undefined);

    onAdd({
      id: `e${Date.now()}`,
      date: isoDate,
      item: item.trim().toUpperCase(),
      amount,
      paidBy,
      categoryId: categoryId || undefined,
      splitType,
      splits: computedSplits,
    });
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 bg-paper px-5 pt-6">
        <div className="relative flex items-center justify-center">
          <h2 className="text-lg font-bold uppercase tracking-widest">Add Item</h2>
          <IconButton label="Close" onClick={onClose} className="absolute right-0">
            ✕
          </IconButton>
        </div>
        <Divider weight="thin" className="my-3" />
      </div>

      <div className="px-5 pb-56">
        <div className="flex flex-col gap-4">
          <div ref={categoryFieldRef}>
            <SelectField
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
              options={[
                { value: "", label: "Select category" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              error={categoryError}
            />
          </div>
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
            inputMode="decimal"
            placeholder="0"
            error={error}
          />
          {isSolo ? (
            <TextField
              label="Date"
              value={dateStr}
              onChange={setDateStr}
              type="text"
              inputMode="numeric"
              placeholder="D/M/YYYY"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Paid By"
                value={paidBy}
                onChange={setPaidBy}
                options={people.map((p) => ({ value: p.id, label: p.name }))}
              />
              <TextField
                label="Date"
                value={dateStr}
                onChange={setDateStr}
                type="text"
                inputMode="numeric"
                placeholder="D/M/YYYY"
              />
            </div>
          )}
          {!isSolo && (
            <SelectField
              label="Split Option"
              value={splitType}
              onChange={(v) => setSplitType(v as SplitType)}
              options={SPLIT_OPTIONS}
            />
          )}

          {!isSolo && splitType === "equal" && (
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
                  <p className="font-bold">{formatCurrency(equalShare)} EACH</p>
                  <p className="text-ink-muted">TOTAL {formatCurrency(amount)}</p>
                </div>
              )}
            </div>
          )}

          {!isSolo && (splitType === "percentage" || splitType === "value") && (
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                With Whom?
              </span>
              <div className="flex flex-col gap-3">
                {people.map((p) => {
                  const raw = customShares[p.id] ?? "";
                  const selected = (Number(raw) || 0) > 0;
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-3">
                      <span
                        className={[
                          "border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                          selected ? "bg-ink text-paper" : "bg-transparent text-ink",
                        ].join(" ")}
                      >
                        {p.name}
                      </span>
                      <div className="flex items-center gap-1 border-b-2 border-ink py-1">
                        {splitType === "value" && <span className="text-sm text-ink">₹</span>}
                        <input
                          value={raw}
                          onChange={(e) =>
                            setCustomShares((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          className="w-14 bg-transparent text-right font-mono-receipt text-sm text-ink outline-none"
                        />
                        {splitType === "percentage" && (
                          <span className="text-sm text-ink-muted">%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Divider className="mt-12 mb-4" />
        <ExpenseRow
          date={isoDate ? formatDateShort(isoDate) : dateStr}
          item={categories.find((c) => c.id === categoryId)?.name ?? "CATEGORY"}
          paidBy={people.find((p) => p.id === paidBy)?.name ?? ""}
          amount={amount > 0 ? formatCurrency(amount) : "₹0"}
          split={isSplit}
        />
        <div className="mb-2 flex flex-col gap-2 bg-paper-alt/40 pt-2 pb-1">
          <NoteSection note={item.trim() || "ITEM NAME"} />
          {isSplit && (
            <div className="flex flex-col">
              <SplitDetailDivider />
              <SplitDetailHeaderRow />
              {computedSplits.map((s) => (
                <SplitDetailRow
                  key={s.personId}
                  name={personName(people, s.personId)}
                  amount={formatCurrency(s.amount)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
