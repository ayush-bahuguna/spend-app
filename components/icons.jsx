'use client';
import React from 'react';

const PX = 2;

function renderPixelArt(grid, palette, scale = PX) {
  const rects = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === ' ' || c === '.') continue;
      const color = palette[c];
      if (!color) continue;
      rects.push(
        React.createElement('rect', {
          key: `${x}-${y}`,
          x: x * scale, y: y * scale,
          width: scale, height: scale,
          fill: color,
          shapeRendering: 'crispEdges',
        })
      );
    }
  }
  return rects;
}

export function PixelSVG({ grid, palette, scale = PX, size }) {
  const w = grid[0].length * scale;
  const h = grid.length * scale;
  return React.createElement('svg', {
    width: size || w, height: size ? (size * h / w) : h,
    viewBox: `0 0 ${w} ${h}`,
    style: { imageRendering: 'pixelated', display: 'block' },
  }, renderPixelArt(grid, palette, scale));
}

const FOOD_BURGER = [
  '                ',
  '    yyyyyyyy    ',
  '  yyYYyyYYyyYy  ',
  ' yyyyyyyyyyyyyy ',
  ' gggreeerrrgggg ',
  ' yyyyyyyyyyyyyy ',
  '  bbbbbbbbbbbb  ',
  '   bbbbbbbbbb   ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
];
const FOOD_PALETTE = { y: '#e3a85a', Y: '#fbe88a', g: '#5aa840', r: '#c84a3a', e: '#e85a3a', b: '#7a4a28' };

export function FoodIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: FOOD_BURGER, palette: FOOD_PALETTE, size });
}

const TRAVEL_TAXI = [
  '                ',
  '                ',
  '       kk       ',
  '    YYYYYYYY    ',
  '   YkkYYYYkkY   ',
  '   YkkYYYYkkY   ',
  '  YYYYYYYYYYYY  ',
  '  YkkYYYYYYkkY  ',
  '  YYYYYYYYYYYY  ',
  '   kkkk  kkkk   ',
  '   kkkk  kkkk   ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
];
const TRAVEL_PALETTE = { Y: '#f0c537', k: '#1a1610' };

export function TravelIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: TRAVEL_TAXI, palette: TRAVEL_PALETTE, size });
}

const SHOPPING_BAG = [
  '                ',
  '    pp    pp    ',
  '   p  p  p  p   ',
  '   p  p  p  p   ',
  '  pppppppppppp  ',
  '  PPPPPPPPPPPP  ',
  '  Pp pp pp ppP  ',
  '  PpppppppppP   ',
  '  PPPPPPPPPPP   ',
  '  PpppppppppP   ',
  '  PPPPPPPPPPP   ',
  '   ppppppppp    ',
  '                ',
  '                ',
  '                ',
  '                ',
];
const SHOPPING_PALETTE = { p: '#d36ba0', P: '#a84a78' };

export function ShoppingIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: SHOPPING_BAG, palette: SHOPPING_PALETTE, size });
}

const BILLS_RECEIPT = [
  '                ',
  '   wwwwwwwwww   ',
  '   wkkkkkkkkw   ',
  '   wwwwwwwwww   ',
  '   wkkkkkkkkw   ',
  '   wkkwwkkkkw   ',
  '   wwwwwwwwww   ',
  '   wkkkkkkkkw   ',
  '   wkkwwwwkkw   ',
  '   wwwwwwwwww   ',
  '   wkkkkkkkkw   ',
  '   wkkkkwwwww   ',
  '   wwwwwwwwww   ',
  '                ',
  '                ',
  '                ',
];
const BILLS_PALETTE = { w: '#f4ead0', k: '#7a6a4a' };

export function BillsIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: BILLS_RECEIPT, palette: BILLS_PALETTE, size });
}

const OTHER_DOTS = [
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '   kk  kk  kk   ',
  '   kk  kk  kk   ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
];
const OTHER_PALETTE = { k: '#3a2f20' };

export function OtherIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: OTHER_DOTS, palette: OTHER_PALETTE, size });
}

