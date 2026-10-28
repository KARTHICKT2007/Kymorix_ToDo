import { useTasks } from '../context/useTasks';
import {
  InboxIcon,
  CalendarTodayIcon,
  CalendarUpcomingIcon,
  ZapPriorityIcon,
  AlertOverdueIcon,
  CheckCompletedIcon,
  FolderCategoryIcon,
  StopwatchIcon,
  KeyboardIcon,
  PlusIcon
} from './Icons';

const CATEGORY_COLORS = {
  Work: '#3b82f6',
  Personal: '#10b981',
  Study: '#8b5cf6',
  Health: '#f43f5e',
  Finance: '#f59e0b',
  General: '#64748b'
};

export const Sidebar = ({ onOpenNewTask, onOpenPomodoro, onOpenShortcuts, onReplayTutorial, onItemClick }) => {
  const {
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    allTags,
    setSearchQuery,
    stats,
    tasks
  } = useTasks();

  const filterItems = [
    { id: 'all', label: 'All Tasks', icon: InboxIcon, count: stats.total },
    { id: 'today', label: 'Due Today', icon: CalendarTodayIcon, count: stats.dueToday },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: CalendarUpcomingIcon,
      count: tasks.filter(t => !t.completed && t.dueDate && t.dueDate > new Date().toISOString().slice(0, 10)).length
    },
    { id: 'high-priority', label: 'High Priority', icon: ZapPriorityIcon, count: stats.highPriority },
    { id: 'overdue', label: 'Overdue', icon: AlertOverdueIcon, count: stats.overdue },
    { id: 'completed', label: 'Completed', icon: CheckCompletedIcon, count: stats.completed }
  ];

  return (
    <div className="modern-card p-3 d-flex flex-column h-100">
      {/* Primary Action Button */}
      <button
        type="button"
        className="btn btn-primary w-100 py-2 mb-3 fw-semibold rounded-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
        onClick={() => {
          onOpenNewTask();
          onItemClick?.();
        }}
      >
        <PlusIcon size={16} />
        <span>New Task</span>
        <kbd
          className="bg-white bg-opacity-25 text-white border-0 px-1.5 py-0 rounded ms-auto small d-none d-lg-inline"
          style={{ fontSize: '0.65rem' }}
        >
          N
        </kbd>
      </button>

      {/* Main Views Section */}
      <div className="mb-3">
        <div className="sidebar-section-header">Views</div>
        <div className="d-flex flex-column">
          {filterItems.map(item => {
            const isActive = filter === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setFilter(item.id);
                  setCategoryFilter('all');
                  onItemClick?.();
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <IconComponent size={16} className={isActive ? 'icon-active' : 'icon-muted'} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`sidebar-count-badge ${isActive ? 'active' : ''}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="sidebar-section-header mb-0">Categories</span>
          {categoryFilter !== 'all' && (
            <button
              type="button"
              className="btn btn-link text-decoration-none p-0 text-primary small"
              style={{ fontSize: '0.72rem' }}
              onClick={() => {
                setCategoryFilter('all');
                onItemClick?.();
              }}
            >
              Reset
            </button>
          )}
        </div>
        <div className="d-flex flex-column">
          <button
            type="button"
            className={`sidebar-nav-item ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setCategoryFilter('all');
              onItemClick?.();
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FolderCategoryIcon size={15} className={categoryFilter === 'all' ? 'icon-active' : 'icon-muted'} />
              <span>All Categories</span>
            </div>
          </button>
          {categories.map(cat => {
            const count = tasks.filter(t => t.category === cat && !t.completed).length;
            const isCatActive = categoryFilter === cat;
            const dotColor = CATEGORY_COLORS[cat] || '#94a3b8';
            return (
              <button
                key={cat}
                type="button"
                className={`sidebar-nav-item ${isCatActive ? 'active' : ''}`}
                onClick={() => {
                  setCategoryFilter(cat);
                  onItemClick?.();
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="sidebar-category-dot"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span>{cat}</span>
                </div>
                {count > 0 && (
                  <span className={`sidebar-count-badge ${isCatActive ? 'active' : ''}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Cloud */}
      {allTags.length > 0 && (
        <div className="mb-3">
          <div className="sidebar-section-header">Popular Tags</div>
          <div className="d-flex flex-wrap gap-1 px-1">
            {allTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                type="button"
                className="btn btn-sm btn-outline-secondary border-0 bg-body-secondary py-1 px-2.5 rounded-pill"
                style={{ fontSize: '0.72rem' }}
                onClick={() => {
                  setSearchQuery(tag);
                  onItemClick?.();
                }}
                title={`Filter by #${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Focus Timer & Shortcuts in sidebar */}
      <div className="mt-auto pt-3 border-top sidebar-footer-actions">
        <button
          type="button"
          className="btn btn-outline-danger w-100 rounded-2 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-2 small"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.25)',
            background: 'rgba(239, 68, 68, 0.04)',
            fontSize: '0.82rem'
          }}
          onClick={() => {
            onOpenPomodoro();
            onItemClick?.();
          }}
        >
          <StopwatchIcon size={15} />
          <span>Focus Pomodoro</span>
          <kbd
            className="bg-danger bg-opacity-10 text-danger border-0 px-1 py-0 rounded ms-auto"
            style={{ fontSize: '0.65rem' }}
          >
            P
          </kbd>
        </button>

        <button
          type="button"
          className="btn btn-link text-secondary text-decoration-none w-100 p-1.5 small d-flex align-items-center justify-content-center gap-2"
          style={{ fontSize: '0.78rem' }}
          onClick={() => {
            onOpenShortcuts();
            onItemClick?.();
          }}
        >
          <KeyboardIcon size={14} />
          <span>Shortcuts Guide (?)</span>
        </button>

        <button
          type="button"
          className="btn btn-link text-secondary text-decoration-none w-100 p-1.5 small d-flex align-items-center justify-content-center gap-2 sidebar-replay-btn"
          style={{ fontSize: '0.78rem' }}
          onClick={() => {
            onReplayTutorial?.();
            onItemClick?.();
          }}
        >
          <i className="bi bi-compass text-primary" style={{ fontSize: '13px' }}></i>
          <span>Replay Tutorial</span>
        </button>
      </div>
    </div>
  );
};
