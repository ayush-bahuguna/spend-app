import { useRef, useState, type ReactNode } from "react";
import { CategoryBreakdown } from "@/components/analytics/CategoryBreakdown";
import { PersonBreakdown } from "@/components/analytics/PersonBreakdown";
import { RangeSelector, type RangeKey } from "@/components/analytics/RangeSelector";
import { SpendOverTime } from "@/components/analytics/SpendOverTime";
import { TopExpenses } from "@/components/analytics/TopExpenses";
import { TotalCard, type SpendBasis } from "@/components/analytics/TotalCard";
import { ActionBar } from "@/components/primitives/ActionBar";
import { ChipToggle } from "@/components/primitives/ChipToggle";
import { Divider } from "@/components/primitives/Divider";
import { EmptyState } from "@/components/primitives/EmptyState";
import { MultiScopePill } from "@/components/primitives/MultiScopePill";
import { ReceiptPaper } from "@/components/primitives/ReceiptPaper";
import { SolidButton } from "@/components/primitives/SolidButton";
import { AddItemFab } from "@/components/receipt/AddItemFab";
import type { Category, Expense, Person } from "@/data/types";
import { ANALYTICS_GROUPS, mockAnalytics } from "@/dev/analyticsMock";
import { AddItemScreen, type AddItemScreenHandle } from "@/screens/AddItemScreen";
import { AnalyticsScreen } from "@/screens/AnalyticsScreen";
import { MonthlyReceiptScreen } from "@/screens/MonthlyReceiptScreen";

// Dev-only playground: exercises the real add/edit/delete/long-press
// components end to end against local mock data, no Supabase/login involved.
// Reached locally via `npm run dev` -> http://localhost:5173/?dev=kitchen
// (see main.tsx) and excluded from production builds.

const MOCK_PEOPLE: Person[] = [
  { id: "p1", name: "You" },
  { id: "p2", name: "Riya" },
];

const MOCK_CATEGORIES: Category[] = [
  { id: "c1", name: "FOOD" },
  { id: "c2", name: "TRAVEL" },
  { id: "c3", name: "UTILITIES" },
];

const MOCK_EXPENSES: Expense[] = [
  {
    id: "m1",
    date: "2026-09-01",
    item: "DINNER",
    amount: 800,
    isOnline: true,
    paidBy: "p1",
    categoryId: "c1",
    splitType: "equal",
    splits: [
      { personId: "p1", amount: 400 },
      { personId: "p2", amount: 400 },
    ],
  },
  {
    id: "m2",
    date: "2026-09-03",
    item: "CAB",
    amount: 300,
    isOnline: false,
    paidBy: "p2",
    categoryId: "c2",
    splitType: "none",
    splits: [{ personId: "p2", amount: 300 }],
  },
  {
    id: "m3",
    date: "2026-09-05",
    item: "SUPERMARKET RUN",
    amount: 1200,
    isOnline: false,
    paidBy: "p1",
    categoryId: "c1",
    splitType: "percentage",
    splits: [
      { personId: "p1", amount: 700 },
      { personId: "p2", amount: 500 },
    ],
  },
  {
    id: "m4",
    date: "2026-09-08",
    item: "ELECTRICITY BILL",
    amount: 500,
    isOnline: true,
    paidBy: "p1",
    categoryId: "c3",
    splitType: "value",
    splits: [
      { personId: "p1", amount: 300 },
      { personId: "p2", amount: 200 },
    ],
  },
  {
    id: "m5",
    date: "2026-09-10",
    item: "COFFEE",
    amount: 150,
    isOnline: true,
    paidBy: "p2",
    categoryId: "c1",
    splitType: "none",
    splits: [{ personId: "p2", amount: 150 }],
  },
];

type KitchenScreenState = "expenses" | "add-item";
type KitchenTab = "receipt" | "parts" | "analytics";

const ANALYTICS_SCOPE_OPTIONS = [
  { key: "personal", label: "Personal" },
  ...ANALYTICS_GROUPS.map((g) => ({ key: g.id, label: g.name })),
];

const KITCHEN_TABS: { key: KitchenTab; label: string }[] = [
  { key: "receipt", label: "Receipt" },
  { key: "parts", label: "Parts" },
  { key: "analytics", label: "Stats" },
];

function KitchenSection({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <p className="border-b border-dashed border-ink-muted pb-1 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {name}
      </p>
      {children}
    </section>
  );
}

// The assembled Stats screen exactly as the app renders it, fed by the real
// aggregation over mock expenses.
function AnalyticsPagePreview() {
  const [range, setRange] = useState<RangeKey>("this-month");
  const [scopes, setScopes] = useState<string[]>(ANALYTICS_SCOPE_OPTIONS.map((o) => o.key));
  const [basis, setBasis] = useState<SpendBasis>("share");

  return (
    <AnalyticsScreen
      range={range}
      onRangeChange={setRange}
      scopeOptions={ANALYTICS_SCOPE_OPTIONS}
      selectedScopes={scopes}
      onScopesChange={setScopes}
      basis={basis}
      onBasisChange={setBasis}
      currentUserId="p1"
      data={mockAnalytics(range, scopes, basis)}
    />
  );
}

