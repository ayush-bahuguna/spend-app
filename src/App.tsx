import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { ActionBar } from "@/components/primitives/ActionBar";
import { BottomNav, type NavSection } from "@/components/primitives/BottomNav";
import { ReceiptPaper } from "@/components/primitives/ReceiptPaper";
import { SolidButton } from "@/components/primitives/SolidButton";
import type { RangeKey } from "@/components/analytics/RangeSelector";
import type { SpendBasis } from "@/components/analytics/TotalCard";
import { AddItemFab } from "@/components/receipt/AddItemFab";
import { computeAnalytics, rangeWindow } from "@/data/analytics";
import * as categoriesApi from "@/data/api/categories";
import * as expensesApi from "@/data/api/expenses";
import type { Scope } from "@/data/api/expenses";
import * as groupsApi from "@/data/api/groups";
import type { Group } from "@/data/api/groups";
import type { Category, Expense, Person, ScopedExpense } from "@/data/types";
import { useAppHeight } from "@/hooks/useAppHeight";
import { AddItemScreen, type AddItemScreenHandle } from "@/screens/AddItemScreen";
import { AnalyticsScreen } from "@/screens/AnalyticsScreen";
import { GroupsScreen } from "@/screens/GroupsScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { MeScreen } from "@/screens/MeScreen";
import { MonthlyReceiptScreen } from "@/screens/MonthlyReceiptScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";

type Screen = NavSection | "add-item";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function scopeCacheKey(scope: Scope): string {
  return scope.type === "personal" ? "personal" : `group:${scope.groupId}`;
}

function scopeFromKey(key: string, groups: Group[]): Scope {
  if (key === "personal") return { type: "personal" };
  const group = groups.find((g) => g.id === key);
  return group ? { type: "group", groupId: group.id, groupName: group.name } : { type: "personal" };
}

