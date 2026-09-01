import { useRef, useState } from "react";
import { ActionBar } from "@/components/primitives/ActionBar";
import { ReceiptPaper } from "@/components/primitives/ReceiptPaper";
import { SolidButton } from "@/components/primitives/SolidButton";
import { AddItemFab } from "@/components/receipt/AddItemFab";
import type { Category, Expense, Person } from "@/data/types";
import { AddItemScreen, type AddItemScreenHandle } from "@/screens/AddItemScreen";
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
    paidBy: "p2",
    categoryId: "c1",
    splitType: "none",
    splits: [{ personId: "p2", amount: 150 }],
  },
];

type KitchenScreenState = "expenses" | "add-item";

export function KitchenScreen() {
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
        <ReceiptPaper>
          {screen === "expenses" && (
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

          {screen === "add-item" && (
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
            {screen === "expenses" && <AddItemFab onClick={() => setScreen("add-item")} />}
            {screen === "add-item" && (
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
