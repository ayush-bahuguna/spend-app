import { useMemo, useState } from "react";
import { BottomNav, type NavSection } from "@/components/primitives/BottomNav";
import { ReceiptPaper } from "@/components/primitives/ReceiptPaper";
import { AddItemFab } from "@/components/receipt/AddItemFab";
import { computeMonthSummary } from "@/data/selectors";
import {
  CURRENT_USER_ID,
  archiveEntries,
  availableMonthKeys,
  categories as initialCategories,
  expensesByMonth as initialExpensesByMonth,
  people,
} from "@/data/mockData";
import type { Category, Expense } from "@/data/types";
import { AddItemScreen } from "@/screens/AddItemScreen";
import { MeScreen } from "@/screens/MeScreen";
import { MonthArchiveScreen } from "@/screens/MonthArchiveScreen";
import { MonthlyReceiptScreen } from "@/screens/MonthlyReceiptScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";

type Screen = NavSection | "add-item";

export default function App() {
  const [screen, setScreen] = useState<Screen>("expenses");
  const [monthKey, setMonthKey] = useState("2026-08");
  const [expensesByMonth, setExpensesByMonth] = useState(initialExpensesByMonth);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const monthIndex = availableMonthKeys.indexOf(monthKey);
  const expenses = expensesByMonth[monthKey] ?? [];
  const currentUser = people.find((p) => p.id === CURRENT_USER_ID)!;

  const archiveWithCurrent = useMemo(() => {
    const currentTotal = computeMonthSummary(expenses, CURRENT_USER_ID, monthKey, "").totalExpenses;
    return [...archiveEntries, { monthKey: "2026-08", shortLabel: "AUG 2026", total: currentTotal }];
  }, [expenses, monthKey]);

  function goToMonth(index: number) {
    const key = availableMonthKeys[index];
    if (key) setMonthKey(key);
  }

  function addExpense(expense: Expense) {
    setExpensesByMonth((prev) => ({
      ...prev,
      [monthKey]: [...(prev[monthKey] ?? []), expense],
    }));
    setScreen("expenses");
  }

  const showBottomNav = screen !== "add-item";

  return (
    <div className="flex h-dvh justify-center bg-paper-alt">
      <div className="relative flex h-full w-full max-w-[23.75rem] flex-col sm:max-w-[26.875rem]">
        <ReceiptPaper>
          {screen === "expenses" && (
            <MonthlyReceiptScreen
              monthKey={monthKey}
              expenses={expenses}
              people={people}
              currentUserId={CURRENT_USER_ID}
              onPrevMonth={() => goToMonth(monthIndex - 1)}
              onNextMonth={() => goToMonth(monthIndex + 1)}
              prevDisabled={monthIndex <= 0}
              nextDisabled={monthIndex >= availableMonthKeys.length - 1}
            />
          )}

          {screen === "add-item" && (
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <AddItemScreen
                people={people}
                currentUserId={CURRENT_USER_ID}
                onClose={() => setScreen("expenses")}
                onAdd={addExpense}
              />
            </div>
          )}

          {screen === "history" && (
            <MonthArchiveScreen
              entries={archiveWithCurrent}
              currentMonthKey={monthKey}
              onSelectMonth={(key) => {
                setMonthKey(key);
                setScreen("expenses");
              }}
            />
          )}

          {screen === "settings" && (
            <SettingsScreen
              categories={categories}
              onAddCategory={(name) =>
                setCategories((prev) => [...prev, { id: `c${Date.now()}`, name }])
              }
              onRenameCategory={(id, name) =>
                setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
              }
              onDeleteCategory={(id) => setCategories((prev) => prev.filter((c) => c.id !== id))}
            />
          )}

          {screen === "me" && (
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-24">
              <MeScreen currentUser={currentUser} people={people} />
            </div>
          )}
        </ReceiptPaper>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center">
        <div className="w-full max-w-[23.75rem] sm:max-w-[26.875rem]">
          {screen === "expenses" && <AddItemFab onClick={() => setScreen("add-item")} />}
          {showBottomNav && (
            <BottomNav active={screen as NavSection} onChange={(section) => setScreen(section)} />
          )}
        </div>
      </div>
    </div>
  );
}