function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[var(--app-height,100dvh)] justify-center bg-paper-alt">
      <div className="relative flex h-full w-full flex-col sm:max-w-[26.875rem]">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  useAppHeight();
  const { session, currentUser, signOut } = useAuth();

  const [screen, setScreen] = useState<Screen>("expenses");
  const [scope, setScope] = useState<Scope>({ type: "personal" });
  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const [expensesCache, setExpensesCache] = useState<Record<string, Expense[]>>({});
  const [statsRange, setStatsRange] = useState<RangeKey>("this-month");
  // null = every scope, including groups joined later.
  const [statsScopes, setStatsScopes] = useState<string[] | null>(null);
  const [statsBasis, setStatsBasis] = useState<SpendBasis>("total");
  const [statsCache, setStatsCache] = useState<Record<string, ScopedExpense[]>>({});
  const [groupMembersCache, setGroupMembersCache] = useState<Record<string, Person[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditDirty, setIsEditDirty] = useState(false);
  const addItemRef = useRef<AddItemScreenHandle>(null);

  const expensesKey = `${scopeCacheKey(scope)}:${monthKey}`;
  const expenses = expensesCache[expensesKey];
  const people: Person[] =
    scope.type === "personal" ? (currentUser ? [currentUser] : []) : (groupMembersCache[scope.groupId] ?? []);
  const scopeLabel = scope.type === "personal" ? "Personal" : scope.groupName;
  const scopeOptions = [
    { key: "personal", label: "Personal" },
    ...groups.map((g) => ({ key: g.id, label: g.name })),
  ];
  const selectedScopeKey = scope.type === "personal" ? "personal" : scope.groupId;

  // Stats: a saved selection can name a group the user has since left, so
  // keep only live scopes and fall back to all of them if none survive.
  const allScopeKeys = scopeOptions.map((o) => o.key);
  const liveStatsScopes = (statsScopes ?? allScopeKeys).filter((k) => allScopeKeys.includes(k));
  const selectedStatsScopes = liveStatsScopes.length > 0 ? liveStatsScopes : allScopeKeys;
  const statsGroupIds = selectedStatsScopes.filter((k) => k !== "personal");
  const statsWindow = rangeWindow(statsRange);
  const statsKey = `${statsRange}:${[...selectedStatsScopes].sort().join(",")}`;
  const statsExpenses = statsCache[statsKey];
  const statsPeople: Person[] = [
    ...(currentUser ? [currentUser] : []),
    ...statsGroupIds.flatMap((id) => groupMembersCache[id] ?? []),
  ].filter((p, i, all) => all.findIndex((q) => q.id === p.id) === i);
  const statsData =
    statsExpenses && currentUser
      ? computeAnalytics(statsExpenses, {
          range: statsRange,
          window: statsWindow,
          basis: statsBasis,
          currentUserId: currentUser.id,
          categories,
          people: statsPeople,
          groupNames: Object.fromEntries(groups.map((g) => [g.id, g.name])),
          includePeople: statsGroupIds.length > 0,
        })
      : undefined;

  useEffect(() => {
    if (!currentUser) return;
    categoriesApi.fetchCategories().then(setCategories).catch(() => {});
    groupsApi.fetchGroups().then(setGroups).catch(() => {});
  }, [currentUser?.id]);

  // Also refetch every time the Groups screen becomes active — the initial
  // once-per-login fetch above can occasionally run just before Supabase's
  // session restore finishes attaching a valid access token (a timing race
  // on cold start), returning zero rows with no error to catch. Refetching
  // on every visit self-heals that instead of leaving the user stuck on a
  // stale empty list for the rest of the session.
  useEffect(() => {
    if (!currentUser || screen !== "groups") return;
    groupsApi.fetchGroups().then(setGroups).catch(() => {});
  }, [currentUser, screen]);

  // Same idea for categories on the Settings screen.
  useEffect(() => {
    if (!currentUser || screen !== "settings") return;
    categoriesApi.fetchCategories().then(setCategories).catch(() => {});
  }, [currentUser, screen]);

  // Refetch group members every time we enter that group's scope (not just once) —
  // so a newly-joined member becomes visible without needing a full reload.
  useEffect(() => {
    if (scope.type !== "group") return;
    const { groupId } = scope;
    groupsApi
      .fetchGroupMembers(groupId)
      .then((members) => setGroupMembersCache((prev) => ({ ...prev, [groupId]: members })))
      .catch(() => {});
  }, [scope]);

  // Refetch expenses every time the Expenses screen becomes active (or scope/month
  // changes), not just once — so a groupmate's newly-added expense shows up on
  // revisit instead of being stuck behind a stale in-memory cache.
  useEffect(() => {
    if (!currentUser || screen !== "expenses") return;
    if (scope.type === "group" && !groupMembersCache[scope.groupId]) return;
    expensesApi
      .fetchExpensesForMonth(scope, monthKey)
      .then((data) => setExpensesCache((prev) => ({ ...prev, [expensesKey]: data })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, scope, monthKey, groupMembersCache, screen]);

  // Same idea for Stats — refetch every time it becomes active (or the range /
  // scopes change). One query covers the range and its comparison period.
  useEffect(() => {
    if (!currentUser || screen !== "stats") return;
    expensesApi
      .fetchExpensesInRange(
        { personal: selectedStatsScopes.includes("personal"), groupIds: statsGroupIds },
        statsWindow.prevStart,
        statsWindow.end,
      )
      .then((data) => setStatsCache((prev) => ({ ...prev, [statsKey]: data })))
      .catch(() => {});
    // Member names for By Person; refetched so new joiners show up.
    for (const groupId of statsGroupIds) {
      groupsApi
        .fetchGroupMembers(groupId)
        .then((members) => setGroupMembersCache((prev) => ({ ...prev, [groupId]: members })))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, screen, statsKey]);

  function goToMonth(delta: number) {
    setMonthKey((prev) => shiftMonthKey(prev, delta));
  }

  async function addExpense(expense: Expense) {
    await expensesApi.addExpense(scope, expense);
    setExpensesCache((prev) => ({ ...prev, [expensesKey]: [...(prev[expensesKey] ?? []), expense] }));
    setScreen("expenses");
  }

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
    if (editingExpense) updateExpense(expense);
    else addExpense(expense);
  }

  function updateExpense(expense: Expense) {
    setExpensesCache((prev) => ({
      ...prev,
      [expensesKey]: (prev[expensesKey] ?? []).map((e) => (e.id === expense.id ? expense : e)),
    }));
    setScreen("expenses");
    setEditingExpense(null);
    setIsEditDirty(false);
    expensesApi.updateExpense(expense).catch(() => {});
  }

  function deleteExpense(id: string) {
    setExpensesCache((prev) => ({
      ...prev,
      [expensesKey]: (prev[expensesKey] ?? []).filter((e) => e.id !== id),
    }));
    expensesApi.deleteExpense(id).catch(() => {});
  }

  async function handleAddCategory(name: string): Promise<Category> {
    const created = await categoriesApi.addCategory(name);
    setCategories((prev) => [...prev, created]);
    return created;
  }

  function handleRenameCategory(id: string, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    categoriesApi.renameCategory(id, name).catch(() => {});
  }

  function handleDeleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    categoriesApi.deleteCategory(id).catch(() => {});
  }

  async function handleCreateGroup(name: string) {
    if (!currentUser) return;
    const group = await groupsApi.createGroup(name, currentUser.name);
    if (group) setGroups((prev) => [...prev, group]);
  }

  async function handleJoinGroup(code: string): Promise<{ ok: boolean; error?: string }> {
    if (!currentUser) return { ok: false, error: "NOT SIGNED IN" };
    try {
      const group = await groupsApi.joinGroupByCode(code, currentUser.name);
      if (!group) return { ok: false, error: "INVALID CODE" };
      setGroups((prev) => (prev.some((g) => g.id === group.id) ? prev : [...prev, group]));
      return { ok: true };
    } catch {
      return { ok: false, error: "SOMETHING WENT WRONG" };
    }
  }

  function handleLeaveGroup(groupId: string) {
    groupsApi.leaveGroup(groupId).catch(() => {});
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (scope.type === "group" && scope.groupId === groupId) {
      setScope({ type: "personal" });
      setMonthKey(currentMonthKey());
    }
  }

  function handleSelectGroup(group: Group) {
    setScope({ type: "group", groupId: group.id, groupName: group.name });
    setMonthKey(currentMonthKey());
    setScreen("expenses");
  }

  function handleSelectScope(key: string) {
    setScope(scopeFromKey(key, groups));
  }

  function handleSelectStatsScopes(keys: string[]) {
    // Picking everything means "all", so groups joined later are included too.
    setStatsScopes(allScopeKeys.every((k) => keys.includes(k)) ? null : keys);
  }

  if (session === undefined) {
    return (
      <AppFrame>
        <ReceiptPaper>
          <p className="m-auto text-xs uppercase tracking-wide text-ink-muted">Loading…</p>
        </ReceiptPaper>
      </AppFrame>
    );
  }

  if (!session || !currentUser) {
    return (
      <AppFrame>
        <LoginScreen />
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <ReceiptPaper>
        {screen === "expenses" &&
          (expenses ? (
            <MonthlyReceiptScreen
              monthKey={monthKey}
              expenses={expenses}
              people={people}
              categories={categories}
              currentUserId={currentUser.id}
              onPrevMonth={() => goToMonth(-1)}
              onNextMonth={() => goToMonth(1)}
              prevDisabled={false}
              nextDisabled={monthKey >= currentMonthKey()}
              scopeLabel={scopeLabel}
              scopeOptions={scopeOptions}
              selectedScopeKey={selectedScopeKey}
              onSelectScope={handleSelectScope}
              onEditExpense={openEditItem}
              onDeleteExpense={deleteExpense}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-xs uppercase tracking-wide text-ink-muted">Loading…</p>
            </div>
          ))}

        {screen === "add-item" && (
          <AddItemScreen
            ref={addItemRef}
            people={people}
            categories={categories}
            currentUserId={currentUser.id}
            initialExpense={editingExpense ?? undefined}
            onClose={closeAddItem}
            onSubmit={handleSubmitItem}
            onAddCategory={handleAddCategory}
            onDirtyChange={setIsEditDirty}
          />
        )}

        {screen === "stats" && (
          <AnalyticsScreen
            range={statsRange}
            onRangeChange={setStatsRange}
            scopeOptions={scopeOptions}
            selectedScopes={selectedStatsScopes}
            onScopesChange={handleSelectStatsScopes}
            basis={statsBasis}
            onBasisChange={setStatsBasis}
            currentUserId={currentUser.id}
            data={statsData}
          />
        )}

        {screen === "groups" && (
          <GroupsScreen
            groups={groups}
            onSelectGroup={handleSelectGroup}
            onCreateGroup={handleCreateGroup}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
          />
        )}

        {screen === "settings" && (
          <SettingsScreen
            categories={categories}
            onAddCategory={handleAddCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {screen === "me" && (
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-8">
            <MeScreen currentUser={currentUser} onLogout={signOut} />
          </div>
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
          <BottomNav
            active={screen as NavSection}
            onChange={(section) => {
              setEditingExpense(null);
              setIsEditDirty(false);
              setScreen(section);
            }}
          />
        </div>
      </div>
    </AppFrame>
  );
}
