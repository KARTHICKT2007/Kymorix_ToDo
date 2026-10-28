import { useTasks } from '../context/useTasks';
import { useAuth } from '../context/useAuth';
import appLogo from '../assets/logo.png';

export const PrintTaskSheet = () => {
  const { filteredTasks, stats, filter, categoryFilter } = useTasks();
  const { user } = useAuth();

  const filterLabels = {
    all: 'All Tasks',
    today: "Today's Focus",
    upcoming: 'Upcoming Tasks',
    'high-priority': 'High Priority Tasks',
    overdue: 'Overdue Tasks',
    completed: 'Completed Tasks'
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="print-task-sheet" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
      {/* Printable Sheet Header */}
      <div className="print-header-top">
        <div>
          <div className="print-brand">
            <img
              src={appLogo}
              alt="Kymorix Logo"
              style={{ width: '22px', height: '22px', objectFit: 'contain', marginRight: '6px' }}
            />
            <h2 className="print-title" style={{ color: '#0f172a' }}>Kymorix</h2>
            <span className="print-badge">Task Sheet</span>
          </div>
          <div className="print-subtitle" style={{ color: '#475569' }}>
            <span>Filter: <strong>{filterLabels[filter] || 'All Tasks'}</strong></span>
            {categoryFilter !== 'all' && (
              <span> &bull; Category: <strong>{categoryFilter}</strong></span>
            )}
          </div>
        </div>

        <div className="print-meta" style={{ color: '#475569' }}>
          <div>Printed: <strong>{currentDate}</strong> at {currentTime}</div>
          <div>Account: <strong>{user?.displayName || user?.email || 'Kymorix Workspace'}</strong></div>
        </div>
      </div>

      {/* Compact Summary Metrics Bar */}
      <div className="print-summary-box" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
        <div className="print-summary-item">
          <span className="print-summary-label">Total Tasks</span>
          <span className="print-summary-val" style={{ color: '#0f172a' }}>{stats.total}</span>
        </div>
        <div className="print-summary-item">
          <span className="print-summary-label">Completed</span>
          <span className="print-summary-val" style={{ color: '#16a34a' }}>{stats.completed}</span>
        </div>
        <div className="print-summary-item">
          <span className="print-summary-label">Pending</span>
          <span className="print-summary-val" style={{ color: '#4f46e5' }}>{stats.total - stats.completed}</span>
        </div>
        <div className="print-summary-item">
          <span className="print-summary-label">Completion</span>
          <span className="print-summary-val" style={{ color: '#0f172a' }}>{stats.completionRate}%</span>
        </div>
        <div className="print-summary-item">
          <span className="print-summary-label">High Priority</span>
          <span className="print-summary-val" style={{ color: '#dc2626' }}>{stats.highPriority}</span>
        </div>
      </div>

      {/* Task Table */}
      {filteredTasks.length === 0 ? (
        <div className="print-empty-box" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
          <h6 className="mb-1 fw-bold" style={{ color: '#334155' }}>No tasks found in this view.</h6>
          <p className="mb-0 small text-muted">All tasks are completed or none have been added to this view yet.</p>
        </div>
      ) : (
        <table className="print-table" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ width: '36px', textAlign: 'center', backgroundColor: '#f1f5f9', color: '#0f172a' }}>#</th>
              <th style={{ width: '55px', textAlign: 'center', backgroundColor: '#f1f5f9', color: '#0f172a' }}>Status</th>
              <th style={{ width: '75px', textAlign: 'center', backgroundColor: '#f1f5f9', color: '#0f172a' }}>Priority</th>
              <th style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>Task Details, Subtasks & Tags</th>
              <th style={{ width: '90px', backgroundColor: '#f1f5f9', color: '#0f172a' }}>Category</th>
              <th style={{ width: '105px', backgroundColor: '#f1f5f9', color: '#0f172a' }}>Due Date</th>
              <th style={{ width: '70px', textAlign: 'center', backgroundColor: '#f1f5f9', color: '#0f172a' }}>Pomodoros</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => {
              const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
              const rowBg = task.completed ? '#f8fafc' : '#ffffff';
              return (
                <tr key={task.id || index} className={task.completed ? 'task-row-completed' : ''} style={{ backgroundColor: rowBg }}>
                  <td style={{ textAlign: 'center', color: '#64748b', backgroundColor: rowBg }}>{index + 1}</td>
                  <td style={{ textAlign: 'center', backgroundColor: rowBg }}>
                    <span className={`print-check-box ${task.completed ? 'checked' : ''}`}>
                      {task.completed ? '✓' : ''}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', backgroundColor: rowBg }}>
                    <span className={`print-priority-tag priority-${task.priority || 'medium'}`}>
                      {(task.priority || 'medium').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ backgroundColor: rowBg }}>
                    <div className={`print-task-title ${task.completed ? 'completed-text' : ''}`} style={{ color: task.completed ? '#94a3b8' : '#0f172a' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="print-task-desc" style={{ color: '#475569' }}>{task.description}</div>
                    )}
                    {subtasks.length > 0 && (
                      <div className="print-subtasks-list">
                        {subtasks.map((st, sidx) => (
                          <div key={st.id || sidx} className="print-subtask-item" style={{ color: '#475569' }}>
                            <span style={{ fontWeight: 'bold', color: st.completed ? '#16a34a' : '#64748b' }}>
                              {st.completed ? '☑' : '☐'}
                            </span>
                            <span className={st.completed ? 'completed-text' : ''}>{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {Array.isArray(task.tags) && task.tags.length > 0 && (
                      <div className="print-tags-row">
                        {task.tags.map(tag => (
                          <span key={tag} className="print-tag-chip">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ backgroundColor: rowBg, color: '#1e293b' }}>
                    <span style={{ fontWeight: 500 }}>{task.category || 'General'}</span>
                  </td>
                  <td style={{ backgroundColor: rowBg, color: '#0f172a' }}>
                    {task.dueDate ? (
                      <div>
                        <div>{task.dueDate}</div>
                        {task.dueTime && <small style={{ color: '#64748b' }}>{task.dueTime}</small>}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', backgroundColor: rowBg, color: '#475569' }}>
                    <small>
                      {task.pomodorosCompleted || 0}/{task.pomodorosEstimated || 1}
                    </small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Printable Sheet Footer */}
      <div className="print-footer" style={{ borderTopColor: '#cbd5e1', color: '#64748b' }}>
        <div>Generated by <strong>Kymorix Task & Productivity Manager</strong></div>
        <div>Personal Productivity Sheet &bull; Confidential</div>
      </div>
    </div>
  );
};
