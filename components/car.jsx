'use client';
import React, { useState, useMemo } from 'react';
import {
  CarIcon, PetrolIcon, WrenchIcon, OdoGlyph, FuelGlyph,
  MoneyBagGlyph, CalendarGlyph, NoteGlyph,
  BackGlyph, PlusGlyph, SaveGlyph, TrashGlyph,
} from './icons';
import {
  PixelButton, IconButton, CardHeader, MainCard, Sheet, Calendar, TabBtn,
  formatINR, formatDateShort, formatDateInput,
} from './ui';

const CAR_CLIP = 'polygon(0 6px,3px 6px,3px 3px,6px 3px,6px 0,calc(100% - 6px) 0,calc(100% - 6px) 3px,calc(100% - 3px) 3px,calc(100% - 3px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 3px) calc(100% - 6px),calc(100% - 3px) calc(100% - 3px),calc(100% - 6px) calc(100% - 3px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 3px),3px calc(100% - 3px),3px calc(100% - 6px),0 calc(100% - 6px))';
const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function carDistance(t) { return Math.max(0, Number(t.endOdo || 0) - Number(t.startOdo || 0)); }
function carExpensesOf(expenses) {
  return (expenses || []).filter(e => e.category === 'petrol' || e.category === 'maintenance');
}
function buildCarLog(trips, expenses) {
  const items = [];
  (trips || []).forEach(t => items.push({ kind: 'trip', date: t.date, trip: t }));
  carExpensesOf(expenses).forEach(e => items.push({ kind: e.category, date: e.date, exp: e }));
  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
}
function inPeriod(iso, p) {
  const d = new Date(iso);
  if (p.month == null) return d.getFullYear() === p.year;
  return d.getFullYear() === p.year && d.getMonth() === p.month;
}
function computeStats(trips, expenses, p) {
  let running = 0, litres = 0, expense = 0, tripCount = 0, fillCount = 0;
  (trips || []).forEach(t => { if (inPeriod(t.date, p)) { running += carDistance(t); tripCount++; } });
  carExpensesOf(expenses).forEach(e => {
    if (!inPeriod(e.date, p)) return;
    expense += Number(e.amount || 0);
    if (e.category === 'petrol') { litres += Number(e.litres || 0); if (e.litres) fillCount++; }
  });
  return { running, litres, expense, tripCount, fillCount, mileage: litres > 0 ? running / litres : null };
}
function monthlyPeriods(n) {
  const out = [], now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTHS_SHORT[d.getMonth()] });
  }
  return out.reverse();
}
function yearlyPeriods(n) {
  const out = [], y = new Date().getFullYear();
  for (let i = 0; i < n; i++) out.push({ year: y - i, month: null, label: String(y - i) });
  return out.reverse();
}
function fmtKm(n) { return Math.round(n).toLocaleString('en-IN'); }
function fmtMileage(m) { return m == null ? '—' : (Math.round(m * 10) / 10).toLocaleString('en-IN'); }

function CarHeroIcon({ size = 60 }) {
  return React.createElement('div', { style: { display: 'grid', placeItems: 'center', padding: '10px 0 2px' } },
    React.createElement('div', { style: { width: size + 8, height: size + 8, padding: 3, background: '#1a1610', display: 'grid', placeItems: 'center', clipPath: CAR_CLIP } },
      React.createElement('div', { style: { background: '#f4ead0', width: '100%', height: '100%', display: 'grid', placeItems: 'center', clipPath: CAR_CLIP } },
        React.createElement(CarIcon, { size: size - 8 })
      )
    )
  );
}

function StatCell({ label, value, unit }) {
  return React.createElement('div', { className: 'cell is-flat' },
    React.createElement('div', { className: 'cell-inner', style: { display: 'block' } },
      React.createElement('div', { className: 'stat-label' }, label),
      React.createElement('div', { className: 'stat-value' },
        value,
        unit ? React.createElement('span', { className: 'font-pixel', style: { fontSize: 10, color: 'var(--ink-faint)', marginLeft: 6 } }, unit) : null
      )
    )
  );
}

