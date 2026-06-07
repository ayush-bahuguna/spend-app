'use client';
import React, { useState, useMemo } from 'react';
import {
  CATEGORIES, buildCustomCategory, CUSTOM_CAT_ICONS, CoffeeIcon, SlimeSprite,
  MoneyBagGlyph, FolderGlyph, CalendarGlyph, NoteGlyph,
  MenuGlyph, ChartGlyph, BackGlyph, PlusGlyph, SaveGlyph, TrashGlyph, ShareGlyph, EditGlyph,
  PeopleGlyph, SplitGlyph, CheckGlyph, CarGlyph,
} from './icons';
import {
  PixelButton, IconButton, CardHeader, MainCard, Sheet, Calendar, TabBtn,
  formatINR, formatDateShort, formatDateInput,
} from './ui';
import { GroupsTabContent } from './groups';

export function HomeScreen({ expenses, groups, allCategories, onAdd, onOpen, onStats, onMenu, onCreateGroup, onOpenGroup, onJoinGroup }) {
  const [tab, setTab]         = useState('expenses');
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const monthTotal = useMemo(() => {
    const now = new Date();
    return expenses.reduce((s, e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return s + Number(e.amount || 0);
      return s;
    }, 0);
  }, [expenses]);

  const sorted = useMemo(() => [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)), [expenses]);

  const header = React.createElement(React.Fragment, null,
    React.createElement(CardHeader, {
      title: 'SPEND',
      subtitle: tab === 'expenses' ? 'YOUR SPENDING' : 'YOUR GROUPS',
      left: React.createElement(IconButton, { onClick: onMenu, title: 'Menu' }, React.createElement(MenuGlyph, { size: 18 })),
      right: React.createElement(IconButton, { onClick: onStats, title: 'Stats' }, React.createElement(ChartGlyph, { size: 18 })),
    }),
    React.createElement('div', { style: { display: 'flex', gap: 6 } },
      React.createElement(TabBtn, { label: 'MY EXPENSES', active: tab === 'expenses', style: { flex: 1 }, onClick: () => setTab('expenses') }),
      React.createElement(TabBtn, { label: 'GROUPS',      active: tab === 'groups',   style: { flex: 1 }, onClick: () => setTab('groups') })
    )
  );

  const footer = tab === 'expenses'
    ? React.createElement(PixelButton, { onClick: onAdd, icon: React.createElement(PlusGlyph, { size: 16 }) }, 'ADD EXPENSE')
    : React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement(PixelButton, { onClick: onCreateGroup, icon: React.createElement(PlusGlyph, { size: 16 }), style: { flex: 1 } }, 'NEW GROUP'),
        React.createElement(PixelButton, { ghost: true, onClick: () => onJoinGroup && setJoinOpen(true), style: { flex: 1 } }, 'JOIN GROUP')
      );

  let content;
  if (tab === 'expenses') {
    if (expenses.length === 0) {
      content = React.createElement('div', { className: 'empty-state' },
        React.createElement('div', { className: 'bob' }, React.createElement(SlimeSprite, { size: 80 })),
        React.createElement('div', { className: 'empty-title' }, 'NO EXPENSES YET'),
        React.createElement('div', { className: 'empty-sub' }, 'ADD YOUR FIRST EXPENSE')
      );
    } else {
      content = React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'month-pill-row' },
          React.createElement('div', { className: 'month-pill' },
            React.createElement('div', { className: 'month-pill-inner' },
              'THIS MONTH',
              React.createElement('strong', null, formatINR(monthTotal))
            )
          )
        ),
        React.createElement('div', { className: 'list-body' },
          sorted.map(e => React.createElement(ExpenseRow, { key: e.id, expense: e, allCategories, onClick: () => onOpen(e.id) }))
        )
      );
    }
  } else {
    content = React.createElement(GroupsTabContent, { groups: groups || [], onOpenGroup });
  }

  function handleJoin() {
    if (joinCode.trim().length < 6) return;
    onJoinGroup(joinCode.trim());
    setJoinOpen(false);
    setJoinCode('');
  }

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer }, content),
    joinOpen && React.createElement(Sheet, { title: 'JOIN GROUP', onClose: () => setJoinOpen(false) },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        React.createElement('div', { className: 'empty-sub', style: { textAlign: 'left' } }, 'ENTER THE 6-DIGIT CODE SHARED BY THE GROUP CREATOR'),
        React.createElement('div', { className: 'field' },
          React.createElement('div', { className: 'field-inner' },
            React.createElement('input', {
              type: 'text',
              value: joinCode,
              placeholder: 'E.G. ABC123',
              maxLength: 6,
              style: { textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 16, textAlign: 'center' },
              onChange: e => setJoinCode(e.target.value.toUpperCase()),
              onKeyDown: e => { if (e.key === 'Enter') handleJoin(); },
            })
          )
        ),
        React.createElement(PixelButton, {
          onClick: handleJoin,
          disabled: joinCode.trim().length < 6,
          icon: React.createElement(CheckGlyph, { size: 14 }),
        }, 'JOIN')
      )
    )
  );
}

