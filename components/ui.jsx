'use client';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { PixelSVG } from './icons';

export function PixelButton({ children, onClick, disabled, ghost, danger, icon, style }) {
  const cls = ['btn'];
  if (ghost) cls.push('btn-ghost');
  if (danger) cls.push('btn-danger');
  if (disabled) cls.push('is-disabled');
  return React.createElement(
    'div',
    { className: cls.join(' '), onClick: disabled ? undefined : onClick, style, role: 'button', tabIndex: 0 },
    React.createElement('div', { className: 'btn-inner', style: !children ? { justifyContent: 'center' } : undefined },
      icon ? React.createElement('span', { style: { display: 'inline-flex' } }, icon) : null,
      children ? React.createElement('span', { className: 'font-pixel', style: { fontSize: 13 } }, children) : null
    )
  );
}

export function IconButton({ children, onClick, style, title }) {
  return React.createElement(
    'div',
    { className: 'icon-btn', onClick, style, role: 'button', tabIndex: 0, title },
    React.createElement('div', { className: 'icon-btn-inner' }, children)
  );
}

export function CardHeader({ title, subtitle, left, right }) {
  return React.createElement('div', null,
    React.createElement('div', { className: 'card-header' },
      left || React.createElement('div'),
      React.createElement('div', null,
        React.createElement('h1', null, title),
        subtitle ? React.createElement('span', { className: 'sub' }, subtitle) : null
      ),
      right || React.createElement('div'),
    ),
    React.createElement('div', { className: 'divider' })
  );
}

export function MainCard({ children, header, footer }) {
  return React.createElement('div', { className: 'main-card' },
    React.createElement('div', { className: 'main-card-inner' },
      header ? React.createElement('div', { className: 'main-card-header' }, header) : null,
      React.createElement('div', { className: 'main-card-scroll' }, children),
      footer ? React.createElement('div', { className: 'main-card-footer' }, footer) : null
    )
  );
}

export function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 30000);
    return () => clearInterval(id);
  }, []);
  return React.createElement('div', { className: 'status-bar' },
    React.createElement('span', null, time),
    React.createElement('span', { className: 'flex', style: { gap: 6, alignItems: 'center' } },
      React.createElement('span', { className: 'dot' }),
    )
  );
}
function formatTime(d) {
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(onDone, 1900);
    return () => clearTimeout(id);
  }, [msg]);
  if (!msg) return null;
  return ReactDOM.createPortal(
    React.createElement('div', { className: 'toast' },
      React.createElement('div', { className: 'toast-inner' }, msg)
    ),
    document.body
  );
}

export function Sheet({ title, onClose, children }) {
  const node = React.createElement('div', { className: 'sheet-overlay', onClick: onClose },
    React.createElement('div', { className: 'sheet', onClick: (e) => e.stopPropagation() },
      React.createElement('div', { className: 'sheet-inner' },
        React.createElement('div', { className: 'sheet-header' },
          React.createElement('div', { className: 'sheet-title font-pixel' }, title),
          React.createElement('div', { className: 'sheet-close', onClick: onClose },
            React.createElement('span', null, '✕')
          )
        ),
        children
      )
    )
  );
  return ReactDOM.createPortal(node, document.body);
}

export function Calendar({ value, onChange, onConfirm }) {
  const initial = value ? new Date(value) : new Date();
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });

  const monthNames = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const dows = ['SU','MO','TU','WE','TH','FR','SA'];

  const first = new Date(view.y, view.m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const daysInPrev = new Date(view.y, view.m, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) {
    cells.push({ d: daysInPrev - startDow + 1 + i, isOther: true, monthOffset: -1 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d, isOther: false, monthOffset: 0 });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({ d: cells.length - daysInMonth - startDow + 1, isOther: true, monthOffset: 1 });
    if (cells.length >= 42) break;
  }

  const today = new Date();
  const selected = value ? new Date(value) : null;

  function go(delta) {
    let m = view.m + delta;
    let y = view.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setView({ y, m });
  }

  function pick(c) {
    if (c.isOther) return;
    const picked = new Date(view.y, view.m, c.d);
    onChange(picked.toISOString());
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'cal-head' },
      React.createElement('div', { className: 'cal-nav', onClick: () => go(-1) },
        React.createElement('span', null, '◀')
      ),
      React.createElement('div', { className: 'cal-month' }, `${monthNames[view.m]} ${view.y}`),
      React.createElement('div', { className: 'cal-nav', onClick: () => go(1) },
        React.createElement('span', null, '▶')
      ),
    ),
    React.createElement('div', { className: 'cal-grid' },
      dows.map((d) => React.createElement('div', { key: d, className: 'cal-dow' }, d)),
      cells.map((c, i) => {
        const cellDate = new Date(view.y, view.m + c.monthOffset, c.d);
        const isToday = cellDate.toDateString() === today.toDateString() && !c.isOther;
        const isSel = selected && cellDate.toDateString() === selected.toDateString() && !c.isOther;
        const cls = ['cal-day'];
        if (c.isOther) cls.push('is-other');
        if (isToday) cls.push('is-today');
        if (isSel) cls.push('is-selected');
        return React.createElement('div', { key: i, className: cls.join(' '), onClick: () => pick(c) }, c.d);
      })
    ),
    React.createElement(PixelButton, { onClick: onConfirm }, 'CONFIRM')
  );
}

export function formatINR(n) {
  if (n === null || n === undefined || isNaN(n)) return '₹0';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(Math.round(n));
  const s = abs.toLocaleString('en-IN');
  return `${sign}₹${s}`;
}
export function formatDateShort(iso) {
  const d = new Date(iso);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
export function formatDateInput(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function TabBtn({ label, active, onClick, style }) {
  return React.createElement('div', {
    className: 'tab-btn' + (active ? ' is-active' : ''),
    onClick, style,
  },
    React.createElement('div', { className: 'tab-btn-inner' }, label)
  );
}

export function CoinSprite({ size = 16 }) {
  const grid = [
    '         ',
    '   yyy   ',
    '  yYYYy  ',
    ' yYRRYYy ',
    ' yYRRYYy ',
    '  yYYYy  ',
    '   yyy   ',
    '         ',
  ];
  const palette = { y: '#c89a2a', Y: '#fbe88a', R: '#a8761a' };
  return React.createElement(PixelSVG, { grid, palette, size });
}