function AnalyticsView({ trips, expenses, mode }) {
  const [metric, setMetric] = useState('running');
  const periods = mode === 'monthly' ? monthlyPeriods(6) : yearlyPeriods(5);
  const cur = periods[periods.length - 1];
  const s = computeStats(trips, expenses, cur);
  const periodLabel = mode === 'monthly'
    ? MONTHS_SHORT[cur.month] + ' ' + cur.year
    : String(cur.year);

  const metricDefs = {
    running: { label: 'RUNNING', fmt: (v) => fmtKm(v) + ' KM', get: (st) => st.running },
    mileage: { label: 'MILEAGE', fmt: (v) => v == null ? '—' : fmtMileage(v) + ' KM/L', get: (st) => st.mileage },
    expense: { label: 'EXPENSE', fmt: (v) => formatINR(v), get: (st) => st.expense },
  };
  const def = metricDefs[metric];
  const rows = periods.map(p => {
    const st = computeStats(trips, expenses, p);
    const raw = def.get(st);
    return { label: p.label, raw: raw == null ? 0 : raw, display: def.fmt(raw) };
  });
  const max = Math.max(1, ...rows.map(r => r.raw));

  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'car-period' }, periodLabel),
    React.createElement(StatCell, { label: mode === 'monthly' ? 'RUNNING THIS MONTH' : 'RUNNING THIS YEAR', value: fmtKm(s.running), unit: 'KM' }),
    React.createElement(StatCell, { label: 'MILEAGE', value: fmtMileage(s.mileage), unit: s.mileage == null ? '' : 'KM/L' }),
    React.createElement(StatCell, { label: mode === 'monthly' ? 'EXPENSE THIS MONTH' : 'EXPENSE THIS YEAR', value: formatINR(s.expense) }),
    React.createElement('div', { style: { display: 'flex', gap: 6 } },
      Object.keys(metricDefs).map(k => React.createElement(TabBtn, {
        key: k, label: metricDefs[k].label, active: metric === k, style: { flex: 1 },
        onClick: () => setMetric(k),
      }))
    ),
    React.createElement('div', { className: 'cell is-flat' },
      React.createElement('div', { className: 'cell-inner', style: { display: 'block' } },
        React.createElement('div', { className: 'stat-label', style: { marginBottom: 12 } },
          def.label + (mode === 'monthly' ? ' · LAST 6 MONTHS' : ' · LAST 5 YEARS')),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          rows.map((r, i) => React.createElement('div', { key: i, className: 'bar-row', style: { gridTemplateColumns: '38px 1fr 74px' } },
            React.createElement('span', { className: 'font-pixel', style: { fontSize: 8, color: '#2b2418' } }, r.label),
            React.createElement('div', { className: 'bar-track' },
              React.createElement('div', { className: 'bar-fill', style: { width: (r.raw / max * 100) + '%', minWidth: r.raw > 0 ? 4 : 0 } })
            ),
            React.createElement('span', { className: 'bar-amount font-pixel', style: { fontSize: 8 } }, r.display)
          ))
        )
      )
    ),
    React.createElement('div', { className: 'car-foot-note' },
      s.tripCount + ' TRIP' + (s.tripCount === 1 ? '' : 'S') + '  •  ' + s.fillCount + ' FILL' + (s.fillCount === 1 ? '' : 'S') +
      (s.mileage == null && s.running > 0 ? '  •  ADD LITRES FOR MILEAGE' : '')
    )
  );
}

const LOG_META = {
  trip:        { Icon: CarIcon,    badge: 'TRIP',    badgeColor: '#d0584a' },
  petrol:      { Icon: PetrolIcon, badge: 'FUEL',    badgeColor: '#c08a2a' },
  maintenance: { Icon: WrenchIcon, badge: 'SERVICE', badgeColor: '#5a7a8a' },
};
function logTitle(item) {
  if (item.kind === 'trip') return item.trip.name || 'TRIP';
  return item.kind === 'petrol' ? 'PETROL' : 'MAINTENANCE';
}
function logValue(item) {
  if (item.kind === 'trip') return fmtKm(carDistance(item.trip)) + ' KM';
  return formatINR(item.exp.amount);
}

