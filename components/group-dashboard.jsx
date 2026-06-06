'use client';
import React, { useState, useMemo } from 'react';
import {
  CATEGORIES, SlimeSprite,
  BackGlyph,
} from './icons';

import {
  PixelButton, IconButton, CardHeader, MainCard, TabBtn,
  formatINR,
} from './ui';
import { calcBalances } from './groups';

const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const MEMBER_COLORS = ['#4a7a3a', '#5a8ed4', '#d36ba0', '#e8b84a', '#a677d0', '#c07a3a', '#3a9a8a'];

function monthKey(iso) {
  const d = new Date(iso);
  return d.getFullYear() + '-' + String(d.getMonth()).padStart(2, '0');
}
function monthLabel(key) {
  const [y, m] = key.split('-');
  return MONTHS_SHORT[Number(m)] + ' ' + y;
}

function DashBar({ name, value, max, color, sub }) {
  const pct = max > 0 ? Math.max(value > 0 ? 4 : 0, Math.round((value / max) * 100)) : 0;
  return React.createElement('div', { className: 'dash-bar' },
    React.createElement('div', { className: 'dash-bar-head' },
      React.createElement('span', { className: 'dash-bar-name' }, name),
      React.createElement('span', { className: 'dash-bar-val' }, formatINR(value))
    ),
    React.createElement('div', { className: 'dash-bar-track' },
      React.createElement('div', { className: 'dash-bar-fill', style: { width: pct + '%', background: color } })
    ),
    sub ? React.createElement('div', { className: 'dash-bar-sub' }, sub) : null
  );
}