const COFFEE = [
  '                ',
  '       ww       ',
  '      w w       ',
  '       w w      ',
  '      w  w      ',
  '                ',
  '   cccccccccc   ',
  '   cwwwwwwwwc   ',
  '   cwbbbbbbwc cc',
  '   cwbbbbbbwccc ',
  '   cwwwwwwwwccc ',
  '   ccccccccccc  ',
  '    cccccccccc  ',
  '                ',
  '                ',
  '                ',
];
const COFFEE_PALETTE = { c: '#f4ead0', w: '#fff8e0', b: '#7a4a28' };
export function CoffeeIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: COFFEE, palette: COFFEE_PALETTE, size });
}

const MONEYBAG = [
  '         ',
  '   www   ',
  '  w w w  ',
  '   www   ',
  '  ggggg  ',
  ' ggDggDg ',
  ' gDgggDg ',
  ' ggggggg ',
  '  ggggg  ',
];
const MONEYBAG_PAL = { g: '#4a7a3a', D: '#2f5224', w: '#2f5224' };
export function MoneyBagGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: MONEYBAG, palette: MONEYBAG_PAL, size });
}

const FOLDER = [
  '          ',
  '  gggg    ',
  ' gGGGGggg ',
  ' gGGGGGGg ',
  ' gGGGGGGg ',
  ' gGGGGGGg ',
  ' gGGGGGGg ',
  '  gggggg  ',
];
const FOLDER_PAL = { g: '#2f5224', G: '#4a7a3a' };
export function FolderGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: FOLDER, palette: FOLDER_PAL, size });
}

const CALENDAR_GLYPH = [
  '          ',
  '  g    g  ',
  ' gggggggg ',
  ' gGGGGGGg ',
  ' gGgGgGGg ',
  ' gGGGGGGg ',
  ' gGgGgGGg ',
  ' gGGGGGGg ',
  ' gggggggg ',
];
const CALENDAR_PAL = { g: '#2f5224', G: '#4a7a3a' };
export function CalendarGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: CALENDAR_GLYPH, palette: CALENDAR_PAL, size });
}

const NOTE_GLYPH = [
  '          ',
  ' gggggggg ',
  ' gGGGGGGg ',
  ' gGkkkkGg ',
  ' gGGGGGGg ',
  ' gGkkkkGg ',
  ' gGGGGGGg ',
  ' gGkkkGGg ',
  ' gggggggg ',
];
const NOTE_PAL = { g: '#2f5224', G: '#4a7a3a', k: '#1a3a14' };
export function NoteGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: NOTE_GLYPH, palette: NOTE_PAL, size });
}

const MENU_GLYPH = [
  '        ',
  ' wwwwww ',
  '        ',
  ' wwwwww ',
  '        ',
  ' wwwwww ',
  '        ',
];
const MENU_PAL = { w: '#f4ead0' };
export function MenuGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: MENU_GLYPH, palette: MENU_PAL, size });
}

const KEBAB_GLYPH = [
  '        ',
  '   ww   ',
  '   ww   ',
  '        ',
  '   ww   ',
  '   ww   ',
  '        ',
  '   ww   ',
  '   ww   ',
  '        ',
];
const KEBAB_PAL = { w: '#f4ead0' };
export function KebabGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: KEBAB_GLYPH, palette: KEBAB_PAL, size });
}

const REFRESH_GLYPH = [
  '          ',
  '    www w ',
  '   ww wwww',
  '  ww    w ',
  '  ww      ',
  '  ww      ',
  '  ww    w ',
  '   ww  ww ',
  '    wwww  ',
  '          ',
];
const REFRESH_PAL = { w: '#f4ead0' };
export function RefreshGlyph({ size = 16, color }) {
  return React.createElement(PixelSVG, { grid: REFRESH_GLYPH, palette: color ? { w: color } : REFRESH_PAL, size });
}

const DASHBOARD_GLYPH = [
  '          ',
  '  ww  ww  ',
  '  ww  ww  ',
  '          ',
  '  ww  ww  ',
  '  ww  ww  ',
  '          ',
];
const DASHBOARD_PAL = { w: '#f4ead0' };
export function DashboardGlyph({ size = 16 }) {
  return React.createElement(PixelSVG, { grid: DASHBOARD_GLYPH, palette: DASHBOARD_PAL, size });
}

const CHART_GLYPH = [
  '         ',
  '       w ',
  '       w ',
  '    w  w ',
  '    w  w ',
  ' w  w  w ',
  ' w  w  w ',
  ' w  w  w ',
  '         ',
];
const CHART_PAL = { w: '#f4ead0' };
export function ChartGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: CHART_GLYPH, palette: CHART_PAL, size });
}

