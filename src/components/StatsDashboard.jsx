import { useTasks } from '../context/useTasks';
import {
  PieChartIcon,
  CalendarTodayIcon,
  ZapPriorityIcon,
  StopwatchIcon
} from './Icons';

export const StatsDashboard = ({ onOpenPomodoro }) => {
  const { stats, setFilter } = useTasks();

  return (
    <div className="row g-2 g-sm-3 mb-2 mb-sm-3 stats-dashboard-grid">
      {/* 1. Completion Rate */}
      <div className="col-6 col-xl-3">
        <div className="kpi-card p-2.5 p-sm-3 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1 mb-sm-2">
              <span className="sidebar-section-header p-0 mb-0 kpi-label" style={{ fontSize: '0.66rem' }}>Completion</span>
              <div
                className="kpi-icon-pill"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#059669', width: '26px', height: '26px' }}
              >
                <PieChartIcon size={14} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-1.5 mb-1 mb-sm-1.5">
              <span className="fs-5 fs-sm-4 fw-bold lh-1">{stats.completionRate}%</span>
              <span className="text-secondary small text-truncate kpi-subtext" style={{ fontSize: '0.72rem' }}>
                ({stats.completed}/{stats.total})
              </span>
            </div>
          </div>
          <div className="progress mt-auto" style={{ height: '3px', backgroundColor: 'var(--ff-surface-hover)' }}>
            <div
              className="progress-bar rounded-pill"
              role="progressbar"
              style={{ width: `${stats.completionRate}%`, backgroundColor: '#10b981' }}
              aria-valuenow={stats.completionRate}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Due Today */}
      <div className="col-6 col-xl-3">
        <div
          className="kpi-card p-2.5 p-sm-3 d-flex flex-column justify-content-between"
          style={{ cursor: 'pointer' }}
          onClick={() => setFilter('today')}
        >
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1 mb-sm-2">
              <span className="sidebar-section-header p-0 mb-0 kpi-label" style={{ fontSize: '0.66rem' }}>Due Today</span>
              <div
                className="kpi-icon-pill"
                style={{ backgroundColor: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5', width: '26px', height: '26px' }}
              >
                <CalendarTodayIcon size={14} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-1.5 mb-1 mb-sm-1.5">
              <span className="fs-5 fs-sm-4 fw-bold lh-1 text-primary">
                {stats.dueToday}
              </span>
              <span className="text-secondary small kpi-subtext" style={{ fontSize: '0.72rem' }}>
                due today
              </span>
            </div>
          </div>
          <div className="kpi-indicator-bar mt-auto">
            <div
              className="kpi-indicator-fill bg-primary"
              style={{ width: stats.dueToday > 0 ? '100%' : '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. High Priority */}
      <div className="col-6 col-xl-3">
        <div
          className="kpi-card p-2.5 p-sm-3 d-flex flex-column justify-content-between"
          style={{ cursor: 'pointer' }}
          onClick={() => setFilter('high-priority')}
        >
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1 mb-sm-2">
              <span className="sidebar-section-header p-0 mb-0 kpi-label" style={{ fontSize: '0.66rem' }}>High Priority</span>
              <div
                className="kpi-icon-pill"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', width: '26px', height: '26px' }}
              >
                <ZapPriorityIcon size={14} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-1.5 mb-1 mb-sm-1.5">
              <span className="fs-5 fs-sm-4 fw-bold lh-1 text-danger">
                {stats.highPriority}
              </span>
              <span className="text-secondary small kpi-subtext" style={{ fontSize: '0.72rem' }}>
                urgent tasks
              </span>
            </div>
          </div>
          <div className="kpi-indicator-bar mt-auto">
            <div
              className="kpi-indicator-fill bg-danger"
              style={{ width: stats.highPriority > 0 ? '100%' : '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4. Focus Pomodoros */}
      <div className="col-6 col-xl-3">
        <div
          className="kpi-card p-2.5 p-sm-3 d-flex flex-column justify-content-between"
          style={{ cursor: 'pointer' }}
          onClick={onOpenPomodoro}
        >
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1 mb-sm-2">
              <span className="sidebar-section-header p-0 mb-0 kpi-label" style={{ fontSize: '0.66rem' }}>Pomodoros</span>
              <div
                className="kpi-icon-pill"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#b45309', width: '26px', height: '26px' }}
              >
                <StopwatchIcon size={14} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-1.5 mb-1 mb-sm-1.5">
              <span className="fs-5 fs-sm-4 fw-bold lh-1" style={{ color: '#d97706' }}>
                {stats.totalPomodorosCompleted}
              </span>
              <span className="text-secondary small kpi-subtext" style={{ fontSize: '0.72rem' }}>
                sessions done
              </span>
            </div>
          </div>
          <div className="kpi-indicator-bar mt-auto">
            <div
              className="kpi-indicator-fill bg-warning"
              style={{ width: stats.totalPomodorosCompleted > 0 ? '100%' : '0%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
