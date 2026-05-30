'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toast } from './ui';
import { SlimeSprite } from './icons';
import {
  HomeScreen, AddEditScreen, DetailScreen, StatsScreen, MenuSheet, ShareSheet,
} from './screens';
import {
  CreateGroupScreen, GroupDetailScreen, GroupAddExpenseScreen, GroupExpenseDetailScreen,
} from './groups';
import { getSupabase } from '../lib/supabase';
import {
  fetchExpenses, upsertExpense, deleteExpense, upsertManyExpenses,
  fetchGroups, createGroup, deleteGroup, addGroupExpense, joinGroupByCode, upsertManyGroups, updateGroupJoinCode,
} from '../lib/db';

const STORAGE_KEY = 'spend_expenses_v1';
const GROUPS_KEY  = 'spend_groups_v1';

function makeDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

const SAMPLE = [
  { id: 's1', amount: 200,  category: 'food',     date: makeDate(0), note: 'BURGER + FRIES' },
  { id: 's2', amount: 120,  category: 'travel',   date: makeDate(1), note: '' },
  { id: 's3', amount: 800,  category: 'shopping', date: makeDate(2), note: 'NEW HEADPHONES' },
  { id: 's4', amount: 1500, category: 'bills',    date: makeDate(3), note: 'ELECTRICITY' },
  { id: 's5', amount: 75,   category: 'other',    date: makeDate(4), note: '' },
  { id: 's6', amount: 60,   category: 'food',     date: makeDate(5), note: 'MORNING COFFEE', iconVariant: 'coffee' },
];

// ─── localStorage helpers (no SAMPLE fallback — just cache) ─────────────────

function readLocalExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(e => !String(e.id).startsWith('s')) : [];
  } catch { return []; }
}
function writeLocalExpenses(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}
function readLocalGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(g => !String(g.id).startsWith('sg')) : [];
  } catch { return []; }
}
function writeLocalGroups(list) {
  try { localStorage.setItem(GROUPS_KEY, JSON.stringify(list)); } catch {}
}

