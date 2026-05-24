# 💸 Spend

A retro pixel-game styled personal expense tracker. Track your spending, split bills with friends, and visualise your habits — all wrapped in a nostalgic 8-bit aesthetic.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)

---

## Features

**Personal Expenses**
- Add, edit, and delete expenses with categories, dates, and notes
- Category icons: Food, Travel, Shopping, Bills, Other
- Share individual expenses or your full spend log

**Groups & Splits**
- Create groups with custom pixel icons
- Add shared expenses and split them equally, by percentage, or by exact amount
- Auto-calculated balances — see who owes who at a glance

**Stats**
- Monthly spending breakdown by category
- Visual bar charts in full pixel style

**UI**
- Pixel-art aesthetic with Press Start 2P + VT323 fonts
- Cream / green / ink color palette
- CSS clip-path pixel-notched corners on every element
- Fully client-side — no backend, no account needed
- Data persisted in `localStorage`

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, hand-rolled components |
| Styling | Global CSS with CSS custom properties |
| Fonts | Press Start 2P, VT323 (Google Fonts) |
| Icons | Custom pixel art SVGs (no icon library) |
| Storage | localStorage |
| Deployment | Vercel |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Production build
npm run build
npm start
```

---

## Project Structure

```
spend/
├── app/
│   ├── globals.css       # All styles
│   ├── layout.tsx        # Fonts, metadata
│   └── page.tsx          # Entry point (SSR disabled)
├── components/
│   ├── App.jsx           # Routing & state
│   ├── SpendApp.jsx      # Root wrapper
│   ├── screens.jsx       # Home, Add/Edit, Detail, Stats screens
│   ├── groups.jsx        # Groups & split expense screens
│   ├── icons.jsx         # Pixel art SVG icons & category registry
│   └── ui.jsx            # Shared UI primitives
└── public/
    └── bg.png            # Pixel art background
```

---

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ayush-bahuguna/spend-app)
