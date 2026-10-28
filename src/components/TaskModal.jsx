import { useState, useRef, useEffect } from 'react';
import { useTasks } from '../context/useTasks';
import { getTodayDateString, getTomorrowDateString } from '../utils/dateUtils';

function TaskModalForm({ editingTask, onClose }) {
  const { addTask, updateTask, categories } = useTasks();

  const [title, setTitle] = useState(() => editingTask?.title || '');
  const [description, setDescription] = useState(() => editingTask?.description || '');
  const [priority, setPriority] = useState(() => editingTask?.priority || 'medium');
  const [category, setCategory] = useState(() => editingTask?.category || categories[0] || 'Work');
  const [customCategory, setCustomCategory] = useState('');
  const [dueDate, setDueDate] = useState(() => editingTask?.dueDate || getTodayDateString());
  const [dueTime, setDueTime] = useState(() => editingTask?.dueTime || '');
  const [pomodorosEstimated, setPomodorosEstimated] = useState(() => editingTask?.pomodorosEstimated || 1);
  const [subtasks, setSubtasks] = useState(() => Array.isArray(editingTask?.subtasks) ? [...editingTask.subtasks] : []);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [tags, setTags] = useState(() => Array.isArray(editingTask?.tags) ? [...editingTask.tags] : []);
  const [tagInput, setTagInput] = useState('');

  const titleInputRef = useRef(null);
  const subtaskInputRef = useRef(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleAddSubtask = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    // Use entered text or default to Step N so clicking "+ Add" always works immediately
    const titleToAdd = subtaskInput.trim() || `Step ${subtasks.length + 1}`;
    setSubtasks(prev => [
      ...(Array.isArray(prev) ? prev : []),
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: titleToAdd,
        completed: false
      }
    ]);
    setSubtaskInput('');
    setTimeout(() => {
      subtaskInputRef.current?.focus();
    }, 40);
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags(prev => [...prev, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleAddTagSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags(prev => [...prev, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === '__custom__' ? (customCategory.trim() || 'General') : category;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category: finalCategory,
      dueDate,
      dueTime,
      pomodorosEstimated: Number(pomodorosEstimated) || 1,
      subtasks,
      tags
    };

    if (editingTask) {
      updateTask(editingTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    onClose();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-content shadow-lg border-0 rounded-4 task-modal-form" onKeyDown={handleKeyDown}>
      <div className="modal-header border-bottom task-modal-header pb-2 pb-sm-3">
        <h5 id="task-modal-heading" className="modal-title fw-bold d-flex align-items-center gap-2">
          <i className={`bi ${editingTask ? 'bi-pencil-square text-primary' : 'bi-plus-circle-fill text-success'}`}></i>
          {editingTask ? 'Edit Task' : 'Create Productivity Task'}
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>

      <div className="modal-body p-2.5 p-sm-4 task-modal-body">
        {/* Task Title */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase text-secondary">
            Task Title <span className="text-danger">*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            className="form-control form-control-md-lg fw-semibold task-title-input"
            placeholder="What needs to be accomplished?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase text-secondary">
            Description / Action Notes
          </label>
          <textarea
            className="form-control task-desc-textarea"
            rows="2"
            placeholder="Add context, acceptance criteria, or key links..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Priority & Category */}
        <div className="row g-2 g-md-3 mb-3">
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small text-uppercase text-secondary">
              Priority Level
            </label>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="priorityRadio"
                id="prio-low"
                autoComplete="off"
                checked={priority === 'low'}
                onChange={() => setPriority('low')}
              />
              <label className="btn btn-outline-success py-1.5" htmlFor="prio-low">
                🟢 Low
              </label>

              <input
                type="radio"
                className="btn-check"
                name="priorityRadio"
                id="prio-med"
                autoComplete="off"
                checked={priority === 'medium'}
                onChange={() => setPriority('medium')}
              />
              <label className="btn btn-outline-warning py-1.5" htmlFor="prio-med">
                🟡 Med
              </label>

              <input
                type="radio"
                className="btn-check"
                name="priorityRadio"
                id="prio-high"
                autoComplete="off"
                checked={priority === 'high'}
                onChange={() => setPriority('high')}
              />
              <label className="btn btn-outline-danger py-1.5" htmlFor="prio-high">
                🔴 High
              </label>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-bold small text-uppercase text-secondary">
              Category / Area
            </label>
            <div className="input-group">
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__custom__">+ Custom Category...</option>
              </select>
            </div>
            {category === '__custom__' && (
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                required
              />
            )}
          </div>
        </div>

        {/* Due Date & Time & Pomodoros */}
        <div className="row g-2 g-md-3 mb-3">
          <div className="col-12 col-md-5">
            <label className="form-label fw-bold small text-uppercase text-secondary">
              Due Date
            </label>
            <div className="input-group">
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-2 px-sm-2.5"
                onClick={() => setDueDate(getTodayDateString())}
                title="Set to Today"
              >
                Today
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-2 px-sm-2.5"
                onClick={() => setDueDate(getTomorrowDateString())}
                title="Set to Tomorrow"
              >
                Tmrw
              </button>
            </div>
          </div>

          <div className="col-6 col-md-4">
            <label className="form-label fw-bold small text-uppercase text-secondary">
              Due Time
            </label>
            <input
              type="time"
              className="form-control"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label fw-bold small text-uppercase text-secondary">
              Est. Pomodoros
            </label>
            <div className="input-group">
              <span className="input-group-text px-2">🍅</span>
              <input
                type="number"
                min="1"
                max="16"
                className="form-control"
                value={pomodorosEstimated}
                onChange={e => setPomodorosEstimated(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>
        </div>

        {/* Subtasks / Checklist */}
        <div className="mb-3">
          <label className="form-label fw-bold small text-uppercase text-secondary d-flex justify-content-between align-items-center">
            <span>Checklist / Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})</span>
            <span className="fw-normal text-muted small">Press Enter to add</span>
          </label>

          <div className="input-group mb-2 shadow-sm rounded-3">
            <input
              ref={subtaskInputRef}
              id="subtask-input-field"
              type="text"
              className="form-control"
              placeholder="Add a step (e.g. Verify unit tests)..."
              value={subtaskInput}
              onChange={e => setSubtaskInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask(e);
                }
              }}
            />
            <button
              id="subtask-add-button"
              type="button"
              className="btn btn-primary px-2.5 px-sm-3 fw-semibold d-flex align-items-center justify-content-center gap-1 flex-shrink-0 cursor-pointer task-modal-action-btn"
              onClick={handleAddSubtask}
              title="Add checklist step"
              aria-label="Add checklist step"
            >
              <i className="bi bi-plus-lg"></i> Add
            </button>
          </div>

          {subtasks.length > 0 && (
            <div className="list-group list-group-flush border rounded-3 p-1">
              {subtasks.map((st, index) => (
                <div
                  key={st.id}
                  className="list-group-item d-flex align-items-center justify-content-between py-1.5 px-2 border-0"
                >
                  <div className="form-check d-flex align-items-center gap-2 mb-0 flex-grow-1 min-w-0">
                    <input
                      className="form-check-input flex-shrink-0"
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => {
                        setSubtasks(prev =>
                          prev.map(item => item.id === st.id ? { ...item, completed: !item.completed } : item)
                        );
                      }}
                      id={`sub-modal-${st.id}`}
                    />
                    <input
                      type="text"
                      className={`form-control form-control-sm border-0 bg-transparent p-0 ${st.completed ? 'text-decoration-line-through text-muted' : ''}`}
                      value={st.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSubtasks(prev =>
                          prev.map(item => item.id === st.id ? { ...item, title: val } : item)
                        );
                      }}
                      placeholder={`Step ${index + 1}`}
                      aria-label="Subtask title"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-danger p-0 ms-2"
                    onClick={() => handleRemoveSubtask(st.id)}
                    title="Remove step"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-1">
          <label className="form-label fw-bold small text-uppercase text-secondary">
            Tags (Press Enter, Comma, or Add)
          </label>
          <div className="input-group mb-2 shadow-sm rounded-3">
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Urgent, Backend, Sprint1"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            <button
              type="button"
              className="btn btn-outline-primary px-2.5 px-sm-3 fw-semibold d-flex align-items-center justify-content-center gap-1 flex-shrink-0 task-modal-action-btn"
              onClick={handleAddTagSubmit}
              title="Add Tag"
            >
              <i className="bi bi-plus-lg"></i> Add
            </button>
          </div>
          <div className="d-flex flex-wrap gap-1">
            {tags.map(tag => (
              <span
                key={tag}
                className="badge bg-secondary-subtle text-secondary-emphasis border d-flex align-items-center gap-1 py-1 px-2"
              >
                #{tag}
                <button
                  type="button"
                  className="btn-close"
                  style={{ fontSize: '0.65rem' }}
                  aria-label="Remove tag"
                  onClick={() => handleRemoveTag(tag)}
                ></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="modal-footer border-top d-flex flex-wrap justify-content-between align-items-center gap-2 p-2.5 p-sm-3 task-modal-footer">
        <span className="text-muted small d-none d-sm-inline">
          Tip: Press <kbd className="bg-light text-dark border">Ctrl</kbd> + <kbd className="bg-light text-dark border">Enter</kbd> to save
        </span>
        <div className="d-flex gap-2 ms-auto w-100 w-sm-auto justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-3 px-3 py-1.5 py-sm-2 flex-grow-1 flex-sm-grow-0"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary rounded-3 px-3.5 px-sm-4 py-1.5 py-sm-2 fw-bold flex-grow-1 flex-sm-grow-0"
          >
            {editingTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </form>
  );
}

export const TaskModal = ({ isOpen, onClose, editingTask = null }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block modal-animated-backdrop"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-heading"
      style={{ overflowY: 'auto' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg my-1 my-sm-4 modal-animated-dialog task-modal-dialog"
        onClick={e => e.stopPropagation()}
      >
        <TaskModalForm
          key={editingTask ? editingTask.id : 'new'}
          editingTask={editingTask}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
