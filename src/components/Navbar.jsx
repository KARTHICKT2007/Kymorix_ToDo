import { useState, useRef } from 'react';
import { useTasks } from '../context/useTasks';
import { useTheme } from '../context/useTheme';
import { useAuth } from '../context/useAuth';
import { exportTasksToJSON, exportTasksToCSV } from '../utils/exportImport';
import { SearchIcon, CloudCheckIcon, GoogleLogo, StopwatchIcon } from './Icons';
import appLogo from '../assets/logo.png';

export const Navbar = ({
  onOpenPomodoro,
  onOpenImport,
  onOpenShortcuts,
  onOpenAuth,
  onToggleSidebarMobile,
  onReplayTutorial
}) => {
  const { tasks, searchQuery, setSearchQuery, clearAllTasks, syncStatus, requestConfirm, showToast } = useTasks();
  const { toggleTheme, isDark } = useTheme();
  const { user } = useAuth();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const handlePrint = () => {
    showToast('Preparing printable task sheet...', 'print', null, null, 2500);

    // Dismiss open dropdown menus so they don't linger in print capture
    const openMenus = document.querySelectorAll('.dropdown-menu.show');
    openMenus.forEach(el => el.classList.remove('show'));
    const openButtons = document.querySelectorAll('[data-bs-toggle="dropdown"].show');
    openButtons.forEach(el => el.classList.remove('show'));

    // Temporarily ensure light mode for pure white paper printing
    const prevTheme = document.documentElement.getAttribute('data-bs-theme');
    document.documentElement.setAttribute('data-bs-theme', 'light');

    const handleAfterPrint = () => {
      if (prevTheme) {
        document.documentElement.setAttribute('data-bs-theme', prevTheme);
      }
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);

    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportJSON = () => {
    if (tasks.length === 0) {
      showToast('No tasks to export yet.', 'warning');
      return;
    }
    exportTasksToJSON(tasks);
    showToast(`Exported ${tasks.length} task${tasks.length === 1 ? '' : 's'} to JSON backup`, 'export');
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      showToast('No tasks to export yet.', 'warning');
      return;
    }
    exportTasksToCSV(tasks);
    showToast(`Exported ${tasks.length} task${tasks.length === 1 ? '' : 's'} to CSV spreadsheet`, 'export');
  };

  const handleClearAll = () => {
    if (tasks.length === 0) {
      showToast('No tasks to clear.', 'info');
      return;
    }
    requestConfirm({
      title: 'Clear All Tasks?',
      message: `Are you sure you want to delete all ${tasks.length} tasks from Kymorix Cloud? This action cannot be undone.`,
      confirmText: 'Allow Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'trash',
      onConfirm: clearAllTasks
    });
  };

  const syncIndicators = {
    synced: { text: 'Cloud Synced', badge: 'bg-success-subtle text-success border-success-subtle' },
    syncing: { text: 'Syncing...', badge: 'bg-warning-subtle text-warning border-warning-subtle' },
    error: { text: 'Sync Issue', badge: 'bg-danger-subtle text-danger border-danger-subtle' }
  };

  const currentSync = syncIndicators[syncStatus] || syncIndicators.synced;

  return (
    <header className="site-header sticky-top flex-column align-items-stretch">
      <div className="app-shell d-flex align-items-center justify-content-between gap-1.5 gap-sm-2 gap-md-3" style={{ height: '56px' }}>
        {/* Left Section: Brand & Cloud Status */}
        <div className="d-flex align-items-center gap-1.5 gap-sm-2.5 flex-shrink-0">
          {/* Mobile hamburger toggle */}
          <button
            className="btn btn-outline-secondary d-lg-none p-1 border-0 d-flex align-items-center justify-content-center"
            type="button"
            onClick={onToggleSidebarMobile}
            aria-label="Toggle navigation menu"
            style={{ width: '34px', height: '34px' }}
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          {/* Brand Logo */}
          <a className="navbar-brand d-flex align-items-center gap-1.5 gap-sm-2 fw-bold text-decoration-none m-0" href="#">
            <img
              src={appLogo}
              alt="Kymorix Logo"
              className="rounded-2 flex-shrink-0"
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'contain',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
              }}
            />
            <span className="fw-bold tracking-tight text-body" style={{ fontSize: '1.05rem' }}>
              Kymorix
            </span>
            <span className="brand-pro-badge d-none d-sm-inline ms-0.5">
              PRO
            </span>
          </a>

          {/* Cloud Sync Status Indicator */}
          <div
            className={`cloud-status-pill d-none d-lg-flex align-items-center ms-2 ${
              syncStatus === 'syncing' ? 'is-syncing' : syncStatus === 'error' ? 'is-error' : ''
            }`}
            onClick={onOpenAuth}
            title="Firebase Cloud Database Status: Real-time Sync Active"
          >
            <span className="cloud-status-dot" />
            <CloudCheckIcon size={14} className="flex-shrink-0" />
            <span>{currentSync.text}</span>
          </div>
        </div>

        {/* Center Section: Desktop Search Bar */}
        <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-2 mx-xl-4" style={{ maxWidth: '420px', minWidth: 0 }}>
          <div className="header-search-wrap w-100">
            <span className="header-search-icon">
              <SearchIcon size={15} />
            </span>
            <input
              ref={searchInputRef}
              type="search"
              id="main-search-input"
              className="header-search-input"
              placeholder="Search tasks, notes, or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search tasks"
            />
            {searchQuery ? (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search query"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            ) : (
              <kbd className="header-search-kbd d-none d-md-inline-flex" title="Press / to search">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Right Section: Action Controls */}
        <div className="d-flex align-items-center gap-1 gap-sm-2 flex-shrink-0">
          {/* Mobile & Tablet Search Toggle Button */}
          <button
            type="button"
            className="header-btn-icon d-lg-none"
            onClick={() => setIsMobileSearchOpen(prev => !prev)}
            title="Toggle Search"
            aria-label="Toggle Search"
          >
            <i className={`bi ${isMobileSearchOpen ? 'bi-x-lg text-primary' : 'bi-search'}`}></i>
          </button>

          {/* Pomodoro Focus Timer button */}
          <button
            type="button"
            className="header-btn px-2 px-sm-3"
            onClick={onOpenPomodoro}
            title="Pomodoro Focus Timer (P)"
          >
            <StopwatchIcon size={15} className="text-danger flex-shrink-0" />
            <span className="d-none d-sm-inline">Focus</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            className="header-btn-icon"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode (D)`}
          >
            <i className={`bi ${isDark ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'}`}></i>
          </button>

          {/* Account Profile or Clean Google Sign In Button */}
          {user ? (
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary border d-flex align-items-center gap-1.5 py-1 px-1.5 px-sm-2 rounded-2"
                type="button"
                id="userMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ height: '36px' }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="rounded-circle"
                    style={{ width: '22px', height: '22px', objectFit: 'cover' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '22px', height: '22px', fontSize: '0.72rem' }}
                  >
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="small fw-semibold d-none d-md-inline text-body" style={{ fontSize: '0.82rem' }}>
                  {user.displayName?.split(' ')[0] || 'My Account'}
                </span>
                <i className="bi bi-chevron-down text-muted d-none d-sm-inline" style={{ fontSize: '0.65rem' }}></i>
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow-sm border p-2" style={{ minWidth: '220px', fontSize: '0.82rem' }}>
                <li className="px-2 py-1.5 border-bottom mb-1">
                  <div className="fw-bold text-truncate">{user.displayName || 'Kymorix User'}</div>
                  <div className="text-muted small text-truncate">{user.email}</div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle mt-1" style={{ fontSize: '0.65rem' }}>
                    Google Cloud Active
                  </span>
                </li>
                <li>
                  <button className="dropdown-item rounded-1 py-1.5 d-flex align-items-center gap-2" onClick={onOpenShortcuts}>
                    <i className="bi bi-keyboard"></i>
                    <span>Keyboard Shortcuts</span>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item rounded-1 py-1.5 d-flex align-items-center gap-2" onClick={onReplayTutorial}>
                    <i className="bi bi-compass text-primary"></i>
                    <span>Replay Tutorial</span>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item rounded-1 py-1.5 d-flex align-items-center gap-2" onClick={handlePrint}>
                    <i className="bi bi-printer"></i>
                    <span>Print Task Sheet</span>
                  </button>
                </li>
                <li><hr className="dropdown-divider my-1" /></li>
                <li>
                  <button className="dropdown-item rounded-1 py-1.5 text-danger d-flex align-items-center gap-2" onClick={onOpenAuth}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Sign Out / Switch Account</span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <button
              type="button"
              className="header-google-btn px-2 px-sm-2.5 px-xl-3"
              onClick={onOpenAuth}
            >
              <GoogleLogo size={16} />
              <span className="d-none d-xl-inline">Sign in with Google</span>
              <span className="d-xl-none">Sign In</span>
            </button>
          )}

          {/* Quick Actions Overflow Dropdown */}
          <div className="dropdown">
            <button
              className="header-btn-icon"
              type="button"
              id="overflowActions"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="More Options"
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm border p-1" style={{ fontSize: '0.82rem' }}>
              <li>
                <button className="dropdown-item rounded py-1.5 d-flex align-items-center gap-2" onClick={handleExportJSON}>
                  <i className="bi bi-filetype-json text-primary"></i>
                  <span>Export JSON</span>
                </button>
              </li>
              <li>
                <button className="dropdown-item rounded py-1.5 d-flex align-items-center gap-2" onClick={handleExportCSV}>
                  <i className="bi bi-filetype-csv text-success"></i>
                  <span>Export CSV</span>
                </button>
              </li>
              <li>
                <button className="dropdown-item rounded py-1.5 d-flex align-items-center gap-2" onClick={onOpenImport}>
                  <i className="bi bi-cloud-arrow-up text-info"></i>
                  <span>Import Backup</span>
                </button>
              </li>
              <li>
                <button className="dropdown-item rounded py-1.5 d-flex align-items-center gap-2" onClick={onReplayTutorial}>
                  <i className="bi bi-compass text-primary"></i>
                  <span>Replay Tutorial</span>
                </button>
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <button className="dropdown-item rounded py-1.5 text-danger d-flex align-items-center gap-2" onClick={handleClearAll}>
                  <i className="bi bi-trash3 text-danger"></i>
                  <span>Clear All Tasks</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Expandable Mobile & Tablet Search Dropdown Bar */}
      {isMobileSearchOpen && (
        <div className="w-100 px-3 py-2 border-top bg-body d-lg-none mobile-search-dropdown shadow-sm">
          <div className="header-search-wrap w-100">
            <span className="header-search-icon">
              <SearchIcon size={15} />
            </span>
            <input
              type="search"
              className="header-search-input"
              placeholder="Search tasks, tags, or notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              aria-label="Search tasks mobile"
            />
            {searchQuery && (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
