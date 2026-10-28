import { useState } from 'react';
import { useTasks } from '../context/useTasks';
import { getRelativeDateLabel } from '../utils/dateUtils';
import { TrashIcon, EditIcon, CheckIcon } from './Icons';

export const TaskCard = ({ task, onEdit, onOpenPomodoro }) => {
  const {
    toggleTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    selectedTaskIds,
    toggleSelectTask,
    activePomodoroTaskId,
    setActivePomodoroTaskId,
    requestConfirm
  } = useTasks();

  const [expandedSubtasks, setExpandedSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtaskInput, setShowAddSubtaskInput] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelected = selectedTaskIds.includes(task.id);
  const isPomoActive = activePomodoroTaskId === task.id;
  const dateInfo = getRelativeDateLabel(task.dueDate);

  const subtasksList = task.subtasks || [];
  const totalSubtasks = subtasksList.length;
  const completedSubtasks = subtasksList.filter(s => s.completed).length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleDelete = (e) => {
    e?.stopPropagation();
    requestConfirm({
      title: 'Delete Task?',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      confirmText: 'Allow Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'trash',
      onConfirm: () => {
        setIsDeleting(true);
        setTimeout(() => {
          deleteTask(task.id);
        }, 220);
      },
      onCancel: () => {
        setIsDeleting(false);
      }
    });
  };

  const handleAddSubtaskSubmit = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setShowAddSubtaskInput(false);
  };

  const priorityStyles = {
    high: { badge: 'badge-priority-high', label: 'High' },
    medium: { badge: 'badge-priority-medium', label: 'Medium' },
    low: { badge: 'badge-priority-low', label: 'Low' }
  };

  const prio = priorityStyles[task.priority] || priorityStyles.medium;

  const handleStartFocus = (e) => {
    e.stopPropagation();
    setActivePomodoroTaskId(task.id);
    onOpenPomodoro();
  };

  return (
    <div
      className={`modern-card mb-3 transition-all task-card-enter ${
        isDeleting ? 'task-card-deleting' : ''
      } ${
        task.completed ? 'opacity-70 is-completed-card' : ''
      } ${isSelected ? 'border-primary' : ''}`}
      style={{
        borderLeft: isPomoActive ? '4px solid #ef4444 !important' : ''
      }}
    >
      <div className="card-body p-2.5 p-sm-3 task-card-body">
        <div className="d-flex align-items-start gap-2 gap-sm-2.5">
          {/* Multi-select Checkbox */}
          <div className="task-select-wrap d-flex align-items-center justify-content-center flex-shrink-0 pt-1">
            <input
              className="form-check-input m-0 shadow-none cursor-pointer"
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelectTask(task.id)}
              title="Select for bulk action"
              style={{ width: '16px', height: '16px' }}
            />
          </div>

          {/* Complete Toggle Circle Button */}
          <button
            type="button"
            className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5 transition-all task-complete-btn ${
              task.completed ? 'btn-success text-white shadow-sm btn-check-pop' : 'btn-outline-secondary'
            }`}
            style={{ width: '24px', height: '24px' }}
            onClick={() => toggleTask(task.id)}
            title={task.completed ? 'Mark pending' : 'Mark completed'}
          >
            {task.completed && <CheckIcon size={12} />}
          </button>

          {/* Main Task Content */}
          <div className="flex-grow-1 min-w-0">
            {/* Header info / Badges */}
            <div className="d-flex flex-wrap align-items-center gap-1.5 mb-1.5 task-badges-row">
              {/* Category */}
              <span className="badge bg-primary bg-opacity-10 text-primary fw-medium px-2 py-0.5 rounded-pill border border-primary-subtle task-badge" style={{ fontSize: '0.72rem' }}>
                {task.category || 'General'}
              </span>

              {/* Priority */}
              <span className={`badge ${prio.badge} fw-medium px-2 py-0.5 rounded-pill border task-badge`} style={{ fontSize: '0.72rem' }}>
                {prio.label}
              </span>

              {/* Due Date */}
              {dateInfo && (
                <span className={`badge ${dateInfo.badgeClass} fw-medium px-2 py-0.5 rounded-pill border d-flex align-items-center gap-1 task-badge`} style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-calendar3"></i>
                  {dateInfo.text}
                  {task.dueTime && ` • ${task.dueTime}`}
                </span>
              )}

              {/* Pomodoro link & indicator */}
              <span
                className={`badge ${isPomoActive ? 'bg-danger text-white' : 'bg-body-secondary text-secondary'} fw-medium px-2 py-0.5 rounded-pill d-flex align-items-center gap-1 task-badge`}
                style={{ fontSize: '0.72rem' }}
                title="Pomodoro Focus Sessions"
              >
                <span>🍅</span>
                <span>{task.pomodorosCompleted || 0}/{task.pomodorosEstimated || 1}</span>
                {isPomoActive && <span className="ms-0.5 fw-bold d-none d-sm-inline">(Active)</span>}
              </span>
            </div>

            {/* Title */}
            <h6
              className={`mb-1 fw-bold text-break task-title-text ${
                task.completed ? 'text-decoration-line-through text-muted' : ''
              }`}
              style={{ fontSize: '0.96rem', lineHeight: '1.35' }}
            >
              {task.title}
            </h6>

            {/* Description */}
            {task.description && (
              <p
                className={`mb-2 small text-secondary text-break ${
                  task.completed ? 'text-decoration-line-through opacity-60' : ''
                }`}
                style={{ whiteSpace: 'pre-line', fontSize: '0.82rem' }}
              >
                {task.description}
              </p>
            )}

            {/* Tags */}
            {Array.isArray(task.tags) && task.tags.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-2">
                {task.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="badge bg-body-secondary text-secondary border-0 rounded-pill py-0.5 px-2"
                    style={{ fontSize: '0.68rem' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Subtasks Progress Bar & Toggle */}
            {totalSubtasks > 0 && (
              <div className="mt-2 mb-1.5">
                <div
                  className="d-flex align-items-center justify-content-between text-secondary small mb-1 cursor-pointer"
                  onClick={() => setExpandedSubtasks(!expandedSubtasks)}
                  style={{ cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  <span className="fw-semibold d-flex align-items-center gap-1">
                    <i className={`bi ${expandedSubtasks ? 'bi-chevron-down' : 'bi-chevron-right'} text-primary`}></i>
                    Checklist ({completedSubtasks}/{totalSubtasks})
                  </span>
                  <span>{subtaskProgress}%</span>
                </div>
                <div className="progress" style={{ height: '4px', backgroundColor: 'var(--ff-surface-hover)' }}>
                  <div
                    className={`progress-bar rounded-pill ${subtaskProgress === 100 ? 'bg-success' : 'bg-primary'}`}
                    role="progressbar"
                    style={{ width: `${subtaskProgress}%` }}
                    aria-valuenow={subtaskProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>

                {/* Subtasks List */}
                {expandedSubtasks && (
                  <div className="mt-2 ps-2 border-start border-2 border-primary-subtle">
                    {subtasksList.map(st => (
                      <div
                        key={st.id}
                        className="d-flex align-items-center justify-content-between py-1 small"
                      >
                        <div className="form-check mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubtask(task.id, st.id)}
                            id={`st-${st.id}`}
                          />
                          <label
                            className={`form-check-label ${
                              st.completed ? 'text-decoration-line-through text-muted' : ''
                            }`}
                            htmlFor={`st-${st.id}`}
                          >
                            {st.title}
                          </label>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0"
                          onClick={() => deleteSubtask(task.id, st.id)}
                          title="Delete subtask"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Quick Add Subtask */}
                    {showAddSubtaskInput ? (
                      <form onSubmit={handleAddSubtaskSubmit} className="d-flex flex-wrap gap-1.5 mt-2">
                        <input
                          type="text"
                          className="form-control form-control-sm flex-grow-1"
                          placeholder="New step..."
                          value={newSubtaskTitle}
                          onChange={e => setNewSubtaskTitle(e.target.value)}
                          autoFocus
                          style={{ minWidth: '130px' }}
                        />
                        <div className="d-flex gap-1">
                          <button type="submit" className="btn btn-primary btn-sm px-2.5">Add</button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm px-2"
                            onClick={() => setShowAddSubtaskInput(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-decoration-none p-0 mt-1 small text-primary fw-semibold d-inline-flex align-items-center"
                        onClick={() => setShowAddSubtaskInput(true)}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Add subtask step
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Dropdown / Action Buttons */}
          <div className="d-flex align-items-center gap-1 gap-sm-1.5 flex-shrink-0 ms-auto task-actions-row">
            {!task.completed && (
              <button
                type="button"
                className={`btn btn-sm ${isPomoActive ? 'btn-danger text-white' : 'btn-outline-danger'} rounded-pill px-2 py-0.5 px-sm-2.5 py-sm-1 d-flex align-items-center gap-1 border-danger-subtle task-focus-btn`}
                style={{ fontSize: '0.72rem', background: isPomoActive ? '' : 'rgba(239, 68, 68, 0.05)' }}
                onClick={handleStartFocus}
                title="Start Pomodoro Focus on this task"
              >
                <span>🍅</span>
                <span className="d-none d-md-inline fw-semibold">Focus</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary border-0 rounded-circle p-1 d-flex align-items-center justify-content-center task-action-icon-btn"
              style={{ width: '32px', height: '32px' }}
              onClick={() => onEdit(task)}
              title="Edit Task"
              aria-label="Edit Task"
            >
              <EditIcon size={14} />
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger border-0 rounded-circle p-1 d-flex align-items-center justify-content-center task-action-icon-btn"
              style={{ width: '32px', height: '32px' }}
              onClick={handleDelete}
              title="Delete Task"
              aria-label="Delete Task"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
