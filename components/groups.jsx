'use client';
import React, { useState, useMemo } from 'react';
import {
  CATEGORIES, SlimeSprite,
  BackGlyph, PlusGlyph, TrashGlyph, SaveGlyph, PeopleGlyph, SplitGlyph, CheckGlyph,
  MoneyBagGlyph, FolderGlyph, CalendarGlyph, NoteGlyph, ShareGlyph,
  GroupPeopleIcon, GroupHomeIcon, GroupStarIcon, GroupHeartIcon, TravelIcon,
} from './icons';
import {
  PixelButton, IconButton, CardHeader, MainCard, Sheet, Calendar, TabBtn,
  formatINR, formatDateShort, formatDateInput,
} from './ui';

const GROUP_ICONS = [
  { id: 'people', Icon: GroupPeopleIcon, label: 'PEOPLE'    },
  { id: 'travel', Icon: TravelIcon,      label: 'TRAVEL'    },
  { id: 'home',   Icon: GroupHomeIcon,   label: 'HOME'      },
  { id: 'star',   Icon: GroupStarIcon,   label: 'FAVOURITE' },
  { id: 'heart',  Icon: GroupHeartIcon,  label: 'LOVED'     },
];

const GROUP_CLIP = 'polygon(0 6px,3px 6px,3px 3px,6px 3px,6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px))';

export function calcBalances(group) {
  const bal = {};
  (group.members || []).forEach(m => { bal[m.id] = 0; });
  (group.expenses || []).forEach(exp => {
    if (bal[exp.paidById] !== undefined) bal[exp.paidById] += Number(exp.amount || 0);
    (exp.splits || []).forEach(s => {
      if (bal[s.memberId] !== undefined) bal[s.memberId] -= Number(s.value || 0);
    });
  });
  return bal;
}

export function GroupCard({ group, onClick }) {
  const total = (group.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const n = (group.members || []).length;
  const label = group.name.length > 13 ? group.name.slice(0, 13) + '…' : group.name;
  const iconEntry = GROUP_ICONS.find(ic => ic.id === group.icon) || GROUP_ICONS[0];
  return React.createElement('div', { className: 'cell', onClick },
    React.createElement('div', { className: 'cell-inner' },
      React.createElement('div', { className: 'row', style: { width: '100%' } },
        React.createElement('div', { className: 'icon-tile' },
          React.createElement('div', { className: 'icon-tile-inner' },
            React.createElement(iconEntry.Icon, { size: 28 })
          )
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'cat-name' }, label),
          React.createElement('div', { className: 'cat-date' }, n + ' MEMBERS')
        ),
        React.createElement('div', { className: 'amount' }, formatINR(total)),
        React.createElement('div', { className: 'chev' }, '›')
      )
    )
  );
}

export function GroupsTabContent({ groups, onOpenGroup }) {
  if (!groups || groups.length === 0) {
    return React.createElement('div', { className: 'empty-state' },
      React.createElement('div', { className: 'bob' }, React.createElement(SlimeSprite, { size: 80 })),
      React.createElement('div', { className: 'empty-title' }, 'NO GROUPS'),
      React.createElement('div', { className: 'empty-sub' }, 'TAP NEW GROUP TO START')
    );
  }
  return React.createElement('div', { className: 'list-body' },
    groups.map(g => React.createElement(GroupCard, { key: g.id, group: g, onClick: () => onOpenGroup(g.id) }))
  );
}