function ExpenseRow({ expense, allCategories, onClick }) {
  const cats = allCategories || CATEGORIES;
  const cat = cats[expense.category] || cats.other || CATEGORIES.other;
  const IconCmp = (expense.category === 'food' && expense.iconVariant === 'coffee') ? CoffeeIcon : cat.Icon;
  const hasSplit = expense.split && expense.split.members && expense.split.members.length > 0;
  return React.createElement('div', { className: 'cell', onClick },
    React.createElement('div', { className: 'cell-inner' },
      React.createElement('div', { className: 'row', style: { width: '100%' } },
        React.createElement('div', { className: 'icon-tile' },
          React.createElement('div', { className: 'icon-tile-inner' },
            React.createElement(IconCmp, { size: 30 })
          )
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'cat-name' }, cat.label),
          React.createElement('div', { className: 'cat-date' }, formatDateShort(expense.date))
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 } },
          React.createElement('div', { className: 'amount' }, formatINR(expense.amount)),
          hasSplit && React.createElement('div', { style: {
            background: 'var(--green)', padding: '2px 5px',
            fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: 'var(--cream)',
          } }, 'SPLIT')
        ),
        React.createElement('div', { className: 'chev' }, '›')
      )
    )
  );
}


export function AddEditScreen({ initial, onSave, onCancel, onDelete, mode, allCategories, customCategories, onSaveCategory }) {
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category || '');
  const [date, setDate] = useState(initial?.date || new Date().toISOString());
  const [note, setNote] = useState(initial?.note || '');

  const [splitEnabled, setSplitEnabled] = useState(!!(initial?.split?.members?.length));
  const [splitMembers, setSplitMembers] = useState(
    initial?.split?.members
      ? initial.split.members.map((m, i) => ({ id: 'm_init_' + i, name: m.name }))
      : []
  );
  const [memberInput, setMemberInput] = useState('');
  const [splitType, setSplitType] = useState(initial?.split?.type || 'equal');
  const [splitVals, setSplitVals] = useState({});

  const [catSheet, setCatSheet] = useState(false);
  const [dateSheet, setDateSheet] = useState(false);
  const [pendingDate, setPendingDate] = useState(date);
  const [addingCat, setAddingCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIconIdx, setNewCatIconIdx] = useState(0);

  const totalAmt = parseFloat(amount) || 0;
  const mc = splitMembers.length;

  const computedSplits = useMemo(() => {
    if (!totalAmt || mc === 0) return [];
    if (splitType === 'equal') {
      const share = Math.round((totalAmt / mc) * 100) / 100;
      return splitMembers.map(m => ({ name: m.name, value: share }));
    }
    if (splitType === 'percent') {
      return splitMembers.map(m => {
        const pct = parseFloat(splitVals[m.id] || '') || 0;
        return { name: m.name, value: Math.round((pct / 100) * totalAmt * 100) / 100 };
      });
    }
    return splitMembers.map(m => ({
      name: m.name, value: parseFloat(splitVals[m.id] || '') || 0,
    }));
  }, [totalAmt, splitType, splitVals, splitMembers, mc]);

  const pctSum = splitMembers.reduce((s, m) => s + (parseFloat(splitVals[m.id] || '') || 0), 0);
  const amtSum = computedSplits.reduce((s, x) => s + x.value, 0);
  const splitOk = !splitEnabled || mc === 0
    || splitType === 'equal'
    || (splitType === 'percent' && Math.abs(pctSum - 100) < 0.5)
    || (splitType === 'amount' && Math.abs(amtSum - totalAmt) < 0.5);

  const isValid = !!amount && parseFloat(amount) > 0 && !!category && splitOk;

  function addSplitMember() {
    const t = memberInput.trim().toUpperCase();
    if (!t || splitMembers.some(m => m.name === t)) { setMemberInput(''); return; }
    setSplitMembers(prev => [...prev, { id: 'm_' + Date.now(), name: t }]);
    setMemberInput('');
  }

  const cats = allCategories || CATEGORIES;

  function handleSave() {
    if (!isValid) return;
    onSave({
      ...(initial || {}),
      id: initial?.id || ('e_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
      amount: parseFloat(amount),
      category, date, note: note.trim(),
      split: (splitEnabled && mc > 0)
        ? { type: splitType, members: computedSplits }
        : null,
    });
  }

  function handleSaveNewCategory() {
    const label = newCatLabel.trim().toUpperCase();
    if (!label) return;
    const entry = CUSTOM_CAT_ICONS[newCatIconIdx];
    const cat = { id: 'cat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), label, icon: entry.id, color: entry.color };
    onSaveCategory?.(cat);
    setNewCatLabel(''); setNewCatIconIdx(0); setAddingCat(false);
  }

  const headerTitle = mode === 'edit' ? 'EDIT EXPENSE' : 'ADD EXPENSE';
  const headerSub = mode === 'edit' ? 'CHANGE YOUR SPEND' : 'LOG YOUR SPEND';

  const header = React.createElement(CardHeader, {
    title: headerTitle, subtitle: headerSub,
    left: React.createElement(IconButton, { onClick: onCancel }, React.createElement(BackGlyph, { size: 18 })),
    right: mode === 'edit'
      ? React.createElement(IconButton, { onClick: onDelete, title: 'Delete' }, React.createElement(TrashGlyph, { size: 16 }))
      : React.createElement('div'),
  });

  const footer = React.createElement(PixelButton, {
    onClick: handleSave, disabled: !isValid,
    icon: React.createElement(SaveGlyph, { size: 14 }),
  }, mode === 'edit' ? 'SAVE CHANGES' : 'SAVE EXPENSE');

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' },
          React.createElement(MoneyBagGlyph, { size: 16 }), 'AMOUNT'
        ),
        React.createElement('div', { className: 'amount-input' },
          React.createElement('div', { className: 'symbol' }, '₹'),
          React.createElement('input', {
            type: 'text', inputMode: 'decimal',
            value: amount, placeholder: '0.00',
            onChange: e => setAmount(e.target.value.replace(/[^0-9.]/g, '')),
          })
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' },
          React.createElement(FolderGlyph, { size: 16 }), 'CATEGORY'
        ),
        React.createElement('div', { className: 'field', onClick: () => setCatSheet(true) },
          React.createElement('div', { className: 'field-inner' },
            category && cats[category]
              ? React.createElement(React.Fragment, null,
                  React.createElement('div', { style: { width: 22, height: 22, display: 'grid', placeItems: 'center' } },
                    React.createElement(cats[category].Icon, { size: 22 })
                  ),
                  React.createElement('span', { className: 'value-text' }, cats[category].label)
                )
              : React.createElement('span', { className: 'placeholder-text' }, 'SELECT CATEGORY'),
            React.createElement('span', { className: 'spacer' }),
            React.createElement('span', { className: 'caret-down' })
          )
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' },
          React.createElement(CalendarGlyph, { size: 16 }), 'DATE'
        ),
        React.createElement('div', { className: 'field', onClick: () => { setPendingDate(date); setDateSheet(true); } },
          React.createElement('div', { className: 'field-inner' },
            React.createElement('span', { className: 'value-text' }, formatDateInput(date)),
            React.createElement('span', { className: 'spacer' }),
            React.createElement(CalendarGlyph, { size: 16 })
          )
        )
      ),

      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' },
          React.createElement(NoteGlyph, { size: 16 }), 'NOTE (OPTIONAL)'
        ),
        React.createElement('div', { className: 'field' },
          React.createElement('div', { className: 'field-inner', style: { cursor: 'text' } },
            React.createElement('input', {
              type: 'text', value: note, placeholder: 'ADD NOTE...', maxLength: 60,
              onChange: e => setNote(e.target.value.toUpperCase()),
            })
          )
        )
      ),

      React.createElement('div', { className: 'split-divider' }),

      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement(SplitGlyph, { size: 16 }),
        React.createElement('span', { className: 'font-pixel', style: { fontSize: 10, flex: 1 } }, 'SPLIT THIS'),
        React.createElement('div', {
          className: 'split-toggle' + (splitEnabled ? ' is-on' : ''),
          onClick: () => {
            setSplitEnabled(v => !v);
            if (splitEnabled) { setSplitMembers([]); setSplitType('equal'); setSplitVals({}); }
          },
        },
          React.createElement('div', { className: 'split-toggle-inner' }, splitEnabled ? 'ON' : 'OFF')
        )
      ),

      splitEnabled && React.createElement('div', null,
        React.createElement('div', { className: 'field-label', style: { marginTop: 4 } },
          React.createElement(PeopleGlyph, { size: 14 }), 'ADD PEOPLE'
        ),
        React.createElement('div', { style: { display: 'flex', gap: 6 } },
          React.createElement('div', { className: 'field', style: { flex: 1 } },
            React.createElement('div', { className: 'field-inner' },
              React.createElement('input', {
                type: 'text', value: memberInput, placeholder: 'NAME...',
                maxLength: 16,
                onChange: e => setMemberInput(e.target.value.toUpperCase()),
                onKeyDown: e => { if (e.key === 'Enter') addSplitMember(); },
              })
            )
          ),
          React.createElement(PixelButton, {
            onClick: addSplitMember,
            icon: React.createElement(PlusGlyph, { size: 14 }),
            style: { width: 52, flexShrink: 0 },
          }, '')
        )
      ),

      splitEnabled && splitMembers.length > 0 && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 4 } },
          [{ id: 'equal', label: 'EQUAL' }, { id: 'percent', label: 'BY %' }, { id: 'amount', label: 'BY ₹' }].map(o =>
            React.createElement(TabBtn, {
              key: o.id, label: o.label,
              active: splitType === o.id,
              style: { flex: 1 },
              onClick: () => { setSplitType(o.id); setSplitVals({}); },
            })
          )
        ),
        splitMembers.map(m => {
          const comp = computedSplits.find(s => s.name === m.name);
          return React.createElement('div', { key: m.id, className: 'cell is-flat' },
            React.createElement('div', { className: 'cell-inner', style: { padding: '7px 10px' } },
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
                      ? React.createElement('span', { className: 'font-pixel', style: { fontSize: 8, color: 'var(--ink-faint)', minWidth: 46 } },
                          '= ' + formatINR(comp.value)
                        )
                      : null
                  ),
              React.createElement('div', {
                style: { cursor: 'pointer', padding: '2px 4px', marginLeft: 4 },
                onClick: () => setSplitMembers(prev => prev.filter(x => x.id !== m.id)),
              }, React.createElement(TrashGlyph, { size: 11 }))
            )
          );
        }),
        totalAmt > 0 && splitType !== 'equal' && React.createElement('div', {
          className: 'font-pixel',
          style: { fontSize: 8, textAlign: 'right', color: splitOk ? 'var(--green-dark)' : '#c84a3a' },
        },
          splitType === 'percent'
            ? 'SUM: ' + pctSum.toFixed(0) + '% / 100%'
            : 'SUM: ' + formatINR(amtSum) + ' / ' + formatINR(totalAmt)
        )
      ),

      catSheet && React.createElement(Sheet, { title: 'SELECT CATEGORY', onClose: () => { setCatSheet(false); setAddingCat(false); } },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          Object.values(cats).map(c => React.createElement('div', {
            key: c.id, className: 'cell',
            onClick: () => { setCategory(c.id); setCatSheet(false); setAddingCat(false); },
          },
            React.createElement('div', { className: 'cell-inner' },
              React.createElement('div', { style: { width: 28, height: 28, display: 'grid', placeItems: 'center' } },
                React.createElement(c.Icon, { size: 26 })
              ),
              React.createElement('span', { className: 'font-pixel', style: { fontSize: 12, flex: 1 } }, c.label),
              React.createElement('span', { className: 'chev' }, '›')
            )
          )),
          !addingCat && React.createElement('div', {
            className: 'cell', onClick: () => setAddingCat(true),
          },
            React.createElement('div', { className: 'cell-inner' },
              React.createElement('span', { className: 'font-pixel', style: { fontSize: 12, flex: 1, color: 'var(--green-dark)' } }, '+ ADD CATEGORY'),
              React.createElement('span', { className: 'chev' }, '›')
            )
          ),
          addingCat && React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' } },
            React.createElement('div', { className: 'field' },
              React.createElement('div', { className: 'field-inner' },
                React.createElement('input', {
                  type: 'text', value: newCatLabel, placeholder: 'CATEGORY NAME', maxLength: 16,
                  onChange: e => setNewCatLabel(e.target.value.toUpperCase()),
                  style: { flex: 1 },
                })
              )
            ),

            /* Icon picker */
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '4px 0' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
                React.createElement('div', {
                  style: { width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: '#1a1610', userSelect: 'none', flexShrink: 0 },
                  onClick: () => setNewCatIconIdx(i => (i - 1 + CUSTOM_CAT_ICONS.length) % CUSTOM_CAT_ICONS.length),
                }, '◀'),
                React.createElement('div', { style: { width: 68, height: 68, padding: 3, background: '#1a1610', display: 'grid', placeItems: 'center', clipPath: 'polygon(0 6px,3px 6px,3px 3px,6px 3px,6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px))' } },
                  React.createElement('div', { style: { background: '#f4ead0', width: '100%', height: '100%', display: 'grid', placeItems: 'center', clipPath: 'polygon(0 6px,3px 6px,3px 3px,6px 3px,6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px))' } },
                    React.createElement(CUSTOM_CAT_ICONS[newCatIconIdx].Icon, { size: 48 })
                  )
                ),
                React.createElement('div', {
                  style: { width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: '#1a1610', userSelect: 'none', flexShrink: 0 },
                  onClick: () => setNewCatIconIdx(i => (i + 1) % CUSTOM_CAT_ICONS.length),
                }, '▶'),
              ),
              React.createElement('div', { style: { display: 'flex', gap: 5, marginTop: 2 } },
                CUSTOM_CAT_ICONS.map((_, i) => React.createElement('div', {
                  key: i,
                  style: { width: i === newCatIconIdx ? 8 : 5, height: i === newCatIconIdx ? 8 : 5, background: i === newCatIconIdx ? '#1a1610' : '#c8b88a', transition: 'all 0.15s' },
                }))
              )
            ),

            React.createElement('div', { style: { display: 'flex', gap: 8 } },
              React.createElement(PixelButton, {
                onClick: handleSaveNewCategory,
                disabled: !newCatLabel.trim(),
                icon: React.createElement(SaveGlyph, { size: 12 }),
                style: { flex: 1 },
              }, 'SAVE'),
              React.createElement(PixelButton, {
                ghost: true, onClick: () => setAddingCat(false), style: { flex: 1 },
              }, 'CANCEL')
            )
          )
        )
      ),

      dateSheet && React.createElement(Sheet, { title: 'SELECT DATE', onClose: () => setDateSheet(false) },
        React.createElement(Calendar, {
          value: pendingDate, onChange: setPendingDate,
          onConfirm: () => { setDate(pendingDate); setDateSheet(false); },
        })
      ),
    )
  );
}