function CarLogRow({ item, onClick }) {
  const meta = LOG_META[item.kind];
  const detail = item.kind === 'petrol' && item.exp.litres
    ? item.exp.litres + ' L'
    : null;
  return React.createElement('div', { className: 'cell', onClick },
    React.createElement('div', { className: 'cell-inner' },
      React.createElement('div', { className: 'row', style: { width: '100%' } },
        React.createElement('div', { className: 'icon-tile' },
          React.createElement('div', { className: 'icon-tile-inner' }, React.createElement(meta.Icon, { size: 28 }))
        ),
        React.createElement('div', { style: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 } },
          React.createElement('div', { className: 'cat-name' }, logTitle(item)),
          React.createElement('div', { className: 'cat-date', style: { margin: 0 } }, formatDateShort(item.date)),
          detail ? React.createElement('div', { className: 'cat-date', style: { margin: 0 } }, detail) : null
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 } },
          React.createElement('div', { className: 'amount' }, logValue(item)),
          React.createElement('div', { className: 'car-badge', style: { background: meta.badgeColor } }, meta.badge)
        ),
        React.createElement('div', { className: 'chev' }, '›')
      )
    )
  );
}

function CarLog({ trips, expenses, onOpenTrip, onOpenExpense }) {
  const log = useMemo(() => buildCarLog(trips, expenses), [trips, expenses]);
  if (log.length === 0) {
    return React.createElement('div', { className: 'empty-state' },
      React.createElement('div', { className: 'bob' }, React.createElement(CarIcon, { size: 72 })),
      React.createElement('div', { className: 'empty-title' }, 'NO CAR ENTRIES'),
      React.createElement('div', { className: 'empty-sub' }, 'ADD A TRIP OR EXPENSE')
    );
  }
  const open = (item) => item.kind === 'trip' ? onOpenTrip(item.trip.id) : onOpenExpense(item.exp.id);
  return React.createElement('div', { className: 'list-body' },
    log.map((item, i) => React.createElement(CarLogRow, { key: i, item, onClick: () => open(item) }))
  );
}

export function CarScreen({ trips, expenses, onBack, onAdd, onOpenTrip, onOpenExpense }) {
  const [tab, setTab] = useState('log');
  const [picker, setPicker] = useState(false);

  const subtitle = tab === 'log' ? 'CAR LOG' : tab === 'monthly' ? 'MONTHLY STATS' : 'YEARLY STATS';

  const header = React.createElement(React.Fragment, null,
    React.createElement(CardHeader, {
      title: 'CAR', subtitle,
      left: React.createElement(IconButton, { onClick: onBack }, React.createElement(BackGlyph, { size: 18 })),
      right: React.createElement('div'),
    }),
    React.createElement(CarHeroIcon),
    React.createElement('div', { style: { display: 'flex', gap: 6 } },
      React.createElement(TabBtn, { label: 'LOG', active: tab === 'log', style: { flex: 1 }, onClick: () => setTab('log') }),
      React.createElement(TabBtn, { label: 'MONTHLY', active: tab === 'monthly', style: { flex: 1 }, onClick: () => setTab('monthly') }),
      React.createElement(TabBtn, { label: 'YEARLY', active: tab === 'yearly', style: { flex: 1 }, onClick: () => setTab('yearly') })
    )
  );

  const footer = tab === 'log'
    ? React.createElement(PixelButton, { onClick: () => setPicker(true), icon: React.createElement(PlusGlyph, { size: 16 }) }, 'ADD ENTRY')
    : React.createElement(PixelButton, { ghost: true, onClick: () => setTab('log') }, 'BACK TO LOG');

  let content;
  if (tab === 'log') {
    content = React.createElement(CarLog, { trips, expenses, onOpenTrip, onOpenExpense });
  } else {
    content = React.createElement(AnalyticsView, { trips, expenses, mode: tab });
  }

  const pickerSheet = picker && React.createElement(Sheet, { title: 'ADD ENTRY', onClose: () => setPicker(false) },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
      [
        { type: 'trip', label: 'NEW TRIP', Icon: CarIcon },
        { type: 'petrol', label: 'PETROL', Icon: PetrolIcon },
        { type: 'maintenance', label: 'MAINTENANCE', Icon: WrenchIcon },
      ].map(o => React.createElement('div', {
        key: o.type, className: 'cell',
        onClick: () => { setPicker(false); onAdd(o.type); },
      },
        React.createElement('div', { className: 'cell-inner' },
          React.createElement('div', { style: { width: 30, height: 30, display: 'grid', placeItems: 'center' } }, React.createElement(o.Icon, { size: 28 })),
          React.createElement('span', { className: 'font-pixel', style: { fontSize: 12, flex: 1 } }, o.label),
          React.createElement('span', { className: 'chev' }, '›')
        )
      ))
    )
  );

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer }, content),
    pickerSheet
  );
}