// Each analytics component on its own, labelled, with debug readouts.
function PartsPlayground() {
  const [range, setRange] = useState<RangeKey>("this-month");
  const [scopes, setScopes] = useState<string[]>(ANALYTICS_SCOPE_OPTIONS.map((o) => o.key));
  const [basis, setBasis] = useState<SpendBasis>("share");
  const [forceEmpty, setForceEmpty] = useState(false);
  const data = mockAnalytics(range, scopes, basis);
  // Judge emptiness on the full amounts: a group can have spends that aren't
  // yours (share = 0), and those should still show the charts.
  const isEmpty = forceEmpty || data.totals.full.total === 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-8">
      <h2 className="text-center text-lg font-bold uppercase tracking-widest">Stats Parts</h2>
      <Divider className="my-3" />
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <ChipToggle label="Force empty" selected={forceEmpty} onToggle={() => setForceEmpty((v) => !v)} />
        </div>

        <KitchenSection name="RangeSelector">
          <RangeSelector value={range} onChange={setRange} />
          <p className="text-center text-[10px] uppercase tracking-widest text-ink-muted">value: {range}</p>
        </KitchenSection>

        <KitchenSection name="MultiScopePill">
          <div className="flex justify-center">
            <MultiScopePill options={ANALYTICS_SCOPE_OPTIONS} selectedKeys={scopes} onChange={setScopes} />
          </div>
          <p className="text-center text-[10px] uppercase tracking-widest text-ink-muted">
            value: {scopes.join(", ")}
          </p>
        </KitchenSection>

        {isEmpty ? (
          <KitchenSection name="EmptyState (whole selection)">
            <EmptyState message="Not a rupee spent in this stretch. Very disciplined, or very forgetful." />
          </KitchenSection>
        ) : (
          <>
            <KitchenSection name="TotalCard">
              <TotalCard
                share={data.totals.share}
                full={data.totals.full}
                basis={basis}
                onBasisChange={setBasis}
                comparisonLabel={data.comparisonLabel}
              />
              <p className="text-center text-[10px] uppercase tracking-widest text-ink-muted">basis: {basis}</p>
            </KitchenSection>

            <KitchenSection name="SpendOverTime">
              {/* Keyed on the range so a tapped bar doesn't carry over to a different axis. */}
              <SpendOverTime key={range} buckets={data.overTime} />
            </KitchenSection>

            <KitchenSection name="CategoryBreakdown">
              <CategoryBreakdown rows={data.byCategory} />
            </KitchenSection>

            {data.byPerson && (
              <KitchenSection name="PersonBreakdown">
                <PersonBreakdown rows={data.byPerson} currentUserId="p1" />
              </KitchenSection>
            )}

            <KitchenSection name="TopExpenses">
              <TopExpenses rows={data.top} />
            </KitchenSection>
          </>
        )}
      </div>
    </div>
  );
}

export function KitchenScreen() {
  const [tab, setTab] = useState<KitchenTab>("receipt");
  const [screen, setScreen] = useState<KitchenScreenState>("expenses");
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditDirty, setIsEditDirty] = useState(false);
  const addItemRef = useRef<AddItemScreenHandle>(null);

  function openEditItem(expense: Expense) {
    setEditingExpense(expense);
    setIsEditDirty(false);
    setScreen("add-item");
  }

  function closeAddItem() {
    setScreen("expenses");
    setEditingExpense(null);
    setIsEditDirty(false);
  }

  function handleSubmitItem(expense: Expense) {
    if (editingExpense) {
      setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
    } else {
      setExpenses((prev) => [...prev, expense]);
    }
    closeAddItem();
  }

  function handleDeleteExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleAddCategory(name: string): Promise<Category> {
    const created: Category = { id: `c${Date.now()}`, name };
    setCategories((prev) => [...prev, created]);
    return created;
  }

  return (
    <div className="flex h-[100dvh] justify-center bg-paper-alt">
      <div className="relative flex h-full w-full flex-col sm:max-w-[26.875rem]">
        <div className="bg-ink px-3 py-1 text-center font-mono-receipt text-[10px] font-bold uppercase tracking-widest text-paper">
          Dev Playground — Mock Data
        </div>
        <div className="flex border-b-2 border-ink bg-paper">
          {KITCHEN_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                "flex-1 py-2 font-mono-receipt text-xs font-bold uppercase tracking-widest",
                tab === t.key ? "bg-ink text-paper" : "text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ReceiptPaper>
          {tab === "parts" && <PartsPlayground />}
          {tab === "analytics" && <AnalyticsPagePreview />}

          {tab === "receipt" && screen === "expenses" && (
            <MonthlyReceiptScreen
              monthKey="2026-09"
              expenses={expenses}
              people={MOCK_PEOPLE}
              categories={categories}
              currentUserId="p1"
              onPrevMonth={() => {}}
              onNextMonth={() => {}}
              prevDisabled
              nextDisabled
              scopeLabel="Personal"
              scopeOptions={[{ key: "personal", label: "Personal" }]}
              selectedScopeKey="personal"
              onSelectScope={() => {}}
              onEditExpense={openEditItem}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {tab === "receipt" && screen === "add-item" && (
            <AddItemScreen
              ref={addItemRef}
              people={MOCK_PEOPLE}
              categories={categories}
              currentUserId="p1"
              initialExpense={editingExpense ?? undefined}
              onClose={closeAddItem}
              onSubmit={handleSubmitItem}
              onAddCategory={handleAddCategory}
              onDirtyChange={setIsEditDirty}
            />
          )}
        </ReceiptPaper>

        <div className="flex justify-center">
          <div className="w-full sm:max-w-[26.875rem]">
            {tab === "receipt" && screen === "expenses" && (
              <AddItemFab onClick={() => setScreen("add-item")} />
            )}
            {tab === "receipt" && screen === "add-item" && (
              <ActionBar>
                <SolidButton
                  onClick={() => addItemRef.current?.submit()}
                  disabled={Boolean(editingExpense) && !isEditDirty}
                >
                  {editingExpense ? "Save Changes" : "+ Add To Receipt"}
                </SolidButton>
              </ActionBar>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