export function DetailScreen({ expense, onBack, onEdit, onDelete, onShare, allCategories }) {
  const cats = allCategories || CATEGORIES;
  const cat = cats[expense.category] || cats.other || CATEGORIES.other;
  const IconCmp = (expense.category === 'food' && expense.iconVariant === 'coffee') ? CoffeeIcon : cat.Icon;
  const hasSplit = expense.split && expense.split.members && expense.split.members.length > 0;

  const header = React.createElement(CardHeader, {
    title: 'EXPENSE', subtitle: 'SPEND DETAIL',
    left: React.createElement(IconButton, { onClick: onBack }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement(IconButton, { onClick: onEdit }, React.createElement(EditGlyph, { size: 16 })),
  });

  const footer = React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'share-row' },
      React.createElement(PixelButton, { ghost: true, onClick: onShare, icon: React.createElement(ShareGlyph, { size: 14 }) }, 'SHARE'),
      React.createElement(PixelButton, { danger: true, onClick: onDelete, icon: React.createElement(TrashGlyph, { size: 14 }) }, 'DELETE')
    ),
    React.createElement(PixelButton, { onClick: onEdit, icon: React.createElement(EditGlyph, { size: 14 }) }, 'EDIT EXPENSE')
  );

  const clipPath = 'polygon(0 6px, 3px 6px, 3px 3px, 6px 3px, 6px 0, calc(100% - 6px) 0, calc(100% - 6px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 3px) calc(100% - 6px), calc(100% - 3px) calc(100% - 3px), calc(100% - 6px) calc(100% - 3px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 6px), 0 calc(100% - 6px))';

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },

      React.createElement('div', { style: { display: 'grid', placeItems: 'center', padding: '12px 0 4px' } },
        React.createElement('div', { style: { width: 68, height: 68, padding: 3, background: '#1a1610', display: 'grid', placeItems: 'center', clipPath } },
          React.createElement('div', { style: { background: '#f4ead0', width: '100%', height: '100%', display: 'grid', placeItems: 'center', clipPath } },
            React.createElement(IconCmp, { size: 48 })
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

      hasSplit && React.createElement('div', { className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner', style: { flexDirection: 'column', alignItems: 'flex-start', gap: 8 } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            React.createElement(SplitGlyph, { size: 14 }),
            React.createElement('span', { className: 'font-pixel', style: { fontSize: 9, color: 'var(--ink-soft)' } },
              expense.split.type === 'equal' ? 'SPLIT EQUALLY'
              : expense.split.type === 'percent' ? 'SPLIT BY %'
              : 'SPLIT BY AMOUNT'
            )
          ),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5, width: '100%' } },
            expense.split.members.map((m, i) =>
              React.createElement('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement('span', { className: 'font-pixel', style: { fontSize: 10 } }, m.name),
                React.createElement('span', { className: 'font-pixel', style: { fontSize: 10, color: 'var(--green-dark)' } }, formatINR(m.value))
              )
            )
          )
        )
      )
    )
  );
}

