# ⚡ Kymorix — Productivity & Task Manager

A modern task and workflow management application built with **React 19, Bootstrap 5, and Vite**. Designed for deep work, task organization, timeboxing, and productivity.

## 🚀 Key Features

### 1. 📋 Advanced Task Management
- **Priorities:** High, Medium, and Low with color-coded badges and indicators.
- **Smart Due Dates:** Identify overdue tasks, tasks due today, and upcoming deadlines.
- **Subtasks & Checklists:** Track task progress with interactive checklists and progress bars.
- **Categories & Tags:** Organize tasks by Work, Personal, Study, Finance, Health, or custom categories.
- **Detailed Notes:** Add multi-line notes, criteria, and links to tasks.

### 2. 🍅 Built-in Pomodoro Focus Timer
- **Focus Cycles:** 25-minute focus sessions, 5-minute short breaks, and 15-minute long breaks.
- **Task Linking:** Attach focus sessions to active tasks.
- **Sound Chimes:** Audio notifications when sessions finish.
- **Session Tracking:** Track completed Pomodoro sessions on tasks and the dashboard.

### 3. 📊 Productivity Analytics Dashboard
- **Completion Rate:** View completed tasks and overall progress.
- **Due Today & Overdue Tracker:** Identify urgent tasks.
- **High-Priority Counter:** Monitor important tasks.
- **Pomodoro Counter:** Track daily and all-time focus sessions.

### 4. ⚡ Keyboard Shortcuts
- `N` — Create a new task.
- `/` — Focus global search.
- `P` — Open or close the Pomodoro timer.
- `D` — Toggle dark and light modes.
- `?` — Open keyboard shortcuts.
- `Esc` — Close the active modal.
- `Ctrl + Enter` — Save a task in the modal editor.

### 5. 🛠️ Bulk Actions & Data Safety
- Select multiple tasks for bulk completion, priority changes, and deletion.
- **Undo:** Restore deleted tasks.
- **Celebrations:** Confetti effects when tasks are completed.
- **Export & Backup:** Export task data to JSON or CSV.
- **Import:** Restore or merge validated JSON backups.
- **Print View:** Print-friendly task layouts.
- **Offline Persistence:** Store tasks locally using `localStorage`.

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

### Run ESLint

```bash
npm run lint
```

---

## 🌐 Hosting & Deployment Guide

### Option 1: Vercel (Recommended)

1. Push your project to GitHub.
2. Visit [Vercel](https://vercel.com/).
3. Click **Add New Project** and import your repository.
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**.

### Option 2: Netlify

1. Visit [Netlify](https://www.netlify.com/).
2. Import your GitHub repository.
3. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Click **Deploy site**.

### Option 3: GitHub Pages

1. Configure the `base` option in `vite.config.js` to match your repository path.
2. Run `npm run build`.
3. Deploy the generated `dist` folder using a GitHub Pages deployment workflow.
