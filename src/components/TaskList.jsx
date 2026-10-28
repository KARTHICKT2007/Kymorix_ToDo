import { useState } from 'react';
import { useTasks } from '../context/useTasks';
import { useAuth } from '../context/useAuth';
import { TaskCard } from './TaskCard';
import { getTodayDateString } from '../utils/dateUtils';
import { CloudCheckIcon, StopwatchIcon, CheckCompletedIcon, GoogleLogo } from './Icons';

export const TaskList = ({ onEditTask, onOpenNewTask, onOpenPomodoro }) => {
  const {
    filteredTasks,
    isLoadingTasks,
    firebaseError,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedTaskIds,
    toggleSelectAll,
    clearSelection,
    bulkToggleComplete,
    bulkDelete,
    bulkSetPriority,
    addTask,
    requestConfirm
  } = useTasks();

  const { user, handleGoogleSignIn } = useAuth();
  const [quickTitle, setQuickTitle] = useState('');

  const handleBulkDelete = () => {
    requestConfirm({
      title: `Delete ${selectedTaskIds.length} Tasks?`,
      message: `Are you sure you want to permanently delete these ${selectedTaskIds.length} selected tasks from Cloud Firestore?`,
      confirmText: 'Allow Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'trash',
      onConfirm: bulkDelete
    });
  };

  const filterTitles = {
    all: 'All Tasks',
    today: "Today's Focus",
    upcoming: 'Upcoming Tasks',
    'high-priority': 'High Priority Tasks',
    overdue: 'Overdue Tasks',
    completed: 'Completed Tasks'
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    if (!user) {
      await handleGoogleSignIn();
      return;
    }

    await addTask({
      title: quickTitle.trim(),
      priority: filter === 'high-priority' ? 'high' : 'medium',
      category: categoryFilter !== 'all' ? categoryFilter : 'Work',
      dueDate: filter === 'today' ? getTodayDateString() : '',
      pomodorosEstimated: 1
    });

    setQuickTitle('');
  };

  const isAllSelected = filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length;

  // If user is not authenticated, render ONE clean, spacious onboarding card
  if (!user) {
    return (
      <div className="auth-hero-card">
        <div className="mx-auto" style={{ maxWidth: '540px' }}>
          <div
            className="rounded-circle bg-white shadow-sm p-3 mb-3 d-inline-flex align-items-center justify-content-center"
            style={{ width: '64px', height: '64px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <h2 className="h3 fw-bold mb-2">Welcome to Kymorix</h2>
          <p className="text-secondary mb-4 leading-relaxed">
            Your tasks, checklists, and Pomodoro sessions synced in real-time with Google Cloud. Sign in to start organizing your workflow.
          </p>
          <button
            type="button"
            className="btn btn-primary px-4 py-2.5 rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-2 mb-4"
            onClick={handleGoogleSignIn}
          >
            <GoogleLogo size={18} />
            <span>Continue with Google</span>
            <i className="bi bi-arrow-right"></i>
          </button>

          {/* 3 Modern Feature Tiles */}
          <div className="row g-3 pt-2">
            <div className="col-12 col-sm-4">
              <div className="hero-feature-tile">
                <div
                  className="hero-feature-icon"
                  style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}
                >
                  <CloudCheckIcon size={18} />
                </div>
                <div className="fw-bold small text-body mb-1" style={{ fontSize: '0.82rem' }}>
                  Real-time Sync
                </div>
                <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                  Cloud Firestore
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-4">
              <div className="hero-feature-tile">
                <div
                  className="hero-feature-icon"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}
                >
                  <StopwatchIcon size={18} />
                </div>
                <div className="fw-bold small text-body mb-1" style={{ fontSize: '0.82rem' }}>
                  Pomodoro Focus
                </div>
                <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                  Integrated Timer
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-4">
              <div className="hero-feature-tile">
                <div
                  className="hero-feature-icon"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
                >
                  <CheckCompletedIcon size={18} />
                </div>
                <div className="fw-bold small text-body mb-1" style={{ fontSize: '0.82rem' }}>
                  Smart Checklists
                </div>
                <div className="text-secondary small" style={{ fontSize: '0.73rem' }}>
                  Subtasks Progress
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-main-wrap">
      {/* Firebase Notice if error occurs */}
      {firebaseError && (
        <div className="alert alert-warning border-warning shadow-sm rounded-3 p-3 mb-3 d-flex align-items-start gap-2.5">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-5 flex-shrink-0 mt-0.5"></i>
          <div>
            <h6 className="fw-bold mb-1 small">Firebase Cloud Notice</h6>
            <p className="mb-0 small text-secondary">
              Firestore reported: <code>{firebaseError}</code>. Check your network or permission settings.
            </p>
          </div>
        </div>
      )}

      {/* Header & Controls Alignment */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom task-header-row">
        <div className="d-flex align-items-center gap-1.5 gap-sm-2 flex-wrap min-w-0">
          <h1 className="h5 h4-sm fw-bold mb-0 text-truncate task-header-title">
            {filterTitles[filter] || 'Tasks'}
          </h1>
          {categoryFilter !== 'all' && (
            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-0.5 small text-truncate" style={{ maxWidth: '110px' }}>
              {categoryFilter}
            </span>
          )}
          <span className="badge rounded-pill bg-body-secondary text-secondary border px-2 py-0.5 small">
            {filteredTasks.length}
          </span>
        </div>

        {/* Sort Controls */}
        <div className="d-flex align-items-center gap-1.5 ms-auto flex-shrink-0 task-sort-wrap">
          <span className="text-secondary small fw-medium d-none d-sm-inline">Sort:</span>
          <select
            id="sort-select"
            className="form-select form-select-sm rounded-3 shadow-none border task-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Alphabetical</option>
            <option value="createdAt">Created</option>
          </select>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-3 border d-flex align-items-center justify-content-center flex-shrink-0 task-sort-btn"
            style={{ width: '32px', height: '32px' }}
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            title={`Sort: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            aria-label="Toggle sort order"
          >
            <i className={`bi ${sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down'}`}></i>
          </button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="mb-3 quick-add-form">
        <div className="modern-card p-1.5 p-sm-2 d-flex align-items-center gap-1.5 gap-sm-2 quick-add-card">
          <span className="ps-1 ps-sm-2 text-primary d-flex align-items-center flex-shrink-0 quick-add-icon">
            <i className="bi bi-plus-circle"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 bg-transparent py-1 py-sm-1.5 px-1 shadow-none min-w-0 quick-add-input"
            placeholder="Add task quickly..."
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary px-3 py-1.5 rounded-3 fw-semibold flex-shrink-0 quick-add-btn"
            disabled={!quickTitle.trim()}
          >
            <span className="d-none d-sm-inline">Add Task</span>
            <span className="d-sm-none">Add</span>
          </button>
        </div>
      </form>

      {/* Bulk Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="modern-card d-flex flex-wrap align-items-center justify-content-between p-2.5 px-3 mb-3 border-primary-subtle gap-2">
          <div className="d-flex align-items-center gap-2.5">
            <div className="form-check mb-0">
              <input
                className="form-check-input shadow-none"
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                id="select-all-filtered"
              />
              <label className="form-check-label fw-bold small" htmlFor="select-all-filtered">
                {selectedTaskIds.length} selected
              </label>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none text-muted p-0 small"
              onClick={clearSelection}
            >
              Clear
            </button>
          </div>

          <div className="d-flex align-items-center gap-1.5 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-success border py-1 px-2.5 fw-semibold small rounded-2"
              onClick={() => bulkToggleComplete(true)}
            >
              <i className="bi bi-check2 me-1"></i> Complete
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-warning border py-1 px-2.5 fw-semibold small rounded-2"
              onClick={() => bulkToggleComplete(false)}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Active
            </button>

            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-secondary border py-1 px-2.5 dropdown-toggle fw-semibold small rounded-2"
                type="button"
                data-bs-toggle="dropdown"
              >
                Priority
              </button>
              <ul className="dropdown-menu shadow border-0 rounded-3 p-1.5 small">
                <li>
                  <button className="dropdown-item text-danger rounded-2 py-1" onClick={() => bulkSetPriority('high')}>
                    🔴 High Priority
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-warning rounded-2 py-1" onClick={() => bulkSetPriority('medium')}>
                    🟡 Medium Priority
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-success rounded-2 py-1" onClick={() => bulkSetPriority('low')}>
                    🟢 Low Priority
                  </button>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger border py-1 px-2.5 fw-semibold small rounded-2"
              onClick={handleBulkDelete}
              title="Delete selected tasks"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoadingTasks ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm" role="status">
            <span className="visually-hidden">Syncing...</span>
          </div>
          <p className="mt-2 text-secondary small">Synchronizing tasks with Cloud Firestore...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="task-items-container">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onOpenPomodoro={onOpenPomodoro}
            />
          ))}
        </div>
      ) : (
        /* Clean Single Empty State */
        <div className="modern-card empty-tasks-card p-sm-5 text-center my-2 my-sm-3">
          <div className="empty-tasks-icon-wrap d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-2 mb-sm-3">
            {searchQuery ? <i className="bi bi-search"></i> : filter === 'completed' ? <i className="bi bi-check2-all"></i> : <i className="bi bi-inbox"></i>}
          </div>
          <h3 className="empty-tasks-title fw-bold mb-1 mb-sm-2">
            {searchQuery
              ? 'No matching tasks found'
              : filter === 'completed'
              ? 'No completed tasks yet'
              : filter === 'overdue'
              ? 'Zero overdue tasks! Great job!'
              : 'No tasks in this view'}
          </h3>
          <p className="empty-tasks-desc text-secondary mx-auto mb-3 mb-sm-4 small">
            {searchQuery
              ? `We couldn't find any tasks matching "${searchQuery}". Try a different keyword.`
              : filter === 'completed'
              ? 'Tasks you check off will appear here.'
              : 'Add your first task above to start organizing your day.'}
          </p>

          <div className="empty-tasks-actions d-flex justify-content-center gap-2">
            {searchQuery || categoryFilter !== 'all' || filter !== 'all' ? (
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-3 px-sm-3.5 py-1.5 fw-semibold small"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setCategoryFilter('all');
                }}
              >
                Clear Filters
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-primary rounded-pill px-3.5 px-sm-4 py-2 fw-semibold shadow-sm create-task-btn d-inline-flex align-items-center justify-content-center gap-1.5"
              onClick={onOpenNewTask}
            >
              <i className="bi bi-plus-lg"></i>
              <span>Create Task</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