export function GroupDashboardScreen({ group, currentUserId, allCategories, onBack }) {
  const [tab, setTab] = useState('members');

  const members = group.members || [];
  const expenses = group.expenses || [];

  const memberColor = useMemo(() => {
    const map = {};
    members.forEach((m, i) => { map[m.id] = MEMBER_COLORS[i % MEMBER_COLORS.length]; });
    return map;
  }, [members]);

  const nameWithYou = (m) => (currentUserId && m.userId === currentUserId)
    ? m.name + ' (YOU)' : m.name;

  const { memberSpent, memberPaid, total } = useMemo(() => {
    const spent = {}, paid = {};
    members.forEach(m => { spent[m.id] = 0; paid[m.id] = 0; });
    let t = 0;
    expenses.forEach(exp => {
      t += Number(exp.amount || 0);
      if (paid[exp.paidById] !== undefined) paid[exp.paidById] += Number(exp.amount || 0);
      (exp.splits || []).forEach(s => {
        if (spent[s.memberId] !== undefined) spent[s.memberId] += Number(s.value || 0);
      });
    });
    return { memberSpent: spent, memberPaid: paid, total: t };
  }, [members, expenses]);

  const balances = useMemo(() => calcBalances(group), [group]);
  const myMember = members.find(m => currentUserId && m.userId === currentUserId);
  const myBalance = myMember ? Math.round((balances[myMember.id] || 0) * 100) / 100 : 0;

  const months = useMemo(() => {
    const map = {};
    expenses.forEach(exp => {
      const k = monthKey(exp.date);
      if (!map[k]) map[k] = { key: k, total: 0, byMember: {}, byCat: {} };
      const bucket = map[k];
      const amt = Number(exp.amount || 0);
      bucket.total += amt;
      bucket.byCat[exp.category] = (bucket.byCat[exp.category] || 0) + amt;
      if (exp.paidById) {
        bucket.byMember[exp.paidById] = (bucket.byMember[exp.paidById] || 0) + amt;
      }
    });
    return Object.values(map).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [expenses]);

  const header = React.createElement(CardHeader, {
    title: 'DASHBOARD',
    subtitle: group.name.length > 12 ? group.name.slice(0, 12) + '…' : group.name,
    left: React.createElement(IconButton, { onClick: onBack }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement('div'),
  });

  const footer = React.createElement(PixelButton, { ghost: true, onClick: onBack }, 'BACK TO GROUP');

  const tabBar = React.createElement('div', { style: { display: 'flex', gap: 6 } },
    [{ id: 'members', label: 'MEMBERS' }, { id: 'months', label: 'BY MONTH' }, { id: 'category', label: 'CATEGORY' }].map(t =>
      React.createElement(TabBtn, {
        key: t.id, label: t.label, active: tab === t.id, style: { flex: 1 },
        onClick: () => setTab(t.id),
      })
    )
  );

  const emptyState = React.createElement('div', { className: 'empty-state', style: { padding: '24px 0' } },
    React.createElement('div', { className: 'bob' }, React.createElement(SlimeSprite, { size: 70 })),
    React.createElement('div', { className: 'empty-title', style: { fontSize: 11 } }, 'NO EXPENSES YET'),
    React.createElement('div', { className: 'empty-sub' }, 'ADD SOME TO SEE STATS')
  );

  let content;
  if (expenses.length === 0) {
    content = emptyState;
  } else if (tab === 'members') {
    const max = Math.max(1, ...members.map(m => memberPaid[m.id] || 0));
    const ranked = [...members].sort((a, b) => (memberPaid[b.id] || 0) - (memberPaid[a.id] || 0));

    const balanceChip = myMember
      ? React.createElement('div', { className: 'dash-net-chip' },
          myBalance > 0.5
            ? 'OWED YOU ' + formatINR(myBalance)
            : myBalance < -0.5
              ? 'YOU OWE ' + formatINR(Math.abs(myBalance))
              : 'YOU ARE SETTLED'
        )
      : null;

    content = React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'dash-hero' },
        React.createElement('div', { className: 'dash-hero-inner' },
          React.createElement('div', { className: 'dash-hero-label' }, 'TOTAL GROUP SPEND'),
          React.createElement('div', { className: 'dash-hero-num' }, formatINR(total))
        )
      ),
      balanceChip,
      React.createElement('div', { className: 'dash-section-label' }, 'WHO PAID HOW MUCH'),
      React.createElement('div', { className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner', style: { display: 'block', padding: '14px 14px' } },
          React.createElement('div', { className: 'dash-bars' },
            ranked.map(m => React.createElement(DashBar, {
              key: m.id, name: nameWithYou(m),
              value: memberPaid[m.id] || 0, max,
              color: memberColor[m.id],
              sub: 'SHARE ' + formatINR(memberSpent[m.id] || 0),
            }))
          )
        )
      ),
      React.createElement('div', { className: 'dash-foot-note' },
        'PAID = OUT OF POCKET  •  SHARE = OWED PORTION')
    );
  } else if (tab === 'months') {
    content = React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'dash-section-label' }, 'WHO PAID · BY MONTH'),
      ...months.map(mo => {
        const max = Math.max(1, ...members.map(m => mo.byMember[m.id] || 0));
        const ranked = [...members]
          .filter(m => (mo.byMember[m.id] || 0) > 0)
          .sort((a, b) => (mo.byMember[b.id] || 0) - (mo.byMember[a.id] || 0));
        return React.createElement('div', { key: mo.key, className: 'cell is-flat' },
          React.createElement('div', { className: 'cell-inner', style: { display: 'block', padding: '14px 14px' } },
            React.createElement('div', { className: 'dash-month-head' },
              React.createElement('span', { className: 'dash-month-name' }, monthLabel(mo.key)),
              React.createElement('span', { className: 'dash-month-total' }, formatINR(mo.total))
            ),
            React.createElement('div', { className: 'dash-bars' },
              ranked.map(m => React.createElement(DashBar, {
                key: m.id, name: nameWithYou(m),
                value: mo.byMember[m.id] || 0, max,
                color: memberColor[m.id],
              }))
            )
          )
        );
      })
    );
  } else {
    content = React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'dash-section-label' }, 'SPEND BY CATEGORY · MONTH'),
      ...months.map(mo => {
        const catMap = allCategories || CATEGORIES;
        const cats = Object.keys(mo.byCat)
          .map(id => ({ id, cat: catMap[id] || catMap.other || CATEGORIES.other, amount: mo.byCat[id] }))
          .sort((a, b) => b.amount - a.amount);
        const max = Math.max(1, ...cats.map(c => c.amount));
        return React.createElement('div', { key: mo.key, className: 'cell is-flat' },
          React.createElement('div', { className: 'cell-inner', style: { display: 'block', padding: '14px 14px' } },
            React.createElement('div', { className: 'dash-month-head' },
              React.createElement('span', { className: 'dash-month-name' }, monthLabel(mo.key)),
              React.createElement('span', { className: 'dash-month-total' }, formatINR(mo.total))
            ),
            React.createElement('div', { className: 'dash-bars' },
              cats.map(c => React.createElement(DashBar, {
                key: c.id, name: c.cat.label,
                value: c.amount, max,
                color: c.cat.color,
              }))
            )
          )
        );
      })
    );
  }

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },
      tabBar,
      React.createElement('div', { style: { height: 4 } }),
      content
    )
  );
}