export function CarAddScreen({ type, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [startOdo, setStartOdo] = useState('');
  const [endOdo, setEndOdo] = useState('');
  const [amount, setAmount] = useState('');
  const [litres, setLitres] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [dateSheet, setDateSheet] = useState(false);
  const [pendingDate, setPendingDate] = useState(date);

  const titles = {
    trip:        { t: 'NEW TRIP',    s: 'LOG A DRIVE',   save: 'SAVE TRIP' },
    petrol:      { t: 'PETROL',      s: 'LOG A FILL-UP', save: 'SAVE PETROL' },
    maintenance: { t: 'MAINTENANCE', s: 'LOG A SERVICE', save: 'SAVE SERVICE' },
  }[type];

  const distance = (parseFloat(endOdo) || 0) - (parseFloat(startOdo) || 0);
  const isValid = type === 'trip'
    ? (name.trim() && startOdo !== '' && endOdo !== '' && distance > 0)
    : (!!amount && parseFloat(amount) > 0);

  function handleSave() {
    if (!isValid) return;
    if (type === 'trip') {
      onSave('trip', {
        id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: name.trim().toUpperCase(),
        startOdo: parseFloat(startOdo), endOdo: parseFloat(endOdo), date,
      });
    } else {
      onSave(type, {
        id: 'e_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        category: type, amount: parseFloat(amount), date, note: '',
        litres: type === 'petrol' && litres !== '' ? parseFloat(litres) : undefined,
      });
    }
  }

  const heroIcon = { trip: CarIcon, petrol: PetrolIcon, maintenance: WrenchIcon }[type];

  const header = React.createElement(CardHeader, {
    title: titles.t, subtitle: titles.s,
    left: React.createElement(IconButton, { onClick: onCancel }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement('div'),
  });
  const footer = React.createElement(PixelButton, {
    onClick: handleSave, disabled: !isValid, icon: React.createElement(SaveGlyph, { size: 14 }),
  }, titles.save);

  const numberField = (label, glyph, value, setter, placeholder) =>
    React.createElement('div', null,
      React.createElement('div', { className: 'field-label' }, glyph, label),
      React.createElement('div', { className: 'field' },
        React.createElement('div', { className: 'field-inner', style: { cursor: 'text' } },
          React.createElement('input', {
            type: 'text', inputMode: 'decimal', value, placeholder,
            onChange: e => setter(e.target.value.replace(/[^0-9.]/g, '')),
          })
        )
      )
    );

  const dateField = React.createElement('div', null,
    React.createElement('div', { className: 'field-label' }, React.createElement(CalendarGlyph, { size: 16 }), 'DATE'),
    React.createElement('div', { className: 'field', onClick: () => { setPendingDate(date); setDateSheet(true); } },
      React.createElement('div', { className: 'field-inner' },
        React.createElement('span', { className: 'value-text' }, formatDateInput(date)),
        React.createElement('span', { className: 'spacer' }),
        React.createElement(CalendarGlyph, { size: 16 })
      )
    )
  );

  let fields;
  if (type === 'trip') {
    fields = React.createElement(React.Fragment, null,
      React.createElement('div', null,
        React.createElement('div', { className: 'field-label' }, React.createElement(NoteGlyph, { size: 16 }), 'TRIP NAME'),
        React.createElement('div', { className: 'field' },
          React.createElement('div', { className: 'field-inner', style: { cursor: 'text' } },
            React.createElement('input', {
              type: 'text', value: name, placeholder: 'E.G. OFFICE COMMUTE', maxLength: 24,
              onChange: e => setName(e.target.value.toUpperCase()),
            })
          )
        )
      ),
      numberField('START ODOMETER', React.createElement(OdoGlyph, { size: 16 }), startOdo, setStartOdo, '0'),
      numberField('END ODOMETER', React.createElement(OdoGlyph, { size: 16 }), endOdo, setEndOdo, '0'),
      React.createElement('div', { className: 'car-distance-pill' + (distance > 0 ? '' : ' is-empty') },
        'DISTANCE', React.createElement('strong', null, (distance > 0 ? fmtKm(distance) : '0') + ' KM')
      ),
      dateField
    );
  } else if (type === 'petrol') {
    fields = React.createElement(React.Fragment, null,
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
      numberField('LITRES (OPTIONAL)', React.createElement(FuelGlyph, { size: 16 }), litres, setLitres, 'FOR MILEAGE'),
      dateField
    );
  } else {
    fields = React.createElement(React.Fragment, null,
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
      dateField
    );
  }

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },
      React.createElement('div', { style: { display: 'grid', placeItems: 'center', padding: '6px 0 2px' } },
        React.createElement('div', { style: { width: 56, height: 56, padding: 3, background: '#1a1610', display: 'grid', placeItems: 'center', clipPath: CAR_CLIP } },
          React.createElement('div', { style: { background: '#f4ead0', width: '100%', height: '100%', display: 'grid', placeItems: 'center', clipPath: CAR_CLIP } },
            React.createElement(heroIcon, { size: 40 })
          )
        )
      ),
      fields,
      dateSheet && React.createElement(Sheet, { title: 'SELECT DATE', onClose: () => setDateSheet(false) },
        React.createElement(Calendar, {
          value: pendingDate, onChange: setPendingDate,
          onConfirm: () => { setDate(pendingDate); setDateSheet(false); },
        })
      )
    )
  );
}

