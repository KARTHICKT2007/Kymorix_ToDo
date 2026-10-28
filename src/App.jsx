import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/useTheme';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { useTasks } from './context/useTasks';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StatsDashboard } from './components/StatsDashboard';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { PomodoroTimer } from './components/PomodoroTimer';
import { ImportModal } from './components/ImportModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastAlert } from './components/ToastAlert';
import { PrintTaskSheet } from './components/PrintTaskSheet';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { playSoundAlert } from './utils/audio';
import appLogo from './assets/logo.png';

function MainAppContent() {
  const { toggleTheme, isDark } = useTheme();
  const { confirmDialog, closeConfirm, showToast } = useTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Automatically show tutorial when a first-time user opens the app
  useEffect(() => {
    try {
      const completed = localStorage.getItem('kymorix_tutorial_completed');
      if (completed !== 'true') {
        const timer = setTimeout(() => {
          setIsTutorialOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage access safety
    }
  }, []);

  // Close any existing modals to prevent duplicate/stacked popups
  const closeAllModals = useCallback(() => {
    setIsTaskModalOpen(false);
    setIsImportOpen(false);
    setIsShortcutsOpen(false);
    setIsAuthOpen(false);
    setIsMobileSidebarOpen(false);
    setIsTutorialOpen(false);
  }, []);

  const handleReplayTutorial = useCallback(() => {
    closeAllModals();
    setIsPomodoroOpen(false);
    setIsTutorialOpen(true);
  }, [closeAllModals]);

  const handleOpenNewTask = useCallback(() => {
    closeAllModals();
    setEditingTask(null);
    setIsTaskModalOpen(true);
  }, [closeAllModals]);

  const handleEditTask = useCallback((task) => {
    closeAllModals();
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, [closeAllModals]);

  const handleOpenImport = useCallback(() => {
    closeAllModals();
    setIsImportOpen(true);
  }, [closeAllModals]);

  const handleOpenShortcuts = useCallback(() => {
    closeAllModals();
    setIsShortcutsOpen(true);
  }, [closeAllModals]);

  const handleOpenAuth = useCallback(() => {
    closeAllModals();
    setIsAuthOpen(true);
  }, [closeAllModals]);

  const handleOpenPomodoro = useCallback(() => {
    setIsPomodoroOpen(prev => !prev);
    setIsMobileSidebarOpen(false);
  }, []);

  // Prevent background scrolling when any modal, offcanvas, or confirmation dialog is active
  const isAnyModalOpen =
    isTaskModalOpen ||
    isImportOpen ||
    isShortcutsOpen ||
    isAuthOpen ||
    isMobileSidebarOpen ||
    Boolean(confirmDialog);

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isAnyModalOpen]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Always allow Escape to close topmost popup
      if (e.key === 'Escape') {
        if (confirmDialog) {
          confirmDialog.onCancel?.();
          playSoundAlert('cancel');
          closeConfirm();
          return;
        }
        closeAllModals();
        return;
      }

      // If typing in an input, don't trigger single-letter shortcuts
      if (isInputFocused) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenNewTask();
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
          searchInput.focus();
          const wrap = searchInput.closest('.header-search-wrap');
          if (wrap) {
            wrap.classList.add('search-highlight-pulse');
            setTimeout(() => wrap.classList.remove('search-highlight-pulse'), 600);
          }
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPomodoroOpen(prev => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        toggleTheme();
        showToast(`Theme switched to ${!isDark ? 'Dark' : 'Light'} Mode`, 'info', null, null, 2200);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, isDark, confirmDialog, closeConfirm, showToast, closeAllModals, handleOpenNewTask]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Navbar */}
      <Navbar
        onOpenPomodoro={handleOpenPomodoro}
        onOpenImport={handleOpenImport}
        onOpenShortcuts={handleOpenShortcuts}
        onOpenAuth={handleOpenAuth}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(prev => !prev)}
        onReplayTutorial={handleReplayTutorial}
      />

      {/* Main Container - Compact SaaS layout with balanced vertical rhythm */}
      <main className="app-shell pt-3 pb-3 flex-grow-1">
        <div className="row g-3 g-lg-4 align-items-start">
          {/* Desktop Left Sidebar */}
          <div className="col-lg-4 col-xl-3 d-none d-lg-block sidebar-container">
            <div className="sticky-top" style={{ top: '72px', zIndex: 10 }}>
              <Sidebar
                onOpenNewTask={handleOpenNewTask}
                onOpenPomodoro={handleOpenPomodoro}
                onOpenShortcuts={handleOpenShortcuts}
                onReplayTutorial={handleReplayTutorial}
              />
            </div>
          </div>

          {/* Center / Main Content Area */}
          <div className="col-12 col-lg-8 col-xl-9">
            {/* KPI Statistics Dashboard */}
            <StatsDashboard
              onOpenPomodoro={() => setIsPomodoroOpen(true)}
            />

            {/* Task List Section */}
            <TaskList
              onEditTask={handleEditTask}
              onOpenNewTask={handleOpenNewTask}
              onOpenPomodoro={() => setIsPomodoroOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Mobile Drawer / Offcanvas Sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 offcanvas-animated-backdrop z-3"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="bg-body h-100 shadow-lg p-3 offcanvas-animated-drawer d-flex flex-column"
            style={{ width: '310px', maxWidth: '85vw', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <img
                  src={appLogo}
                  alt="Kymorix"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
                <span className="fw-bold fs-6">Menu & Filters</span>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close menu"
              ></button>
            </div>
            <Sidebar
              onOpenNewTask={handleOpenNewTask}
              onOpenPomodoro={handleOpenPomodoro}
              onOpenShortcuts={handleOpenShortcuts}
              onReplayTutorial={handleReplayTutorial}
              onItemClick={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Floating Pomodoro Widget & Minimized Floating Mini Timer */}
      <PomodoroTimer
        isVisible={isPomodoroOpen}
        onOpen={() => setIsPomodoroOpen(true)}
        onClose={() => setIsPomodoroOpen(false)}
      />

      {/* Mobile Floating Action Button (FAB) for Creating Tasks Quickly */}
      {!isPomodoroOpen && (
        <button
          type="button"
          className="btn btn-primary rounded-circle shadow-lg d-lg-none position-fixed mobile-fab no-print"
          onClick={handleOpenNewTask}
          aria-label="Create new task"
          title="Create new task"
        >
          <i className="bi bi-plus-lg fs-4"></i>
        </button>
      )}

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        editingTask={editingTask}
      />

      {/* JSON Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Firebase Cloud Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Modern Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(confirmDialog)}
        onClose={closeConfirm}
        {...confirmDialog}
      />

      {/* Action Toast Notifications with Undo */}
      <ToastAlert />

      {/* Dedicated Printable Task Sheet for Print & PDF export */}
      <PrintTaskSheet />

      {/* Interactive Step-by-Step Onboarding Tutorial for First-Time Users */}
      <OnboardingTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <MainAppContent />
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