const BACK_GLYPH = [
  '          ',
  '    ww    ',
  '   www    ',
  '  wwwwwww ',
  ' wwwwwwww ',
  '  wwwwwww ',
  '   www    ',
  '    ww    ',
  '          ',
];
const BACK_PAL = { w: '#f4ead0' };
export function BackGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: BACK_GLYPH, palette: BACK_PAL, size });
}

const PLUS_GLYPH = [
  '          ',
  '          ',
  '    ww    ',
  '    ww    ',
  ' wwwwwwww ',
  ' wwwwwwww ',
  '    ww    ',
  '    ww    ',
  '          ',
];
const PLUS_PAL = { w: '#f4ead0' };
export function PlusGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: PLUS_GLYPH, palette: PLUS_PAL, size });
}

const SAVE_GLYPH = [
  '          ',
  ' wwwwwwww ',
  ' wkkkkkkw ',
  ' wkkkkkkw ',
  ' wwwwwwww ',
  ' wkwwwwkw ',
  ' wkwkkwkw ',
  ' wkwwwwkw ',
  ' wwwwwwww ',
];
const SAVE_PAL = { w: '#f4ead0', k: '#2f5224' };
export function SaveGlyph({ size = 16 }) {
  return React.createElement(PixelSVG, { grid: SAVE_GLYPH, palette: SAVE_PAL, size });
}

const RUPEE_GLYPH = [
  '              ',
  '   wwwwwwww   ',
  '   ww    ww   ',
  '   ww    ww   ',
  '   wwwwwwww   ',
  '   ww    ww   ',
  '   wwwwwwww   ',
  '   ww   ww    ',
  '   ww  ww     ',
  '   ww ww      ',
  '   wwww       ',
  '              ',
];
const RUPEE_PAL = { w: '#f4ead0' };
export function RupeeGlyph({ size = 36 }) {
  return React.createElement(PixelSVG, { grid: RUPEE_GLYPH, palette: RUPEE_PAL, size });
}

const TRASH_GLYPH = [
  '          ',
  '   wwww   ',
  ' wwwwwwww ',
  ' wkwkwkww ',
  ' wkwkwkww ',
  ' wkwkwkww ',
  ' wkwkwkww ',
  ' wwwwwwww ',
  '          ',
];
const TRASH_PAL = { w: '#f4ead0', k: '#4a1818' };
export function TrashGlyph({ size = 16 }) {
  return React.createElement(PixelSVG, { grid: TRASH_GLYPH, palette: TRASH_PAL, size });
}

const SHARE_GLYPH = [
  '          ',
  '       w  ',
  '     www  ',
  '   wwwww  ',
  ' wwwwwww  ',
  '   wwwww  ',
  '     www  ',
  '       w  ',
  '          ',
];
const SHARE_PAL = { w: '#f4ead0' };
export function ShareGlyph({ size = 16 }) {
  return React.createElement(PixelSVG, { grid: SHARE_GLYPH, palette: SHARE_PAL, size });
}

const EDIT_GLYPH = [
  '          ',
  '      ww  ',
  '     wwk  ',
  '    wwkk  ',
  '   wwkk   ',
  '  wwkk    ',
  '  wkk     ',
  ' www      ',
  '          ',
];
const EDIT_PAL = { w: '#f4ead0', k: '#2f5224' };
export function EditGlyph({ size = 16 }) {
  return React.createElement(PixelSVG, { grid: EDIT_GLYPH, palette: EDIT_PAL, size });
}

const SLIME = [
  '                ',
  '     pppppp     ',
  '    ppppPPpp    ',
  '   pppPPPPppp   ',
  '   pppPPPPppp   ',
  '  pp wwppww pp  ',
  '  pp wkppwk pp  ',
  '  pppppppppp p  ',
  '  ppp wwww ppp  ',
  '  pppp kk pppp  ',
  '  ppppppppppp   ',
  '  PpPpPpPpPpP   ',
  '   p p p p p    ',
  '                ',
  '                ',
  '                ',
];
const SLIME_PAL = { p: '#a677d0', P: '#7d4ea8', w: '#fff', k: '#1a1610' };
export function SlimeSprite({ size = 90 }) {
  return React.createElement(PixelSVG, { grid: SLIME, palette: SLIME_PAL, size });
}