async function maybeRunMigration(userId, cachedExp, cachedGroups) {
  const key = 'spend_migrated_' + userId;
  if (localStorage.getItem(key)) return;
  try {
    await Promise.all([
      upsertManyExpenses(userId, cachedExp),
      upsertManyGroups(userId, cachedGroups),
    ]);
    localStorage.setItem(key, '1');
  } catch (e) {
    console.warn('Migration skipped:', e);
  }
}

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [expenses,    setExpenses]    = useState([]);
  const [groups,      setGroups]      = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [route,       setRoute]       = useState({ name: 'home' });
  const [toast,       setToast]       = useState('');
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const userIdRef   = useRef(null);
  const realtimeRef = useRef(null);

  // ── Init: load data + realtime ──────────────────────────────────────────
  useEffect(() => {
    const supabase = getSupabase();
    let cancelled = false;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      const userId = session.user.id;
      userIdRef.current = userId;

      // Warm-start from cache
      const cachedExp    = readLocalExpenses();
      const cachedGroups = readLocalGroups();
      if (cachedExp.length)    setExpenses(cachedExp);
      if (cachedGroups.length) setGroups(cachedGroups);

      // One-time migration of pre-auth localStorage data
      await maybeRunMigration(userId, cachedExp, cachedGroups);

      // Fetch from Supabase (source of truth)
      let remoteExp = [], remoteGroups = [];
      try {
        [remoteExp, remoteGroups] = await Promise.all([
          fetchExpenses(userId),
          fetchGroups(userId),
        ]);
      } catch (e) {
        console.warn('DB fetch failed, using cache/sample:', e);
      }
      if (cancelled) return;

      const finalExp    = remoteExp.length    ? remoteExp    : (cachedExp.length    ? cachedExp    : SAMPLE);
      const finalGroups = remoteGroups.length ? remoteGroups : (cachedGroups.length ? cachedGroups : []);

      setExpenses(finalExp);
      setGroups(finalGroups);
      writeLocalExpenses(finalExp);
      writeLocalGroups(finalGroups);
      setDataLoading(false);

      // Realtime: refetch groups on any group_expenses change
      realtimeRef.current = supabase
        .channel('group_expenses_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_expenses' }, async () => {
          const updated = await fetchGroups(userId);
          if (!cancelled) {
            setGroups(updated);
            writeLocalGroups(updated);
          }
        })
        .subscribe();
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
      realtimeRef.current?.unsubscribe();
    };
  }, []);

  // Route persistence
  useEffect(() => {
    try {
      const r = localStorage.getItem('spend_route_v1');
      if (r) setRoute(JSON.parse(r));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('spend_route_v1', JSON.stringify(route)); } catch {}
  }, [route]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goHome         = useCallback(() => setRoute({ name: 'home' }), []);
  const goAdd          = useCallback(() => setRoute({ name: 'add' }), []);
  const goEdit         = useCallback((id) => setRoute({ name: 'edit', id }), []);
  const goDetail       = useCallback((id) => setRoute({ name: 'detail', id }), []);
  const goStats        = useCallback(() => setRoute({ name: 'stats' }), []);
  const goCreateGroup  = useCallback(() => setRoute({ name: 'create-group' }), []);
  const goGroupDetail  = useCallback((id) => setRoute({ name: 'group-detail', id }), []);
  const goGroupAddExp  = useCallback((id) => setRoute({ name: 'group-add-expense', id }), []);
  const goGroupExpDetail = useCallback((groupId, expId) => setRoute({ name: 'group-expense-detail', groupId, expId }), []);

  // ── Expense mutations ────────────────────────────────────────────────────
  function handleSave(expense) {
    let next;
    setExpenses(prev => {
      const idx = prev.findIndex(e => e.id === expense.id);
      next = idx >= 0 ? prev.map((e, i) => i === idx ? expense : e) : [expense, ...prev];
      return next;
    });
    setTimeout(() => {
      writeLocalExpenses(next);
      if (userIdRef.current) upsertExpense(userIdRef.current, expense).catch(console.error);
    }, 0);
    setToast(route.name === 'edit' ? 'EXPENSE UPDATED' : 'EXPENSE ADDED');
    goHome();
  }

  function handleDelete(id) {
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      writeLocalExpenses(next);
      return next;
    });
    if (userIdRef.current) deleteExpense(id).catch(console.error);
    setToast('EXPENSE DELETED');
    goHome();
  }

  async function handleClearAll() {
    setExpenses([]);
    writeLocalExpenses([]);
    if (userIdRef.current) {
      getSupabase().from('expenses').delete().eq('user_id', userIdRef.current).catch(console.error);
    }
    setMenuOpen(false);
    setToast('ALL CLEARED');
    goHome();
  }

  function handleResetDemo() {
    setExpenses(SAMPLE);
    setGroups([]);
    writeLocalExpenses(SAMPLE);
    writeLocalGroups([]);
    setMenuOpen(false);
    setToast('DEMO DATA RESET');
    goHome();
  }

  function handleShareAll() {
    setMenuOpen(false);
    const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const text = `My spend log: ${expenses.length} entries totalling ₹${Math.round(total).toLocaleString('en-IN')}`;
    copyToClipboard(text);
    setToast('LOG COPIED');
  }

  // ── Group mutations ──────────────────────────────────────────────────────
  async function handleSaveGroup(group) {
    const withCode = userIdRef.current
      ? await createGroup(userIdRef.current, group).catch(() => group)
      : group;
    setGroups(prev => {
      const next = [withCode, ...prev];
      writeLocalGroups(next);
      return next;
    });
    setToast('GROUP CREATED');
    goGroupDetail(withCode.id);
  }

  function handleDeleteGroup(id) {
    setGroups(prev => {
      const next = prev.filter(g => g.id !== id);
      writeLocalGroups(next);
      return next;
    });
    if (userIdRef.current) deleteGroup(id).catch(console.error);
    setToast('GROUP DELETED');
    goHome();
  }

  async function handleGenerateCode(groupId) {
    try {
      const code = await updateGroupJoinCode(groupId);
      setGroups(prev => {
        const next = prev.map(g => g.id === groupId ? { ...g, joinCode: code } : g);
        writeLocalGroups(next);
        return next;
      });
      setToast('CODE GENERATED!');
    } catch (e) {
      console.error(e);
      setToast('FAILED TO GENERATE');
    }
  }

  function handleSaveGroupExpense(groupId, expense) {
    setGroups(prev => {
      const next = prev.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, expenses: [expense, ...(g.expenses || [])] };
      });
      writeLocalGroups(next);
      return next;
    });
    if (userIdRef.current) addGroupExpense(groupId, expense).catch(console.error);
    setToast('EXPENSE ADDED');
    goGroupDetail(groupId);
  }

  async function handleJoinGroup(code) {
    if (!userIdRef.current) return;
    try {
      const group = await joinGroupByCode(userIdRef.current, code);
      if (!group) { setToast('INVALID CODE'); return; }
      setGroups(prev => {
        const already = prev.find(g => g.id === group.id);
        const next = already ? prev : [group, ...prev];
        writeLocalGroups(next);
        return next;
      });
      setToast('GROUP JOINED!');
      goGroupDetail(group.id);
    } catch {
      setToast('INVALID CODE');
    }
  }

  async function handleSignOut() {
    realtimeRef.current?.unsubscribe();
    setMenuOpen(false);
    await getSupabase().auth.signOut();
  }

  // ── Clipboard ────────────────────────────────────────────────────────────
  function copyToClipboard(s) {
    try {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(s);
      else {
        const ta = document.createElement('textarea');
        ta.value = s; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); ta.remove();
      }
    } catch {}
  }

  // ── Guard: stale routes ──────────────────────────────────────────────────
  const currentExpense = (route.name === 'detail' || route.name === 'edit')
    ? expenses.find(e => e.id === route.id) : null;
  const currentGroup = (route.name === 'group-detail' || route.name === 'group-add-expense' || route.name === 'group-expense-detail')
    ? groups.find(g => g.id === (route.id || route.groupId)) : null;

  useEffect(() => {
    if ((route.name === 'detail' || route.name === 'edit') && !currentExpense && !dataLoading) setRoute({ name: 'home' });
  }, [route, currentExpense, dataLoading]);
  useEffect(() => {
    if ((route.name === 'group-detail' || route.name === 'group-add-expense' || route.name === 'group-expense-detail') && !currentGroup && !dataLoading) setRoute({ name: 'home' });
  }, [route, currentGroup, dataLoading]);

  // ── Loading screen ───────────────────────────────────────────────────────
  if (dataLoading) {
    return React.createElement('div', { className: 'screen', style: { display: 'grid', placeItems: 'center' } },
      React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'bob' }, React.createElement(SlimeSprite, { size: 80 })),
        React.createElement('div', { className: 'empty-title' }, 'LOADING...')
      )
    );
  }

  // ── Screen routing ───────────────────────────────────────────────────────
  let screen;
  if (route.name === 'home') {
    screen = React.createElement(HomeScreen, {
      expenses, groups,
      onAdd: goAdd, onOpen: goDetail, onStats: goStats, onMenu: () => setMenuOpen(true),
      onCreateGroup: goCreateGroup, onOpenGroup: goGroupDetail,
      onJoinGroup: handleJoinGroup,
    });
  } else if (route.name === 'add') {
    screen = React.createElement(AddEditScreen, { mode: 'add', onSave: handleSave, onCancel: goHome });
  } else if (route.name === 'edit' && currentExpense) {
    screen = React.createElement(AddEditScreen, {
      mode: 'edit', initial: currentExpense,
      onSave: handleSave,
      onCancel: () => goDetail(currentExpense.id),
      onDelete: () => handleDelete(currentExpense.id),
    });
  } else if (route.name === 'detail' && currentExpense) {
    screen = React.createElement(DetailScreen, {
      expense: currentExpense, onBack: goHome,
      onEdit: () => goEdit(currentExpense.id),
      onDelete: () => handleDelete(currentExpense.id),
      onShare: () => setShareTarget(currentExpense),
    });
  } else if (route.name === 'stats') {
    screen = React.createElement(StatsScreen, { expenses, onBack: goHome });
  } else if (route.name === 'create-group') {
    screen = React.createElement(CreateGroupScreen, { onSave: handleSaveGroup, onCancel: goHome });
  } else if (route.name === 'group-detail' && currentGroup) {
    screen = React.createElement(GroupDetailScreen, {
      group: currentGroup,
      onBack: goHome,
      onAddExpense: () => goGroupAddExp(currentGroup.id),
      onDeleteGroup: () => handleDeleteGroup(currentGroup.id),
      onOpenExpense: (expId) => goGroupExpDetail(currentGroup.id, expId),
      onGenerateCode: () => handleGenerateCode(currentGroup.id),
    });
  } else if (route.name === 'group-expense-detail' && currentGroup) {
    const currentGroupExp = (currentGroup.expenses || []).find(e => e.id === route.expId);
    if (currentGroupExp) {
      screen = React.createElement(GroupExpenseDetailScreen, {
        expense: currentGroupExp,
        group: currentGroup,
        onBack: () => goGroupDetail(currentGroup.id),
      });
    }
  } else if (route.name === 'group-add-expense' && currentGroup) {
    screen = React.createElement(GroupAddExpenseScreen, {
      group: currentGroup,
      onSave: (exp) => handleSaveGroupExpense(currentGroup.id, exp),
      onCancel: () => goGroupDetail(currentGroup.id),
    });
  }

  return React.createElement(React.Fragment, null,
    screen,
    menuOpen && React.createElement(MenuSheet, {
      onClose: () => setMenuOpen(false),
      onShareAll: handleShareAll,
      onResetDemo: handleResetDemo,
      onClearAll: handleClearAll,
      onSignOut: handleSignOut,
    }),
    shareTarget && React.createElement(ShareSheet, {
      expense: shareTarget,
      onClose: () => setShareTarget(null),
      onCopy: (text) => { copyToClipboard(text); setShareTarget(null); setToast('COPIED TO SHARE'); },
    }),
    React.createElement(Toast, { msg: toast, onDone: () => setToast('') })
  );
}