export function CreateGroupScreen({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);
  const [iconIndex, setIconIndex] = useState(0);

  const iconEntry = GROUP_ICONS[iconIndex];

  function addMember() {
    const t = memberInput.trim().toUpperCase();
    if (!t || members.some(m => m.name === t)) { setMemberInput(''); return; }
    setMembers(prev => [...prev, {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      name: t,
    }]);
    setMemberInput('');
  }

  const isValid = name.trim().length > 0 && members.length >= 2;

  function handleSave() {
    if (!isValid) return;
    onSave({
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: name.trim().toUpperCase(),
      icon: iconEntry.id,
      createdAt: new Date().toISOString(),
      members,
      expenses: [],
    });
  }

  const header = React.createElement(CardHeader, {
    title: 'NEW GROUP', subtitle: 'CREATE A GROUP',
    left: React.createElement(IconButton, { onClick: onCancel }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement('div'),
  });

  const footer = React.createElement(PixelButton, {
    onClick: handleSave, disabled: !isValid,
    icon: React.createElement(SaveGlyph, { size: 14 }),
  }, 'CREATE GROUP');

  const arrowStyle = {
    width: 32, height: 32, display: 'grid', placeItems: 'center',
    cursor: 'pointer', fontFamily: "'Press Start 2P', monospace",
    fontSize: 13, color: '#1a1610', userSelect: 'none', flexShrink: 0,
  };

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },

      /* Icon picker */
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 0 4px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
          React.createElement('div', { style: arrowStyle, onClick: () => setIconIndex(i => (i - 1 + GROUP_ICONS.length) % GROUP_ICONS.length) }, '◀'),
          React.createElement('div', { style: { width: 68, height: 68, padding: 3, background: '#1a1610', display: 'grid', placeItems: 'center', clipPath: GROUP_CLIP } },
            React.createElement('div', { style: { background: '#f4ead0', width: '100%', height: '100%', display: 'grid', placeItems: 'center', clipPath: GROUP_CLIP } },
              React.createElement(iconEntry.Icon, { size: 48 })
            )
          ),
          React.createElement('div', { style: arrowStyle, onClick: () => setIconIndex(i => (i + 1) % GROUP_ICONS.length) }, '▶'),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 5, marginTop: 2 } },
          GROUP_ICONS.map((_, i) => React.createElement('div', {
            key: i,
            style: {
              width: i === iconIndex ? 8 : 5,
              height: i === iconIndex ? 8 : 5,
              background: i === iconIndex ? '#1a1610' : '#c8b88a',
              transition: 'all 0.15s',
            },
          }))
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' },
          React.createElement(PeopleGlyph, { size: 16 }), 'GROUP NAME'
        ),
        React.createElement('div', { className: 'field' },
          React.createElement('div', { className: 'field-inner', style: { cursor: 'text' } },
            React.createElement('input', {
              type: 'text', value: name, placeholder: 'E.G. TRIP TO GOA',
              maxLength: 24,
              onChange: e => setName(e.target.value.toUpperCase()),
            })
          )
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' },
          React.createElement(PeopleGlyph, { size: 16 }), 'MEMBERS (MIN 2)'
        ),
        React.createElement('div', { style: { display: 'flex', gap: 6 } },
          React.createElement('div', { className: 'field', style: { flex: 1 } },
            React.createElement('div', { className: 'field-inner' },
              React.createElement('input', {
                type: 'text', value: memberInput, placeholder: 'NAME...',
                maxLength: 16,
                onChange: e => setMemberInput(e.target.value.toUpperCase()),
                onKeyDown: e => { if (e.key === 'Enter') addMember(); },
              })
            )
          ),
          React.createElement(PixelButton, {
            onClick: addMember,
            icon: React.createElement(PlusGlyph, { size: 14 }),
            style: { width: 52, flexShrink: 0 },
          }, '')
        )
      ),

      members.length > 0 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
        members.map(m => React.createElement('div', { key: m.id, className: 'cell is-flat' },
          React.createElement('div', { className: 'cell-inner' },
            React.createElement('span', { className: 'font-pixel', style: { fontSize: 11, flex: 1 } }, m.name),
            React.createElement('div', {
              style: { cursor: 'pointer', padding: '2px 4px' },
              onClick: () => setMembers(prev => prev.filter(x => x.id !== m.id)),
            }, React.createElement(TrashGlyph, { size: 12 }))
          )
        ))
      ),

      members.length < 2 && React.createElement('div', {
        className: 'font-pixel',
        style: { fontSize: 8, color: 'var(--ink-faint)', textAlign: 'center', padding: '6px 0' },
      }, members.length === 1 ? 'ADD 1 MORE MEMBER' : 'ADD AT LEAST 2 MEMBERS')
    )
  );
}