const PEOPLE_GLYPH = [
  '              ',
  '  ww    ww    ',
  ' wwww  wwww   ',
  '  ww    ww    ',
  ' wwwww wwwww  ',
  ' wwwwwwwwwww  ',
  ' wwwwwwwwwww  ',
  '              ',
];
const PEOPLE_PAL = { w: '#f4ead0' };
export function PeopleGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: PEOPLE_GLYPH, palette: PEOPLE_PAL, size });
}

const SPLIT_GLYPH = [
  '          ',
  '    ww    ',
  '    ww    ',
  ' wwwwwwww ',
  ' ww    ww ',
  ' ww    ww ',
  ' ww    ww ',
  '          ',
];
const SPLIT_PAL = { w: '#f4ead0' };
export function SplitGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: SPLIT_GLYPH, palette: SPLIT_PAL, size });
}

const CHECK_GLYPH = [
  '           ',
  '           ',
  '         w ',
  '        ww ',
  ' w     ww  ',
  ' ww   ww   ',
  '  ww ww    ',
  '   www     ',
  '    w      ',
];
const CHECK_PAL = { w: '#f4ead0' };
export function CheckGlyph({ size = 16 }) {
  return React.createElement(PixelSVG, { grid: CHECK_GLYPH, palette: CHECK_PAL, size });
}

const GROUP_PEOPLE_GRID = [
  '                ',
  '                ',
  '   bb    bbb    ',
  '  bbbb  bbbbb   ',
  '  bbbb  bbbbb   ',
  '   bb    bbb    ',
  '  bbbbbbbbbbb   ',
  ' bbbbbbbbbbbbb  ',
  ' bbbbbbbbbbbbb  ',
  ' bbbbbbbbbbbbb  ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
];
const GROUP_PEOPLE_PAL = { b: '#5a8ed4' };
export function GroupPeopleIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: GROUP_PEOPLE_GRID, palette: GROUP_PEOPLE_PAL, size });
}

const GROUP_HOME_GRID = [
  '                ',
  '                ',
  '       hh       ',
  '      hhhh      ',
  '     hhhhhh     ',
  '    hh hh hh    ',
  '   hh  hh  hh   ',
  '  hh   hh   hh  ',
  '  hh hhhhhh hh  ',
  '  hh hh  hh hh  ',
  '  hh hh  hh hh  ',
  '  hhhhhhhhhhh   ',
  '                ',
  '                ',
  '                ',
  '                ',
];
const GROUP_HOME_PAL = { h: '#c07a3a' };
export function GroupHomeIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: GROUP_HOME_GRID, palette: GROUP_HOME_PAL, size });
}

const GROUP_STAR_GRID = [
  '                ',
  '                ',
  '      sss       ',
  '      sss       ',
  '  sssssssssss   ',
  '   sssssssss    ',
  '    sssssss     ',
  '   ss sssss s   ',
  '  ss  sssss ss  ',
  ' ss   sssss  ss ',
  '      sssss     ',
  '      ss ss     ',
  '                ',
  '                ',
  '                ',
  '                ',
];
const GROUP_STAR_PAL = { s: '#e8b84a' };
export function GroupStarIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: GROUP_STAR_GRID, palette: GROUP_STAR_PAL, size });
}

const GROUP_HEART_GRID = [
  '                ',
  '                ',
  '                ',
  '  hhhh   hhhh   ',
  ' hhhhhhhhhhhh   ',
  ' hhhhhhhhhhhh   ',
  '  hhhhhhhhhh    ',
  '   hhhhhhhh     ',
  '    hhhhhh      ',
  '     hhhh       ',
  '      hh        ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
];
const GROUP_HEART_PAL = { h: '#d44a6a' };
export function GroupHeartIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: GROUP_HEART_GRID, palette: GROUP_HEART_PAL, size });
}

const CAR_GRID = [
  '                ',
  '                ',
  '       ccccc    ',
  '      cwwwwwc   ',
  '    bbcwwwwwcb  ',
  '   bbbbbbbbbbbb ',
  '  bbbbbbbbbbbbbb',
  '  ybbbbbbbbbbybb',
  '  bbbbbbbbbbbbbb',
  '  bbkkbbbbbbkkbb',
  '   kKKk    kKKk ',
  '   kKKk    kKKk ',
  '    kk      kk  ',
  '                ',
  '                ',
  '                ',
];
const CAR_PAL = { b: '#d0584a', c: '#b5453a', w: '#bfe3f0', y: '#ffe27a', k: '#1a1610', K: '#9a9a9a' };
export function CarIcon({ size = 28, palette }) {
  return React.createElement(PixelSVG, { grid: CAR_GRID, palette: palette || CAR_PAL, size });
}

