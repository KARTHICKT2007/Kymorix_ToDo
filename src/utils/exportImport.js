/**
 * Kymorix Export & Import Utilities
 * Robust JSON & CSV exporters with Excel-compatible UTF-8 BOM,
 * safe Blob URLs, and comprehensive data normalization.
 */

// Helper to trigger browser download safely using Blobs (bypasses data-uri limits and CSP blocks)
const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup after browser initiates download
  setTimeout(() => {
    if (anchor.parentNode) {
      anchor.parentNode.removeChild(anchor);
    }
    URL.revokeObjectURL(url);
  }, 200);
};

/**
 * Cleanly format a single task object for export
 */
const sanitizeTaskForExport = (t) => {
  const subtasksList = Array.isArray(t.subtasks) ? t.subtasks : [];
  return {
    id: t.id || '',
    title: t.title || 'Untitled Task',
    description: t.description || '',
    category: t.category || 'General',
    priority: t.priority || 'medium',
    completed: Boolean(t.completed),
    dueDate: t.dueDate || '',
    dueTime: t.dueTime || '',
    pomodorosEstimated: Number(t.pomodorosEstimated) || 1,
    pomodorosCompleted: Number(t.pomodorosCompleted) || 0,
    subtasks: subtasksList.map(st => ({
      id: st.id || '',
      title: st.title || '',
      completed: Boolean(st.completed)
    })),
    tags: Array.isArray(t.tags) ? t.tags : [],
    createdAt: t.createdAt || '',
    completedAt: t.completedAt || null
  };
};

/**
 * Export tasks as valid, formatted JSON with metadata
 */
export const exportTasksToJSON = (tasks) => {
  const taskList = Array.isArray(tasks) ? tasks : [];
  const timestamp = new Date().toISOString().slice(0, 10);
  const cleanTasks = taskList.map(sanitizeTaskForExport);

  // We export the clean array of tasks (or wrapped payload with metadata)
  const exportPayload = {
    app: 'Kymorix',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalTasks: cleanTasks.length,
    completedTasks: cleanTasks.filter(t => t.completed).length,
    pendingTasks: cleanTasks.filter(t => !t.completed).length,
    tasks: cleanTasks
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  triggerBlobDownload(blob, `kymorix-tasks-${timestamp}.json`);
};

/**
 * Safely escape CSV fields according to RFC 4180
 * Doubles inner quotes and wraps in quotes if commas, quotes, or newlines exist
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/\r\n|\n|\r/g, ' ').replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Export tasks as CSV compatible with Microsoft Excel, Google Sheets, and Numbers
 * Includes UTF-8 BOM (\uFEFF) so Excel displays international characters correctly.
 */
export const exportTasksToCSV = (tasks) => {
  const taskList = Array.isArray(tasks) ? tasks : [];
  const timestamp = new Date().toISOString().slice(0, 10);

  const headers = [
    'Task ID',
    'Title',
    'Status',
    'Priority',
    'Category',
    'Due Date',
    'Due Time',
    'Subtasks Total',
    'Subtasks Completed',
    'Subtasks Checklist',
    'Pomodoros Estimated',
    'Pomodoros Completed',
    'Tags',
    'Notes / Description',
    'Created At',
    'Completed At'
  ];

  const rows = taskList.map(t => {
    const subtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
    const subtasksTotal = subtasks.length;
    const subtasksCompleted = subtasks.filter(s => s.completed).length;
    const subtasksString = subtasks
      .map(s => `${s.completed ? '[x]' : '[ ]'} ${s.title}`)
      .join('; ');
    const tagsString = Array.isArray(t.tags) ? t.tags.join(', ') : '';

    return [
      escapeCSV(t.id || ''),
      escapeCSV(t.title || ''),
      escapeCSV(t.completed ? 'Completed' : 'Pending'),
      escapeCSV((t.priority || 'medium').toUpperCase()),
      escapeCSV(t.category || 'General'),
      escapeCSV(t.dueDate || ''),
      escapeCSV(t.dueTime || ''),
      escapeCSV(subtasksTotal),
      escapeCSV(subtasksCompleted),
      escapeCSV(subtasksString),
      escapeCSV(t.pomodorosEstimated || 1),
      escapeCSV(t.pomodorosCompleted || 0),
      escapeCSV(tagsString),
      escapeCSV(t.description || ''),
      escapeCSV(t.createdAt || ''),
      escapeCSV(t.completedAt || '')
    ].join(',');
  });

  // \uFEFF is the UTF-8 Byte Order Mark for Microsoft Excel
  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, `kymorix-tasks-${timestamp}.csv`);
};

/**
 * Parse and validate JSON task backup from user upload
 * Handles both direct array format and { tasks: [...] } metadata wrapper
 */
export const parseTasksJSON = (jsonString) => {
  const data = JSON.parse(jsonString);
  let taskArray;

  if (Array.isArray(data)) {
    taskArray = data;
  } else if (data && Array.isArray(data.tasks)) {
    taskArray = data.tasks;
  } else {
    throw new Error('Invalid JSON format: Expected a task array or a Kymorix export file.');
  }

  // Validate and normalize shape
  return taskArray.map((t, idx) => ({
    id: t.id || `task-${Date.now()}-${idx}`,
    title: t.title || 'Untitled Task',
    description: t.description || '',
    completed: Boolean(t.completed),
    priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
    category: t.category || 'General',
    dueDate: t.dueDate || '',
    dueTime: t.dueTime || '',
    pomodorosEstimated: Number(t.pomodorosEstimated) || 1,
    pomodorosCompleted: Number(t.pomodorosCompleted) || 0,
    subtasks: Array.isArray(t.subtasks) ? t.subtasks.map((st, sidx) => ({
      id: st.id || `sub-${Date.now()}-${sidx}`,
      title: st.title || 'Subtask',
      completed: Boolean(st.completed)
    })) : [],
    tags: Array.isArray(t.tags) ? t.tags : [],
    createdAt: t.createdAt || new Date().toISOString(),
    completedAt: t.completed ? (t.completedAt || new Date().toISOString()) : null
  }));
};