function GroupExpenseCard({ exp, group, onClick }) {
  const cat = CATEGORIES[exp.category] || CATEGORIES.other;
  const myId = group.members[0]?.id;
  const mySplt = (exp.splits || []).find(s => s.memberId === myId);
  const myAmt = mySplt ? Number(mySplt.value) : 0;
  const iPaid = exp.paidById === myId;
  const othersOweMe = iPaid ? Math.round((Number(exp.amount) - myAmt) * 100) / 100 : 0;
  const iOwe = !iPaid && myAmt > 0.01 ? myAmt : 0;
  const hasOweLine = othersOweMe > 0.5 || iOwe > 0.5;

  return React.createElement('div', { className: 'cell', onClick },
    React.createElement('div', { className: 'cell-inner', style: { flexDirection: 'column', alignItems: 'stretch', gap: 0, padding: 0 } },
      React.createElement('div', { style: { padding: hasOweLine ? '10px 12px 3px' : '10px 12px' } },
        React.createElement('div', { className: 'row', style: { width: '100%' } },
          React.createElement('div', { className: 'icon-tile' },
            React.createElement('div', { className: 'icon-tile-inner' },
              React.createElement(cat.Icon, { size: 30 })
            )
          ),
          React.createElement('div', null,
            React.createElement('div', { className: 'cat-name' }, cat.label),
            React.createElement('div', { className: 'cat-date' }, formatDateShort(exp.date)),
            exp.note ? React.createElement('div', { className: 'cat-date', style: { marginTop: 3 } }, exp.note) : null
          ),
          React.createElement('div', { className: 'amount' }, formatINR(exp.amount)),
          React.createElement('div', { className: 'chev' }, '›')
        )
      ),
      hasOweLine && React.createElement('div', { style: { paddingLeft: 66, paddingTop: 5, paddingBottom: 11 } },
        React.createElement('span', { className: 'font-pixel', style: {
          fontSize: 8,
          color: othersOweMe > 0.5 ? 'var(--green-dark)' : '#b83030',
        } },
          othersOweMe > 0.5
            ? 'OTHERS OWE YOU ' + formatINR(othersOweMe)
            : 'YOU OWE ' + formatINR(iOwe)
        )
      )
    )
  );
}