const PETROL_GRID = [
  '                ',
  '    ppppppp     ',
  '    p     p     ',
  '    p www p ee  ',
  '    p www pee e ',
  '    p     pe  e ',
  '    pppppppe  e ',
  '    p     p   e ',
  '    p     ppppe ',
  '    p     p     ',
  '    ppppppp     ',
  '   ppppppppp    ',
  '  ppppppppppp   ',
  '                ',
  '                ',
  '                ',
];
const PETROL_PAL = { p: '#d0584a', w: '#bfe3f0', e: '#6a6a6a' };
export function PetrolIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: PETROL_GRID, palette: PETROL_PAL, size });
}

const WRENCH_GRID = [
  '                ',
  '            ss  ',
  '           ssss ',
  '           ss s ',
  '          sssss ',
  '         sss s  ',
  '        sss     ',
  '       sss      ',
  '      sss       ',
  '     sss        ',
  '    sss         ',
  '   ssss         ',
  '  sss s         ',
  '  ssss          ',
  '   ss           ',
  '                ',
];
const WRENCH_PAL = { s: '#9aa7b5' };
export function WrenchIcon({ size = 28 }) {
  return React.createElement(PixelSVG, { grid: WRENCH_GRID, palette: WRENCH_PAL, size });
}

const CAR_GLYPH = [
  '              ',
  '     wwwww    ',
  '   wwwwwwww   ',
  '  wwwwwwwwww  ',
  '  wwwwwwwwww  ',
  '  ww w  w ww  ',
  '   w      w   ',
  '              ',
];
const CAR_GLYPH_PAL = { w: '#f4ead0' };
export function CarGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: CAR_GLYPH, palette: CAR_GLYPH_PAL, size });
}

const ODO_GLYPH = [
  '          ',
  '   gggg   ',
  '  gGGGGg  ',
  ' gGkGGkGg ',
  ' gGGkGGGg ',
  ' gGGkkGGg ',
  '  gGGGGg  ',
  '   gggg   ',
];
const ODO_PAL = { g: '#2f5224', G: '#4a7a3a', k: '#1a3a14' };
export function OdoGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: ODO_GLYPH, palette: ODO_PAL, size });
}

const FUEL_GLYPH = [
  '          ',
  '    gg    ',
  '    gg    ',
  '   gGGg   ',
  '  gGGGGg  ',
  '  gGGGGg  ',
  '  gGGGGg  ',
  '   gggg   ',
];
const FUEL_PAL = { g: '#2f5224', G: '#4a7a3a' };
export function FuelGlyph({ size = 18 }) {
  return React.createElement(PixelSVG, { grid: FUEL_GLYPH, palette: FUEL_PAL, size });
}

export const CATEGORIES = {
  food:        { id: 'food',        label: 'FOOD',        Icon: FoodIcon,     color: '#d97a3a' },
  travel:      { id: 'travel',      label: 'TRAVEL',      Icon: TravelIcon,   color: '#e8c44a' },
  shopping:    { id: 'shopping',    label: 'SHOPPING',    Icon: ShoppingIcon, color: '#d36ba0' },
  bills:       { id: 'bills',       label: 'BILLS',       Icon: BillsIcon,    color: '#b8a980' },
  petrol:      { id: 'petrol',      label: 'PETROL',      Icon: PetrolIcon,   color: '#d0584a' },
  maintenance: { id: 'maintenance', label: 'MAINTENANCE', Icon: WrenchIcon,   color: '#9aa7b5' },
  other:       { id: 'other',       label: 'OTHER',       Icon: OtherIcon,    color: '#8a8a8a' },
};

export function buildCustomCategory({ id, label, icon, color }) {
  const emoji = icon;
  return {
    id,
    label: label.toUpperCase(),
    color: color || '#8a8a8a',
    Icon: ({ size }) => React.createElement('span', {
      style: { fontSize: size * 0.72, lineHeight: 1, display: 'block', textAlign: 'center' },
    }, emoji),
  };
}