export function CarTripDetailScreen({ trip, onBack, onDelete }) {
  const dist = carDistance(trip);
  const header = React.createElement(CardHeader, {
    title: 'TRIP', subtitle: 'TRIP DETAIL',
    left: React.createElement(IconButton, { onClick: onBack }, React.createElement(BackGlyph, { size: 18 })),
    right: React.createElement('div'),
  });
  const footer = React.createElement(PixelButton, { danger: true, onClick: onDelete, icon: React.createElement(TrashGlyph, { size: 14 }) }, 'DELETE TRIP');

  const metaRow = (label, value) => React.createElement('div', { className: 'cell is-flat' },
    React.createElement('div', { className: 'cell-inner', style: { justifyContent: 'space-between' } },
      React.createElement('span', { className: 'font-pixel', style: { fontSize: 10, color: 'var(--ink-soft)' } }, label),
      React.createElement('span', { className: 'font-pixel', style: { fontSize: 11, color: 'var(--ink)' } }, value)
    )
  );

  return React.createElement('div', { className: 'screen' },
    React.createElement(MainCard, { header, footer },
      React.createElement(CarHeroIcon),
      React.createElement('div', { className: 'detail-amount' }, fmtKm(dist),
        React.createElement('span', { className: 'rs', style: { fontSize: 16, marginLeft: 6 } }, 'KM')
      ),
      React.createElement('div', { className: 'font-pixel text-center', style: { fontSize: 11, color: '#4a3f2c', marginBottom: 12 } }, trip.name),
      metaRow('DATE', formatDateShort(trip.date)),
      metaRow('START', Number(trip.startOdo).toLocaleString('en-IN') + ' KM'),
      metaRow('END', Number(trip.endOdo).toLocaleString('en-IN') + ' KM')
    )
  );
}