export function GroupDetailScreen({ group, onBack, onAddExpense, onDeleteGroup, onOpenExpense }) {
  const [tab, setTab] = useState('expenses');
  const [shareLabel, setShareLabel] = useState('INVITE');
  const [codeCopied, setCodeCopied] = useState(false);
  const balances = useMemo(() => calcBalances(group), [group]);
  const total = (group.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const title = group.name.length > 11 ? group.name.slice(0, 11) + '…' : group.name;

  function handleShareInvite() {
    if (!group.joinCode) return;
    const msg = `Join "${group.name}" on Spend! Enter code ${group.joinCode} in the Groups tab.`;
    if (navigator.share) {
      navigator.share({ title: 'Join my Spend group', text: msg })
        .then(() => { setShareLabel('SHARED!'); setTimeout(() => setShareLabel('INVITE'), 2000); })
        .catch(() => {});
    } else {
      try {
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(msg);
        else {
          const ta = document.createElement('textarea');
          ta.value = msg; document.body.appendChild(ta);
          ta.select(); document.execCommand('copy'); ta.remove();
        }
        setShareLabel('COPIED!');
        setTimeout(() => setShareLabel('INVITE'), 2000);
      } catch {}
    }
  }

  const header = React.createElement(CardHeader, {
    title, subtitle: group.members.length + ' MEMBERS',
    left: React.createElement(IconButton, { onClick: onBack }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement(IconButton, { onClick: onDeleteGroup }, React.createElement(TrashGlyph, { size: 16 })),
  });

  const footer = group.joinCode
    ? React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement(PixelButton, {
          ghost: true, onClick: handleShareInvite,
          icon: React.createElement(ShareGlyph, { size: 14 }),
          style: { flex: 1 },
        }, shareLabel),
        React.createElement(PixelButton, {
          onClick: onAddExpense,
          icon: React.createElement(PlusGlyph, { size: 14 }),
          style: { flex: 1 },
        }, 'ADD EXPENSE')
      )
    : React.createElement(PixelButton, {
        onClick: onAddExpense, icon: React.createElement(PlusGlyph, { size: 14 }),
      }, 'ADD EXPENSE');

  const tabBar = React.createElement('div', { style: { display: 'flex', gap: 6 } },
    ['EXPENSES', 'BALANCES'].map(t =>
      React.createElement(TabBtn, {
        key: t, label: t,
        active: tab === t.toLowerCase(),
        style: { flex: 1 },
        onClick: () => setTab(t.toLowerCase()),
      })
    )
  );

  const expensesContent = (group.expenses || []).length === 0
    ? React.createElement('div', { className: 'empty-state', style: { padding: '20px 0' } },
        React.createElement('div', { className: 'empty-title', style: { fontSize: 10 } }, 'NO EXPENSES YET'),
        React.createElement('div', { className: 'empty-sub' }, 'ADD THE FIRST ONE')
      )
    : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        [...(group.expenses || [])].reverse().map(exp =>
          React.createElement(GroupExpenseCard, { key: exp.id, exp, group, onClick: () => onOpenExpense(exp.id) })
        )
      );

  const chipPath = 'polygon(0 4px,4px 4px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px))';
  const balancesContent = React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
    React.createElement('div', { className: 'cell is-flat' },
      React.createElement('div', { className: 'cell-inner', style: { display: 'block' } },
        React.createElement('div', { className: 'stat-label' }, 'TOTAL SPENT'),
        React.createElement('div', { className: 'stat-value' }, formatINR(total))
      )
    ),
    group.members.map(m => {
      const b = Math.round((balances[m.id] || 0) * 100) / 100;
      const isPos = b > 0.5;
      const isNeg = b < -0.5;
      return React.createElement('div', { key: m.id, className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner' },
          React.createElement('span', { className: 'font-pixel', style: { fontSize: 11, flex: 1 } }, m.name),
          React.createElement('div', { style: { background: 'var(--ink)', padding: 3, clipPath: chipPath } },
            React.createElement('div', { className: 'font-pixel', style: {
              fontSize: 8, padding: '5px 10px',
              background: isPos ? '#d4e8c8' : isNeg ? '#f0d0d0' : 'var(--cream-shade)',
              color: isPos ? 'var(--green-dark)' : isNeg ? '#7a1a1a' : 'var(--ink-faint)',
            } },
              isPos ? 'OWED ' + formatINR(b) : isNeg ? 'OWES ' + formatINR(Math.abs(b)) : 'SETTLED ✓'
            )
          )
        )
      );
    })
  );

  function copyCode() {
    try {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(group.joinCode);
      else {
        const ta = document.createElement('textarea');
        ta.value = group.joinCode; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); ta.remove();
      }
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    } catch {}
  }

  const joinCodeRow = group.joinCode
    ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 } },
        React.createElement('div', { className: 'font-pixel', style: { fontSize: 9, color: 'var(--ink-faint)' } }, 'INVITE CODE'),
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
          onClick: copyCode,
          title: 'Tap to copy code',
        },
          React.createElement('div', { className: 'font-pixel', style: { fontSize: 14, letterSpacing: '0.25em', color: 'var(--ink)' } }, group.joinCode),
          React.createElement('div', { className: 'font-pixel', style: {
            fontSize: 8, padding: '3px 6px',
            color: codeCopied ? 'var(--cream)' : 'var(--green-dark)',
            background: codeCopied ? 'var(--green-dark)' : 'var(--cream-shade)',
            transition: 'all 0.15s',
          } }, codeCopied ? 'COPIED!' : 'TAP')
        )
      )
    : null;

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },
      joinCodeRow,
      tabBar,
      React.createElement('div', { style: { height: 4 } }),
      tab === 'expenses' ? expensesContent : balancesContent
    )
  );
}