export function StatsScreen({ expenses, onBack, allCategories }) {
  const cats = allCategories || CATEGORIES;
  const totals = useMemo(() => {
    const byCat = {};
    let total = 0;
    expenses.forEach(e => {
      byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount || 0);
      total += Number(e.amount || 0);
    });
    return { byCat, total };
  }, [expenses]);

  const max = Math.max(1, ...Object.values(totals.byCat));
  const rows = Object.values(cats).map(c => ({
    id: c.id, label: c.label, amount: totals.byCat[c.id] || 0,
  })).sort((a, b) => b.amount - a.amount);

  const header = React.createElement(CardHeader, {
    title: 'STATS', subtitle: 'WHERE IT WENT',
    left: React.createElement(IconButton, { onClick: onBack }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement('div'),
  });

  const footer = React.createElement(PixelButton, { ghost: true, onClick: onBack }, 'BACK TO LIST');

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },

      React.createElement('div', { className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner', style: { display: 'block' } },
          React.createElement('div', { className: 'stat-label' }, 'TOTAL SPENT'),
          React.createElement('div', { className: 'stat-value' }, formatINR(totals.total))
        )
      ),

      React.createElement('div', { className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner', style: { display: 'block' } },
          React.createElement('div', { className: 'stat-label', style: { marginBottom: 12 } }, 'BY CATEGORY'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            rows.map(r => React.createElement('div', { key: r.id, className: 'bar-row' },
              React.createElement('div', { className: 'bar-row-head' },
                React.createElement('span', { className: 'bar-label font-pixel' }, r.label),
                React.createElement('span', { className: 'bar-amount font-pixel' }, formatINR(r.amount))
              ),
              React.createElement('div', { className: 'bar-track' },
                React.createElement('div', { className: 'bar-fill', style: { width: (r.amount / max * 100) + '%', minWidth: r.amount > 0 ? 4 : 0 } })
              )
            ))
          )
        )
      ),

      React.createElement('div', { className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner', style: { display: 'block' } },
          React.createElement('div', { className: 'stat-label' }, 'TOTAL ENTRIES'),
          React.createElement('div', { className: 'stat-value' }, expenses.length)
        )
      )
    )
  );
}

