# 🌸 Daydream — Cozy Productivity Dashboard

A responsive productivity dashboard built with **React, TypeScript, and Vite**. Track tasks, daily habits, calendar dates, and weekly activity in a soft pastel interface.

## Features
- Create, complete, filter, search, and delete tasks
- Add, check off, and delete daily habits
- Browse dates using the calendar and day navigation
- Daily completion stats and a weekly activity chart
- Persistent data with browser `localStorage`
- Responsive layout for desktop and mobile
- Accessible form labels and interactive buttons

## Getting started
Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed in your terminal (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Tech stack
- React 18, TypeScript, Vite
- Lucide React icons
- CSS Grid and Flexbox
- localStorage for persistence (no backend required)

## Project structure
```
src/
  App.tsx       # Dashboard, tasks, habits, calendar, and reusable UI components
  main.tsx      # React entry point
  style.css     # Responsive visual design
```

## Next improvements
- Extract components into separate files and add React Testing Library tests
- Add a REST API backend for multi-device sync
- Add drag-and-drop task sorting and due-time reminders

## Note
The dashboard starts with sample tasks and habits so you can explore it. Your changes are saved locally in the browser.