export function GroupAddExpenseScreen({ group, onSave, onCancel }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [note, setNote] = useState('');
  const [paidById, setPaidById] = useState(group.members[0]?.id || '');
  const [splitType, setSplitType] = useState('equal');
  const [splitVals, setSplitVals] = useState({});

  const [catSheet, setCatSheet] = useState(false);
  const [dateSheet, setDateSheet] = useState(false);
  const [paidSheet, setPaidSheet] = useState(false);
  const [pendingDate, setPendingDate] = useState(date);

  const totalAmt = parseFloat(amount) || 0;
  const mc = group.members.length;

  const computedSplits = useMemo(() => {
    if (!totalAmt) return group.members.map(m => ({ memberId: m.id, name: m.name, value: 0 }));
    if (splitType === 'equal') {
      const share = Math.round((totalAmt / mc) * 100) / 100;
      return group.members.map(m => ({ memberId: m.id, name: m.name, value: share }));
    }
    if (splitType === 'percent') {
      return group.members.map(m => {
        const pct = parseFloat(splitVals[m.id] || '') || 0;
        return { memberId: m.id, name: m.name, value: Math.round((pct / 100) * totalAmt * 100) / 100 };
      });
    }
    return group.members.map(m => ({
      memberId: m.id, name: m.name, value: parseFloat(splitVals[m.id] || '') || 0,
    }));
  }, [totalAmt, splitType, splitVals, group.members, mc]);

  const pctSum = group.members.reduce((s, m) => s + (parseFloat(splitVals[m.id] || '') || 0), 0);
  const amtSum = computedSplits.reduce((s, x) => s + x.value, 0);
  const splitOk = splitType === 'equal'
    || (splitType === 'percent' && Math.abs(pctSum - 100) < 0.5)
    || (splitType === 'amount' && Math.abs(amtSum - totalAmt) < 0.5);

  const isValid = !!amount && totalAmt > 0 && !!category && !!paidById && splitOk;

  function handleSave() {
    if (!isValid) return;
    onSave({
      id: 'ge_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      amount: totalAmt, category, date, note: note.trim(),
      paidById, splitType, splits: computedSplits,
    });
  }

  const paidByMember = group.members.find(m => m.id === paidById);

  const header = React.createElement(CardHeader, {
    title: 'ADD EXPENSE',
    subtitle: group.name.length > 12 ? group.name.slice(0, 12) + '…' : group.name,
    left: React.createElement(IconButton, { onClick: onCancel }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement('div'),
  });

  const footer = React.createElement(PixelButton, {
    onClick: handleSave, disabled: !isValid,
    icon: React.createElement(SaveGlyph, { size: 14 }),
  }, 'SAVE EXPENSE');

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' }, React.createElement(MoneyBagGlyph, { size: 16 }), 'AMOUNT'),
        React.createElement('div', { className: 'amount-input' },
          React.createElement('div', { className: 'symbol' }, '₹'),
          React.createElement('input', {
            type: 'text', inputMode: 'decimal', value: amount, placeholder: '0.00',
            onChange: e => setAmount(e.target.value.replace(/[^0-9.]/g, '')),
          })
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' }, React.createElement(FolderGlyph, { size: 16 }), 'CATEGORY'),
        React.createElement('div', { className: 'field', onClick: () => setCatSheet(true) },
          React.createElement('div', { className: 'field-inner' },
            category
              ? React.createElement(React.Fragment, null,
                  React.createElement('div', { style: { width: 22, height: 22, display: 'grid', placeItems: 'center' } },
                    React.createElement(CATEGORIES[category].Icon, { size: 22 })
                  ),
                  React.createElement('span', { className: 'value-text' }, CATEGORIES[category].label)
                )
              : React.createElement('span', { className: 'placeholder-text' }, 'SELECT CATEGORY'),
            React.createElement('span', { className: 'spacer' }),
            React.createElement('span', { className: 'caret-down' })
          )
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' }, React.createElement(CalendarGlyph, { size: 16 }), 'DATE'),
        React.createElement('div', { className: 'field', onClick: () => { setPendingDate(date); setDateSheet(true); } },
          React.createElement('div', { className: 'field-inner' },
            React.createElement('span', { className: 'value-text' }, formatDateInput(date)),
            React.createElement('span', { className: 'spacer' }),
            React.createElement(CalendarGlyph, { size: 16 })
          )
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' }, React.createElement(NoteGlyph, { size: 16 }), 'NOTE (OPTIONAL)'),
        React.createElement('div', { className: 'field' },
          React.createElement('div', { className: 'field-inner', style: { cursor: 'text' } },
            React.createElement('input', {
              type: 'text', value: note, placeholder: 'ADD NOTE...', maxLength: 40,
              onChange: e => setNote(e.target.value.toUpperCase()),
            })
          )
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' }, React.createElement(PeopleGlyph, { size: 16 }), 'PAID BY'),
        React.createElement('div', { className: 'field', onClick: () => setPaidSheet(true) },
          React.createElement('div', { className: 'field-inner' },
            React.createElement('span', { className: 'value-text' }, paidByMember ? paidByMember.name : '—'),
            React.createElement('span', { className: 'spacer' }),
            React.createElement('span', { className: 'caret-down' })
          )
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' }, React.createElement(SplitGlyph, { size: 16 }), 'SPLIT'),
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 8 } },
          [{ id: 'equal', label: 'EQUAL' }, { id: 'percent', label: 'BY %' }, { id: 'amount', label: 'BY ₹' }].map(o =>
            React.createElement(TabBtn, {
              key: o.id, label: o.label,
              active: splitType === o.id,
              style: { flex: 1 },
              onClick: () => { setSplitType(o.id); setSplitVals({}); },
            })
          )
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5 } },
          group.members.map(m => {
            const comp = computedSplits.find(s => s.memberId === m.id);
            return React.createElement('div', { key: m.id, className: 'cell is-flat' },
              React.createElement('div', { className: 'cell-inner', style: { padding: '9px 12px' } },
                React.createElement('span', { className: 'font-pixel', style: { fontSize: 10, flex: 1 } }, m.name),
                splitType === 'equal'
                  ? React.createElement('span', { className: 'font-pixel', style: { fontSize: 10, color: 'var(--green-dark)' } },
                      formatINR(comp ? comp.value : 0)
                    )
                  : React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                      React.createElement('div', { className: 'split-input-wrap' },
                        React.createElement('input', {
                          type: 'text', inputMode: 'decimal',
                          value: splitVals[m.id] || '',
                          placeholder: splitType === 'percent' ? '%' : '₹',
                          onChange: e => setSplitVals(prev => ({ ...prev, [m.id]: e.target.value.replace(/[^0-9.]/g, '') })),
                        })
                      ),
                      splitType === 'percent' && comp
                        ? React.createElement('span', { className: 'font-pixel', style: { fontSize: 8, color: 'var(--ink-faint)', minWidth: 50 } },
                            '= ' + formatINR(comp.value)
                          )
                        : null
                    )
              )
            );
          })
        ),
        totalAmt > 0 && splitType !== 'equal' && React.createElement('div', {
          className: 'font-pixel',
          style: { fontSize: 8, marginTop: 5, textAlign: 'right', color: splitOk ? 'var(--green-dark)' : '#c84a3a' },
        },
          splitType === 'percent'
            ? 'SUM: ' + pctSum.toFixed(0) + '% / 100%'
            : 'SUM: ' + formatINR(amtSum) + ' / ' + formatINR(totalAmt)
        )
      ),

      catSheet && React.createElement(Sheet, { title: 'CATEGORY', onClose: () => setCatSheet(false) },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          Object.values(CATEGORIES).map(c => React.createElement('div', {
            key: c.id, className: 'cell',
            onClick: () => { setCategory(c.id); setCatSheet(false); },
          },
            React.createElement('div', { className: 'cell-inner' },
              React.createElement('div', { style: { width: 28, height: 28, display: 'grid', placeItems: 'center' } },
                React.createElement(c.Icon, { size: 26 })
              ),
              React.createElement('span', { className: 'font-pixel', style: { fontSize: 12, flex: 1 } }, c.label),
              React.createElement('span', { className: 'chev' }, '›')
            )
          ))
        )
      ),

      dateSheet && React.createElement(Sheet, { title: 'DATE', onClose: () => setDateSheet(false) },
        React.createElement(Calendar, {
          value: pendingDate, onChange: setPendingDate,
          onConfirm: () => { setDate(pendingDate); setDateSheet(false); },
        })
      ),

      paidSheet && React.createElement(Sheet, { title: 'PAID BY', onClose: () => setPaidSheet(false) },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          group.members.map(m => React.createElement('div', {
            key: m.id, className: 'cell',
            onClick: () => { setPaidById(m.id); setPaidSheet(false); },
          },
            React.createElement('div', { className: 'cell-inner' },
              React.createElement('span', { className: 'font-pixel', style: { fontSize: 12, flex: 1 } }, m.name),
              paidById === m.id && React.createElement(CheckGlyph, { size: 14 })
            )
          ))
        )
      ),
    )
  );
}

