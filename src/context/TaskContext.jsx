import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { isOverdue, getTodayDateString, getTomorrowDateString } from '../utils/dateUtils';
import { playSoundAlert } from '../utils/audio';
import { TaskContext } from './taskContextDef';
import { useAuth } from './useAuth';
import {
  subscribeToTasks,
  addTaskDoc,
  updateTaskDoc,
  deleteTaskDoc,
  bulkDeleteDocs,
  bulkUpdateDocs
} from '../firebase/taskService';

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'];

export const TaskProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  // Pure remote state from Firebase - ZERO mock data
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem('kymorix_tasks_backup');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [hasReceivedSnapshot, setHasReceivedSnapshot] = useState(() => Boolean(user?.uid?.startsWith('test-')));
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'
  const [firebaseError, setFirebaseError] = useState(null);

  const isLoadingTasks = authLoading || (Boolean(user) && !hasReceivedSnapshot);

  const [filter, setFilter] = useState('all'); // all | active | completed | today | upcoming | overdue | high-priority
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate | priority | createdAt | title
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [activePomodoroTaskId, setActivePomodoroTaskId] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Confirmation modal dialog state
  const [confirmDialog, setConfirmDialog] = useState(null);

  const requestConfirm = useCallback((config) => {
    setConfirmDialog(config);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  // Undo stack
  const undoStackRef = useRef([]);

  const showToast = useCallback((message, type = 'success', actionLabel = null, onAction = null, duration = 4000, sound = null) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    const safeDuration = Number(duration) > 0 ? Number(duration) : 4000;
    setToast({
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      message,
      type,
      actionLabel,
      onAction,
      duration: safeDuration,
      sound
    });
    // Safety fallback: generous timeout so ToastAlert's own exit animation and pause-on-hover are never cut short
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, safeDuration + 3000);
  }, []);

  const closeToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(null);
  }, []);

  const pushUndoAction = useCallback((action) => {
    undoStackRef.current.push(action);
    if (undoStackRef.current.length > 20) {
      undoStackRef.current.shift();
    }
  }, []);

  const undoLastAction = useCallback(() => {
    const lastAction = undoStackRef.current.pop();
    if (lastAction) {
      playSoundAlert('notification');
      lastAction();
      setToast(null);
    }
  }, []);

  // Subscribe to real-time Firestore tasks when user is present
  useEffect(() => {
    if (!user) return;

    if (user.uid.startsWith('test-')) {
      return;
    }

    const unsubscribe = subscribeToTasks(
      user.uid,
      (remoteTasks) => {
        setTasks(remoteTasks);
        setHasReceivedSnapshot(true);
        setSyncStatus('synced');
        setFirebaseError(null);
      },
      (error) => {
        console.error('Firebase tasks sync error:', error);
        setHasReceivedSnapshot(true);
        setSyncStatus('error');
        setFirebaseError(error.message || 'Permission denied or Firestore not initialized');
        showToast(`Firebase Sync: ${error.message || 'Check Firestore rules'}`, 'warning');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, showToast]);

  // Derived Categories & Tags
  const categories = useMemo(() => {
    const dynamic = tasks.map(t => t.category).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...dynamic]));
    return combined.sort();
  }, [tasks]);

  const allTags = useMemo(() => {
    const set = new Set();
    tasks.forEach(t => {
      if (Array.isArray(t.tags)) {
        t.tags.forEach(tag => set.add(tag));
      }
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const today = getTodayDateString();
    const dueToday = tasks.filter(t => !t.completed && t.dueDate === today).length;
    const overdue = tasks.filter(t => isOverdue(t.dueDate, t.completed)).length;
    const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    let totalPomodorosCompleted = 0;

    tasks.forEach(t => {
      totalPomodorosCompleted += (t.pomodorosCompleted || 0);
      if (Array.isArray(t.subtasks)) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter(st => st.completed).length;
      }
    });

    return {
      total,
      completed,
      active,
      dueToday,
      overdue,
      highPriority,
      completionRate,
      totalSubtasks,
      completedSubtasks,
      totalPomodorosCompleted
    };
  }, [tasks]);

  // Filtered & Sorted Tasks (declared before bulk actions)
  const filteredTasks = useMemo(() => {
    const today = getTodayDateString();
    const tomorrow = getTomorrowDateString();

    const result = tasks.filter(task => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        const matchesTag = (task.tags || []).some(tg => tg.toLowerCase().includes(query));
        const matchesCat = (task.category || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTag && !matchesCat) {
          return false;
        }
      }

      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }

      switch (filter) {
        case 'active':
          return !task.completed;
        case 'completed':
          return task.completed;
        case 'today':
          return !task.completed && task.dueDate === today;
        case 'upcoming':
          return !task.completed && (task.dueDate >= tomorrow);
        case 'overdue':
          return isOverdue(task.dueDate, task.completed);
        case 'high-priority':
          return !task.completed && task.priority === 'high';
        case 'all':
        default:
          return true;
      }
    });

    return result.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      let comparison = 0;

      if (sortBy === 'priority') {
        comparison = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'createdAt') {
        comparison = (b.createdAt || '').localeCompare(a.createdAt || '');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, filter, categoryFilter, searchQuery, sortBy, sortOrder]);

  // Add Task to Firebase
  const addTask = useCallback(async (taskData) => {
    if (!user) {
      showToast('Please wait for Firebase authentication', 'warning');
      return;
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTask = {
      id: taskId,
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      completed: false,
      priority: taskData.priority || 'medium',
      category: taskData.category?.trim() || 'General',
      dueDate: taskData.dueDate || '',
      dueTime: taskData.dueTime || '',
      pomodorosEstimated: Number(taskData.pomodorosEstimated) || 1,
      pomodorosCompleted: 0,
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
      tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    if (user.uid.startsWith('test-')) {
      setTasks(prev => [newTask, ...prev]);
      playSoundAlert('create');
      showToast(`Task "${newTask.title}" saved!`, 'success', null, null, 4500, 'none');
      return newTask;
    }

    setSyncStatus('syncing');
    try {
      await addTaskDoc(user.uid, newTask);
      setSyncStatus('synced');
      playSoundAlert('create');
      showToast(`Task "${newTask.title}" saved to Cloud!`, 'success', null, null, 4500, 'none');
    } catch (err) {
      setSyncStatus('error');
      setFirebaseError(err.message);
      playSoundAlert('error');
      showToast(`Failed to save task to Firebase: ${err.message}`, 'danger', null, null, 5000, 'none');
    }

    return newTask;
  }, [user, showToast]);

  // Update Task in Firebase
  const updateTask = useCallback(async (id, updatedFields) => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      await updateTaskDoc(user.uid, id, updatedFields);
      setSyncStatus('synced');
      playSoundAlert('click');
      showToast('Task updated in Cloud', 'info', null, null, 3000, 'none');
    } catch (err) {
      setSyncStatus('error');
      setFirebaseError(err.message);
      playSoundAlert('error');
      showToast(`Update error: ${err.message}`, 'danger', null, null, 5000, 'none');
    }
  }, [user, showToast]);

  // Toggle complete in Firebase
  const toggleTask = useCallback(async (id) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextCompleted = !task.completed;
    const nextCompletedAt = nextCompleted ? new Date().toISOString() : null;

    setSyncStatus('syncing');
    try {
      await updateTaskDoc(user.uid, id, {
        completed: nextCompleted,
        completedAt: nextCompletedAt
      });
      setSyncStatus('synced');

      if (nextCompleted) {
        playSoundAlert('celebrate');
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 }
        });
        showToast(`Completed "${task.title}"! 🎉`, 'success', null, null, 4500, 'none');
      } else {
        playSoundAlert('toggle');
        showToast(`Marked "${task.title}" as active`, 'info', null, null, 3000, 'none');
      }
    } catch (err) {
      setSyncStatus('error');
      setFirebaseError(err.message);
      playSoundAlert('error');
      showToast(`Failed to update status: ${err.message}`, 'danger', null, null, 5000, 'none');
    }
  }, [user, tasks, showToast]);

  // Delete Task with Cloud Undo
  const deleteTask = useCallback(async (id) => {
    if (!user) return;
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    if (user.uid.startsWith('test-')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTaskIds(prev => prev.filter(item => item !== id));
      if (activePomodoroTaskId === id) {
        setActivePomodoroTaskId(null);
      }
      pushUndoAction(() => {
        setTasks(prev => [taskToDelete, ...prev]);
        playSoundAlert('create');
        showToast('Task restored!', 'info', null, null, 3000, 'none');
      });
      playSoundAlert('delete');
      showToast(`Task "${taskToDelete.title}" deleted successfully`, 'success', 'Undo', undoLastAction, 5000, 'none');
      return;
    }

    setSyncStatus('syncing');
    try {
      await deleteTaskDoc(user.uid, id);
      setSyncStatus('synced');
      setSelectedTaskIds(prev => prev.filter(item => item !== id));

      if (activePomodoroTaskId === id) {
        setActivePomodoroTaskId(null);
      }

      pushUndoAction(async () => {
        try {
          await addTaskDoc(user.uid, taskToDelete);
          playSoundAlert('create');
          showToast('Task restored in Cloud!', 'info', null, null, 3000, 'none');
        } catch (err) {
          showToast(`Restore failed: ${err.message}`, 'danger', null, null, 5000, 'none');
        }
      });

      playSoundAlert('delete');
      showToast(`Task "${taskToDelete.title}" deleted successfully`, 'success', 'Undo', undoLastAction, 5000, 'none');
    } catch (err) {
      setSyncStatus('error');
      setFirebaseError(err.message);
      playSoundAlert('error');
      showToast(`Delete failed: ${err.message}`, 'danger', null, null, 5000, 'none');
    }
  }, [user, tasks, activePomodoroTaskId, pushUndoAction, showToast, undoLastAction]);

  // Subtasks in Firebase
  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    playSoundAlert('toggle');
    const updatedSubtasks = (task.subtasks || []).map(st => {
      if (st.id === subtaskId) {
        return { ...st, completed: !st.completed };
      }
      return st;
    });

    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
    const updates = {
      subtasks: updatedSubtasks,
      ...(allCompleted && !task.completed ? { completed: true, completedAt: new Date().toISOString() } : {})
    };

    try {
      await updateTaskDoc(user.uid, taskId, updates);
    } catch (err) {
      showToast(`Subtask update failed: ${err.message}`, 'danger');
    }
  }, [user, tasks, showToast]);

  const addSubtask = useCallback(async (taskId, title) => {
    if (!user || !title.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    playSoundAlert('create');
    const newSubtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      completed: false
    };

    try {
      await updateTaskDoc(user.uid, taskId, {
        subtasks: [...(task.subtasks || []), newSubtask]
      });
    } catch (err) {
      showToast(`Add subtask failed: ${err.message}`, 'danger');
    }
  }, [user, tasks, showToast]);

  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    playSoundAlert('delete');
    const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);
    try {
      await updateTaskDoc(user.uid, taskId, {
        subtasks: updatedSubtasks
      });
    } catch (err) {
      showToast(`Delete subtask failed: ${err.message}`, 'danger');
    }
  }, [user, tasks, showToast]);

  // Pomodoro
  const incrementPomodoro = useCallback(async (taskId) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await updateTaskDoc(user.uid, taskId, {
        pomodorosCompleted: (task.pomodorosCompleted || 0) + 1
      });
    } catch (err) {
      console.error('Failed to increment pomodoro:', err);
    }
  }, [user, tasks]);

  // Bulk operations using Firebase Batch
  const toggleSelectAll = useCallback(() => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    }
  }, [selectedTaskIds.length, filteredTasks]);

  const toggleSelectTask = useCallback((id) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  const bulkToggleComplete = useCallback(async (markCompleted) => {
    if (!user || selectedTaskIds.length === 0) return;
    setSyncStatus('syncing');
    try {
      await bulkUpdateDocs(user.uid, selectedTaskIds, {
        completed: markCompleted,
        completedAt: markCompleted ? new Date().toISOString() : null
      });
      setSyncStatus('synced');
      playSoundAlert(markCompleted ? 'celebrate' : 'toggle');
      if (markCompleted) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
      }
      showToast(`Updated ${selectedTaskIds.length} tasks in Cloud`, 'success', null, null, 4000, 'none');
      setSelectedTaskIds([]);
    } catch (err) {
      setSyncStatus('error');
      playSoundAlert('error');
      showToast(`Bulk update failed: ${err.message}`, 'danger', null, null, 5000, 'none');
    }
  }, [user, selectedTaskIds, showToast]);

  const bulkDelete = useCallback(async () => {
    if (!user || selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    setSyncStatus('syncing');
    try {
      await bulkDeleteDocs(user.uid, selectedTaskIds);
      setSyncStatus('synced');
      setSelectedTaskIds([]);
      playSoundAlert('delete');
      showToast(`${count} tasks deleted successfully`, 'success', null, null, 4000, 'none');
    } catch (err) {
      setSyncStatus('error');
      playSoundAlert('error');
      showToast(`Bulk delete failed: ${err.message}`, 'danger', null, null, 5000, 'none');
    }
  }, [user, selectedTaskIds, showToast]);

  const bulkSetPriority = useCallback(async (priority) => {
    if (!user || selectedTaskIds.length === 0) return;
    setSyncStatus('syncing');
    try {
      await bulkUpdateDocs(user.uid, selectedTaskIds, { priority });
      setSyncStatus('synced');
      showToast(`Set priority of ${selectedTaskIds.length} tasks to ${priority}`, 'info');
      setSelectedTaskIds([]);
    } catch (err) {
      setSyncStatus('error');
      showToast(`Bulk priority failed: ${err.message}`, 'danger');
    }
  }, [user, selectedTaskIds, showToast]);

  const bulkSetCategory = useCallback(async (category) => {
    if (!user || selectedTaskIds.length === 0) return;
    setSyncStatus('syncing');
    try {
      await bulkUpdateDocs(user.uid, selectedTaskIds, { category });
      setSyncStatus('synced');
      showToast(`Set category of ${selectedTaskIds.length} tasks to ${category}`, 'info');
      setSelectedTaskIds([]);
    } catch (err) {
      setSyncStatus('error');
      showToast(`Bulk category failed: ${err.message}`, 'danger');
    }
  }, [user, selectedTaskIds, showToast]);

  // Import tasks directly to Firebase
  const importTasks = useCallback(async (importedTasks, mode = 'merge') => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      if (mode === 'replace') {
        const allIds = tasks.map(t => t.id);
        if (allIds.length > 0) {
          await bulkDeleteDocs(user.uid, allIds);
        }
      }
      for (const t of importedTasks) {
        await addTaskDoc(user.uid, t);
      }
      setSyncStatus('synced');
      playSoundAlert('create');
      showToast(`Imported ${importedTasks.length} tasks to Firebase!`, 'success', null, null, 4000, 'none');
    } catch (err) {
      setSyncStatus('error');
      playSoundAlert('error');
      showToast(`Import failed: ${err.message}`, 'danger', null, null, 5000, 'none');
    }
  }, [user, tasks, showToast]);

  const clearAllTasks = useCallback(async () => {
    if (!user || tasks.length === 0) return;
    const allIds = tasks.map(t => t.id);
    setSyncStatus('syncing');
    try {
      await bulkDeleteDocs(user.uid, allIds);
      setSyncStatus('synced');
      setSelectedTaskIds([]);
      playSoundAlert('delete');
      showToast('All tasks cleared successfully', 'success', null, null, 4000, 'none');
    } catch (err) {
      setSyncStatus('error');
      playSoundAlert('error');
      showToast(`Clear failed: ${err.message}`, 'danger', null, null, 5000, 'none');
    }
  }, [user, tasks, showToast]);

  const activePomodoroTask = useMemo(() => {
    if (!activePomodoroTaskId) return null;
    return tasks.find(t => t.id === activePomodoroTaskId) || null;
  }, [tasks, activePomodoroTaskId]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        isLoadingTasks,
        syncStatus,
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
        toggleSelectTask,
        clearSelection,
        activePomodoroTaskId,
        setActivePomodoroTaskId,
        activePomodoroTask,
        categories,
        allTags,
        stats,
        toast,
        showToast,
        closeToast,
        confirmDialog,
        requestConfirm,
        closeConfirm,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        incrementPomodoro,
        bulkToggleComplete,
        bulkDelete,
        bulkSetPriority,
        bulkSetCategory,
        importTasks,
        clearAllTasks,
        undoLastAction
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
