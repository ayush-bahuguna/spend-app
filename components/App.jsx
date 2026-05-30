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
import { CarScreen, CarAddScreen, CarTripDetailScreen } from './car';
import { getSupabase } from '../lib/supabase';
import {
  fetchExpenses, upsertExpense, deleteExpense, upsertManyExpenses,
  fetchGroups, createGroup, deleteGroup, addGroupExpense, joinGroupByCode, upsertManyGroups, updateGroupJoinCode,
  fetchCarTrips, upsertCarTrip, deleteCarTrip,
} from '../lib/db';

const STORAGE_KEY   = 'spend_expenses_v1';
const GROUPS_KEY    = 'spend_groups_v1';
const CAR_TRIPS_KEY = 'spend_car_trips_v1';


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
function readLocalCarTrips() {
  try {
    const raw = localStorage.getItem(CAR_TRIPS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function writeLocalCarTrips(list) {
  try { localStorage.setItem(CAR_TRIPS_KEY, JSON.stringify(list)); } catch {}
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
  const [carTrips,    setCarTrips]    = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [route,       setRoute]       = useState({ name: 'home' });
  const [toast,       setToast]       = useState('');
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const userIdRef   = useRef(null);
  const userNameRef = useRef('ME');
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
      const userMeta = session.user.user_metadata;
      userNameRef.current = (userMeta?.full_name || userMeta?.name || session.user.email?.split('@')[0] || 'ME').toUpperCase();

      // Warm-start from cache
      const cachedExp    = readLocalExpenses();
      const cachedGroups = readLocalGroups();
      const cachedTrips  = readLocalCarTrips();
      if (cachedExp.length)    setExpenses(cachedExp);
      if (cachedGroups.length) setGroups(cachedGroups);
      if (cachedTrips.length)  setCarTrips(cachedTrips);

      // One-time migration of pre-auth localStorage data
      await maybeRunMigration(userId, cachedExp, cachedGroups);

      // Fetch from Supabase (source of truth)
      let remoteExp = [], remoteGroups = [], remoteTrips = [];
      try {
        [remoteExp, remoteGroups, remoteTrips] = await Promise.all([
          fetchExpenses(userId),
          fetchGroups(userId),
          fetchCarTrips(userId),
        ]);
      } catch (e) {
        console.warn('DB fetch failed, using cache/sample:', e);
      }
      if (cancelled) return;

      const finalExp    = remoteExp.length    ? remoteExp    : (cachedExp.length    ? cachedExp    : []);
      const finalGroups = remoteGroups.length ? remoteGroups : (cachedGroups.length ? cachedGroups : []);
      const finalTrips  = remoteTrips.length  ? remoteTrips  : cachedTrips;

      setExpenses(finalExp);
      setGroups(finalGroups);
      setCarTrips(finalTrips);
      writeLocalExpenses(finalExp);
      writeLocalGroups(finalGroups);
      writeLocalCarTrips(finalTrips);
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

  // Refetch groups when app becomes visible (tab switch, phone un-lock, etc.)
  // This is a reliable fallback when the realtime subscription has dropped.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && userIdRef.current) {
        fetchGroups(userIdRef.current)
          .then(updated => { setGroups(updated); writeLocalGroups(updated); })
          .catch(() => {});
      }
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

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

  // ── Group mutations ──────────────────────────────────────────────────────
  async function handleSaveGroup(group) {
    const creatorMember = {
      id:   'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      name: userNameRef.current,
    };
    const groupWithCreator = { ...group, creatorMember };
    const withCode = userIdRef.current
      ? await createGroup(userIdRef.current, groupWithCreator).catch(() => groupWithCreator)
      : groupWithCreator;
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

  // ── Car mutations ────────────────────────────────────────────────────────
  function handleSaveCarEntry(type, entry) {
    if (type === 'trip') {
      setCarTrips(prev => {
        const next = [...prev.filter(t => t.id !== entry.id), entry]
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        writeLocalCarTrips(next);
        return next;
      });
      if (userIdRef.current) upsertCarTrip(userIdRef.current, entry).catch(console.error);
      setToast('TRIP SAVED');
    } else {
      let next;
      setExpenses(prev => {
        next = [entry, ...prev];
        return next;
      });
      setTimeout(() => {
        writeLocalExpenses(next);
        if (userIdRef.current) upsertExpense(userIdRef.current, entry).catch(console.error);
      }, 0);
      setToast('EXPENSE ADDED');
    }
    setRoute({ name: 'car' });
  }

  function handleDeleteCarTrip(id) {
    setCarTrips(prev => {
      const next = prev.filter(t => t.id !== id);
      writeLocalCarTrips(next);
      return next;
    });
    if (userIdRef.current) deleteCarTrip(id).catch(console.error);
    setToast('TRIP DELETED');
    setRoute({ name: 'car' });
  }

  async function handleSaveGroupExpense(groupId, expense) {
    // Optimistic update
    setGroups(prev => {
      const next = prev.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, expenses: [expense, ...(g.expenses || [])] };
      });
      writeLocalGroups(next);
      return next;
    });
    goGroupDetail(groupId);
    if (userIdRef.current) {
      try {
        await addGroupExpense(groupId, expense);
        setToast('EXPENSE ADDED');
      } catch (e) {
        console.error('addGroupExpense failed:', e);
        setToast('SAVE FAILED');
      }
    } else {
      setToast('EXPENSE ADDED');
    }
  }

  async function handleJoinGroup(code) {
    if (!userIdRef.current) return;
    try {
      const group = await joinGroupByCode(userIdRef.current, code, userNameRef.current);
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
      currentUserId: userIdRef.current,
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
      currentUserId: userIdRef.current,
      onSave: (exp) => handleSaveGroupExpense(currentGroup.id, exp),
      onCancel: () => goGroupDetail(currentGroup.id),
    });
  } else if (route.name === 'car') {
    screen = React.createElement(CarScreen, {
      trips: carTrips, expenses,
      onBack: goHome,
      onAdd: (type) => setRoute({ name: 'car-add', addType: type }),
      onOpenTrip: (id) => setRoute({ name: 'car-trip-detail', tripId: id }),
      onOpenExpense: (id) => goDetail(id),
    });
  } else if (route.name === 'car-add') {
    screen = React.createElement(CarAddScreen, {
      type: route.addType,
      onSave: handleSaveCarEntry,
      onCancel: () => setRoute({ name: 'car' }),
    });
  } else if (route.name === 'car-trip-detail') {
    const trip = carTrips.find(t => t.id === route.tripId);
    if (trip) screen = React.createElement(CarTripDetailScreen, {
      trip,
      onBack: () => setRoute({ name: 'car' }),
      onDelete: () => handleDeleteCarTrip(trip.id),
    });
  }

  return React.createElement(React.Fragment, null,
    screen,
    menuOpen && React.createElement(MenuSheet, {
      onClose: () => setMenuOpen(false),
      onSignOut: handleSignOut,
      onCarTracker: () => { setMenuOpen(false); setRoute({ name: 'car' }); },
    }),
    shareTarget && React.createElement(ShareSheet, {
      expense: shareTarget,
      onClose: () => setShareTarget(null),
      onCopy: (text) => { copyToClipboard(text); setShareTarget(null); setToast('COPIED TO SHARE'); },
    }),
    React.createElement(Toast, { msg: toast, onDone: () => setToast('') })
  );
}