export function GroupExpenseDetailScreen({ expense, group, onBack }) {
  const cat = CATEGORIES[expense.category] || CATEGORIES.other;
  const payer = group.members.find(m => m.id === expense.paidById);
  const clipPath = 'polygon(0 6px,3px 6px,3px 3px,6px 3px,6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px))';
  const chipPath = 'polygon(0 4px,4px 4px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px))';

  const header = React.createElement(CardHeader, {
    title: 'EXPENSE',
    subtitle: group.name.length > 10 ? group.name.slice(0, 10) + '…' : group.name,
    left: React.createElement(IconButton, { onClick: onBack }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement('div'),
  });

  const footer = React.createElement(PixelButton, { ghost: true, onClick: onBack }, 'BACK');

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },

      React.createElement('div', { style: { display: 'grid', placeItems: 'center', padding: '12px 0 4px' } },
        React.createElement('div', { style: { width: 68, height: 68, padding: 3, background: '#1a1610', display: 'grid', placeItems: 'center', clipPath } },
          React.createElement('div', { style: { background: '#f4ead0', width: '100%', height: '100%', display: 'grid', placeItems: 'center', clipPath } },
            React.createElement(cat.Icon, { size: 48 })
          )
        )
      ),

      React.createElement('div', { className: 'detail-amount' },
        React.createElement('span', { className: 'rs' }, '₹'),
        Math.round(Number(expense.amount)).toLocaleString('en-IN')
      ),

      React.createElement('div', { className: 'font-pixel text-center', style: { fontSize: 10, color: '#4a3f2c', marginBottom: 12 } },
        cat.label + '  •  ' + formatDateShort(expense.date)
      ),

      expense.note ? React.createElement('div', { className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner', style: { gap: 8 } },
          React.createElement(NoteGlyph, { size: 16 }),
          React.createElement('span', { className: 'font-pixel', style: { fontSize: 11, lineHeight: 1.5 } }, expense.note)
        )
      ) : null,

      payer && React.createElement('div', { className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner', style: { gap: 10 } },
          React.createElement('span', { className: 'font-pixel', style: { fontSize: 8, color: 'var(--ink-faint)', flex: 1 } }, 'PAID BY'),
          React.createElement('div', { style: { background: 'var(--ink)', padding: 3, display: 'inline-flex', clipPath: chipPath } },
            React.createElement('span', { className: 'font-pixel', style: {
              fontSize: 9, background: 'var(--green)', color: 'var(--cream)',
              padding: '3px 12px', display: 'block',
              boxShadow: 'inset 0 -2px 0 0 var(--green-dark), inset 0 2px 0 0 var(--green-light)',
            } }, payer.name)
          )
        )
      ),

      (expense.splits || []).map(s => {
        const isThisPayer = s.memberId === expense.paidById;
        return React.createElement('div', { key: s.memberId, className: 'cell is-flat' },
          React.createElement('div', { className: 'cell-inner' },
            React.createElement('span', { className: 'font-pixel', style: { fontSize: 11, flex: 1 } }, s.name),
            isThisPayer && React.createElement('div', { style: {
              background: 'var(--ink)', padding: 3, marginRight: 8, display: 'inline-flex', clipPath: chipPath,
            } },
              React.createElement('span', { className: 'font-pixel', style: {
                fontSize: 7, background: 'var(--green)', color: 'var(--cream)',
                padding: '2px 6px', display: 'block',
              } }, 'PAID')
            ),
            React.createElement('span', { className: 'font-pixel', style: { fontSize: 12 } }, formatINR(s.value))
          )
        );
      })
    )
  );
}
