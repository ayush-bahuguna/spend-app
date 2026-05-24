'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Toast } from './ui';
import {
  HomeScreen, AddEditScreen, DetailScreen, StatsScreen, MenuSheet, ShareSheet,
} from './screens';
import {
  CreateGroupScreen, GroupDetailScreen, GroupAddExpenseScreen, GroupExpenseDetailScreen,
} from './groups';

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

const SAMPLE_GROUPS = [
  {
    id: 'sg1',
    name: 'TRIP TO GOA',
    createdAt: makeDate(10),
    members: [
      { id: 'mg1', name: 'YOU' },
      { id: 'mg2', name: 'PRIYA' },
      { id: 'mg3', name: 'RAHUL' },
    ],
    expenses: [
      {
        id: 'sge1', amount: 1800, category: 'travel', date: makeDate(8),
        note: 'FLIGHT TICKETS', paidById: 'mg1', splitType: 'equal',
        splits: [
          { memberId: 'mg1', name: 'YOU',   value: 600 },
          { memberId: 'mg2', name: 'PRIYA', value: 600 },
          { memberId: 'mg3', name: 'RAHUL', value: 600 },
        ],
      },
      {
        id: 'sge2', amount: 960, category: 'food', date: makeDate(7),
        note: 'DINNER', paidById: 'mg2', splitType: 'equal',
        splits: [
          { memberId: 'mg1', name: 'YOU',   value: 320 },
          { memberId: 'mg2', name: 'PRIYA', value: 320 },
          { memberId: 'mg3', name: 'RAHUL', value: 320 },
        ],
      },
    ],
  },
];

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : SAMPLE;
  } catch { return SAMPLE; }
}
function saveExpenses(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

function loadGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) return SAMPLE_GROUPS;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : SAMPLE_GROUPS;
  } catch { return SAMPLE_GROUPS; }
}
function saveGroups(list) {
  try { localStorage.setItem(GROUPS_KEY, JSON.stringify(list)); } catch {}
}

export default function App() {
  const [expenses, setExpenses] = useState(loadExpenses);
  const [groups,   setGroups]   = useState(loadGroups);
  const [route,    setRoute]    = useState({ name: 'home' });
  const [toast,    setToast]    = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);

  useEffect(() => { saveExpenses(expenses); }, [expenses]);
  useEffect(() => { saveGroups(groups); },   [groups]);

  useEffect(() => {
    try {
      const r = localStorage.getItem('spend_route_v1');
      if (r) setRoute(JSON.parse(r));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('spend_route_v1', JSON.stringify(route)); } catch {}
  }, [route]);

  const goHome          = useCallback(() => setRoute({ name: 'home' }), []);
  const goAdd           = useCallback(() => setRoute({ name: 'add' }), []);
  const goEdit          = useCallback((id) => setRoute({ name: 'edit', id }), []);
  const goDetail        = useCallback((id) => setRoute({ name: 'detail', id }), []);
  const goStats         = useCallback(() => setRoute({ name: 'stats' }), []);
  const goCreateGroup   = useCallback(() => setRoute({ name: 'create-group' }), []);
  const goGroupDetail   = useCallback((id) => setRoute({ name: 'group-detail', id }), []);
  const goGroupAddExp     = useCallback((id) => setRoute({ name: 'group-add-expense', id }), []);
  const goGroupExpDetail  = useCallback((groupId, expId) => setRoute({ name: 'group-expense-detail', groupId, expId }), []);

  function handleSave(expense) {
    setExpenses(prev => {
      const idx = prev.findIndex(e => e.id === expense.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = expense; return next; }
      return [expense, ...prev];
    });
    setToast(route.name === 'edit' ? 'EXPENSE UPDATED' : 'EXPENSE ADDED');
    goHome();
  }
  function handleDelete(id) {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setToast('EXPENSE DELETED');
    goHome();
  }
  function handleClearAll()  { setExpenses([]); setMenuOpen(false); setToast('ALL CLEARED'); goHome(); }
  function handleResetDemo() { setExpenses(SAMPLE); setGroups(SAMPLE_GROUPS); setMenuOpen(false); setToast('DEMO DATA RESET'); goHome(); }
  function handleShareAll()  {
    setMenuOpen(false);
    const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const text = `My spend log: ${expenses.length} entries totalling ₹${Math.round(total).toLocaleString('en-IN')}`;
    copyToClipboard(text);
    setToast('LOG COPIED');
  }

  function handleSaveGroup(group) {
    setGroups(prev => [group, ...prev]);
    setToast('GROUP CREATED');
    goGroupDetail(group.id);
  }
  function handleDeleteGroup(id) {
    setGroups(prev => prev.filter(g => g.id !== id));
    setToast('GROUP DELETED');
    goHome();
  }
  function handleSaveGroupExpense(groupId, expense) {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, expenses: [...(g.expenses || []), expense] };
    }));
    setToast('EXPENSE ADDED');
    goGroupDetail(groupId);
  }

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

  const currentExpense = (route.name === 'detail' || route.name === 'edit')
    ? expenses.find(e => e.id === route.id) : null;
  const currentGroup = (route.name === 'group-detail' || route.name === 'group-add-expense' || route.name === 'group-expense-detail')
    ? groups.find(g => g.id === (route.id || route.groupId)) : null;

  useEffect(() => {
    if ((route.name === 'detail' || route.name === 'edit') && !currentExpense) setRoute({ name: 'home' });
  }, [route, currentExpense]);
  useEffect(() => {
    if ((route.name === 'group-detail' || route.name === 'group-add-expense' || route.name === 'group-expense-detail') && !currentGroup) setRoute({ name: 'home' });
  }, [route, currentGroup]);

  let screen;
  if (route.name === 'home') {
    screen = React.createElement(HomeScreen, {
      expenses, groups,
      onAdd: goAdd, onOpen: goDetail, onStats: goStats, onMenu: () => setMenuOpen(true),
      onCreateGroup: goCreateGroup, onOpenGroup: goGroupDetail,
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
    }),
    shareTarget && React.createElement(ShareSheet, {
      expense: shareTarget,
      onClose: () => setShareTarget(null),
      onCopy: (text) => { copyToClipboard(text); setShareTarget(null); setToast('COPIED TO SHARE'); },
    }),
    React.createElement(Toast, { msg: toast, onDone: () => setToast('') })
  );
}
