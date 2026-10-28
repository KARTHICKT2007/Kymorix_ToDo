# ⚡ Kymorix — Production-Grade Productivity & Task Manager

A high-performance, modern, and production-ready task and workflow management application built with **React 19**, **Bootstrap 5**, and **Vite**.

Designed for deep work, task organization, timeboxing, and peak productivity.

---

## 🚀 Key Features

### 1. 📋 Advanced Task Management
- **Priorities**: 🔴 High, 🟡 Medium, 🟢 Low with color-coded badges and flame indicators.
- **Smart Due Dates**: Relative scheduling (Overdue in red, Due Today in blue, Tomorrow in cyan).
- **Subtasks & Checklists**: Progress bar calculation per task with inline quick-add and completion.
- **Categories & Tags**: Filter by Work, Personal, Study, Finance, Health, or create custom categories.
- **Detailed Action Notes**: Support for multi-line notes, criteria, and link annotations.

### 2. 🍅 Built-in Pomodoro Focus Timer
- **25m Focus / 5m Short Break / 15m Long Break** cycles with live animated progress bars.
- **Task Linking**: Directly attach focus sessions to active tasks.
- **Web Audio Sound Chimes**: Synthesized zero-dependency audio notifications when cycles finish.
- **Session Tracking**: Automatic count of completed pomodoros tracked on tasks and dashboard.

### 3. 📊 Productivity KPI Analytics Dashboard
- **Completion Rate**: Visual percentage progress ring with total vs completed counts.
- **Due Today & Overdue Tracker**: Instant insight into urgent items.
- **High Priority Counter**: Keep focus on highest-impact milestones.
- **Pomodoro Counter**: Daily and all-time focus sessions completed.

### 4. ⚡ Power Productivity & Shortcuts
- `N` : Create a new task
- `/` : Focus global search
- `P` : Open / Close Pomodoro Timer
- `D` : Toggle Dark Mode / Light Mode
- `?` : Open Keyboard Shortcuts Modal
- `Esc` : Close any active modal
- `Ctrl + Enter` : Save task in modal editor

### 5. 🛠️ Bulk Actions & Data Safety
- Multi-select tasks with bulk toggle complete, bulk priority change, and bulk delete.
- **Undo Capability**: Deleted tasks can be restored with a single click.
- **Celebration Effects**: Confetti bursts upon task completion.
- **Export & Backup**: Export to **JSON** or **CSV/Excel** anytime.
- **Import**: Restore or merge tasks from JSON backups with validation.
- **Print View**: Clean print-optimized stylesheet for physical task reviews.
- **Full Offline Persistence**: Seamless `localStorage` synchronization.

---

## 💻 Getting Started Locally

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run ESLint Verification
```bash
npm run lint
```

---

## 🌐 Hosting & Deployment Guide

This app is production-ready and can be hosted on any static hosting platform.

### Option 1: Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. Vercel automatically detects Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Select your GitHub repository.
3. Configure settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy site**.

### Option 3: GitHub Pages
1. In `vite.config.js`, set `base: './'`.
2. Run `npm run build`.
3. Deploy the contents of the `dist` folder to your `gh-pages` branch.
