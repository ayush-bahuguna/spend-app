import { useEffect, useRef, useState } from "react";
import { Divider } from "@/components/primitives/Divider";
import { EmptyState } from "@/components/primitives/EmptyState";
import { GifModal } from "@/components/primitives/GifModal";
import { ScopePill } from "@/components/primitives/ScopePill";
import { ColumnHeaderRow } from "@/components/receipt/ColumnHeaderRow";
import { ExpenseListItem } from "@/components/receipt/ExpenseListItem";
import { MonthlyReceiptHeader } from "@/components/receipt/MonthlyReceiptHeader";
import { NetBalanceRow } from "@/components/receipt/NetBalanceRow";
import { SettlementRow } from "@/components/receipt/SettlementRow";
import { TotalsRow } from "@/components/receipt/TotalsRow";
import { computeMonthSummary, isSplitExpense, personName } from "@/data/selectors";
import type { Category, Expense, Person } from "@/data/types";
import { useHoldToTrigger } from "@/hooks/useHoldToTrigger";
import { fetchAnimeMoneyGif } from "@/lib/giphy";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { getReceiptTagline } from "@/lib/taglines";

interface ScopeOption {
  key: string;
  label: string;
}

interface MonthlyReceiptScreenProps {
  monthKey: string;
  expenses: Expense[];
  people: Person[];
  categories: Category[];
  currentUserId: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
  scopeLabel: string;
  scopeOptions: ScopeOption[];
  selectedScopeKey: string;
  onSelectScope: (key: string) => void;
}

export function MonthlyReceiptScreen({
  monthKey,
  expenses,
  people,
  categories,
  currentUserId,
  onPrevMonth,
  onNextMonth,
  prevDisabled,
  nextDisabled,
  scopeLabel,
  scopeOptions,
  selectedScopeKey,
  onSelectScope,
}: MonthlyReceiptScreenProps) {
  const summary = computeMonthSummary(expenses, currentUserId, monthKey, formatMonthLabel(monthKey));
  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fadeHeaderRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const pendingGifRef = useRef<Promise<string | null> | null>(null);

  const holdProps = useHoldToTrigger({
    duration: 5000,
    onStart: () => {
      pendingGifRef.current = fetchAnimeMoneyGif();
    },
    onProgress: (progress) => {
      const el = taglineRef.current;
      if (!el) return;
      if (progress <= 0) {
        el.style.transform = "";
        return;
      }
      // Accelerating shake: amplitude and oscillation speed both ramp up
      // with progress, so it reads as "still -> jittering -> vibrating",
      // like the Android home-screen icon-jiggle easter egg.
      const eased = progress * progress;
      const amplitude = 6 * eased;
      const frequencyHz = 6 + 34 * eased;
      const elapsedSeconds = progress * 5;
      const angle = elapsedSeconds * frequencyHz * 2 * Math.PI;
      const dx = Math.sin(angle) * amplitude;
      const dy = Math.cos(angle * 1.3) * amplitude * 0.4;
      const rotate = Math.sin(angle * 0.7) * 6 * eased;
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;
    },
    onComplete: async () => {
      if (taglineRef.current) taglineRef.current.style.transform = "";
      const url = await (pendingGifRef.current ?? fetchAnimeMoneyGif());
      if (url) {
        navigator.vibrate?.(200);
        setGifUrl(url);
      }
    },
  });

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const headerEl = fadeHeaderRef.current;
    if (!scrollEl || !headerEl) return;

    const FADE_DISTANCE = 90;

    function handleScroll() {
      const progress = Math.min(scrollEl!.scrollTop / FADE_DISTANCE, 1);
      headerEl!.style.opacity = String(1 - progress);
    }

    handleScroll();
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
      <div ref={fadeHeaderRef} className="px-5 pt-6">
        <MonthlyReceiptHeader
          monthLabel={summary.label}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          prevDisabled={prevDisabled}
          nextDisabled={nextDisabled}
        />
        <div className="flex justify-center pt-3">
          <ScopePill
            label={scopeLabel}
            options={scopeOptions}
            selectedKey={selectedScopeKey}
            onSelect={onSelectScope}
          />
        </div>
        <p
          ref={taglineRef}
          {...holdProps}
          className="my-8 touch-none select-none text-center text-xs uppercase tracking-wide text-ink-muted [-webkit-touch-callout:none]"
        >
          {getReceiptTagline()}
        </p>
      </div>

      {gifUrl && <GifModal gifUrl={gifUrl} onClose={() => setGifUrl(null)} />}

      <div className="sticky top-0 z-10 bg-paper px-5 pt-3">
        <ColumnHeaderRow />
        <Divider weight="thin" className="mb-1" />
      </div>

      <div className="px-5 pb-56">
        {sorted.length === 0 && (
          <EmptyState message="This month's ledger is suspiciously clean. Fix that — add an expense." />
        )}
        {sorted.map((expense) => (
          <ExpenseListItem
            key={expense.id}
            expense={expense}
            people={people}
            categories={categories}
            isSplit={isSplitExpense(expense)}
            expanded={expandedIds.has(expense.id)}
            onToggle={() => toggleExpanded(expense.id)}
          />
        ))}

        <Divider className="my-2" />
        <TotalsRow label="Total Expenses" amount={formatCurrency(summary.totalExpenses)} />

        <Divider className="my-2" />
        <TotalsRow label="You Paid" amount={formatCurrency(summary.youPaid)} bold={false} indent />
        <TotalsRow
          label="Others Paid"
          amount={formatCurrency(summary.othersPaid)}
          bold={false}
          indent
        />

        {summary.settlements.length > 0 && (
          <>
            <Divider className="my-2" />
            <p className="py-1 text-sm font-bold uppercase tracking-wide">Settlements</p>
            {summary.settlements.map((s) => (
              <SettlementRow
                key={s.personId}
                name={personName(people, s.personId)}
                amount={formatCurrency(s.amount)}
                owesYou={s.owesYou}
                indent
              />
            ))}
          </>
        )}

        <Divider className="my-2" />
        <NetBalanceRow amount={formatCurrency(summary.netBalance)} />
      </div>
    </div>
  );
}