export function MenuSheet({ onClose, onSignOut, onCarTracker }) {
  return React.createElement(Sheet, { title: 'MENU', onClose },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
      React.createElement(PixelButton, { ghost: true, onClick: onCarTracker, icon: React.createElement(CarGlyph, { size: 16 }) }, 'CAR TRACKER'),
      React.createElement(PixelButton, { ghost: true, onClick: onSignOut }, 'SIGN OUT')
    )
  );
}

export function ShareSheet({ expense, onClose, onCopy, allCategories }) {
  const cats = allCategories || CATEGORIES;
  const cat = cats[expense.category] || cats.other || CATEGORIES.other;
  const shareText = `I spent ${formatINR(expense.amount)} on ${cat.label.toLowerCase()} (${formatDateShort(expense.date)})${expense.note ? ' — ' + expense.note : ''}`;
  return React.createElement(Sheet, { title: 'SHARE SPEND', onClose },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      React.createElement('div', { className: 'cell is-flat' },
        React.createElement('div', { className: 'cell-inner', style: { display: 'block' } },
          React.createElement('div', { className: 'font-pixel', style: { fontSize: 10, lineHeight: 1.6, color: '#2b2418' } }, shareText)
        )
      ),
      React.createElement(PixelButton, { onClick: () => onCopy(shareText), icon: React.createElement(ShareGlyph, { size: 14 }) }, 'COPY TO SHARE'),
      React.createElement(PixelButton, { ghost: true, onClick: onClose }, 'CANCEL')
    )
  );
}
