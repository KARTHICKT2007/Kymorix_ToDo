import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Helper to remove any undefined values before sending to Firestore
export const sanitizeTaskPayload = (payload) => {
  const sanitized = {};
  Object.keys(payload).forEach(key => {
    const val = payload[key];
    if (val !== undefined) {
      if (Array.isArray(val)) {
        sanitized[key] = val.map(item => {
          if (typeof item === 'object' && item !== null) {
            return sanitizeTaskPayload(item);
          }
          return item;
        });
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = sanitizeTaskPayload(val);
      } else {
        sanitized[key] = val;
      }
    } else {
      sanitized[key] = null;
    }
  });
  return sanitized;
};

export const getTasksCollectionRef = (userId) => {
  return collection(db, 'users', userId, 'tasks');
};

export const subscribeToTasks = (userId, onNext, onError) => {
  if (!userId) {
    onNext([]);
    return () => {};
  }

  const tasksRef = getTasksCollectionRef(userId);
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = [];
      snapshot.forEach(docSnap => {
        tasks.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      onNext(tasks);
    },
    (error) => {
      console.error('Firestore onSnapshot error:', error);
      if (onError) onError(error);
    }
  );
};

export const addTaskDoc = async (userId, taskData) => {
  if (!userId) throw new Error('User is not authenticated');
  
  const taskId = taskData.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);

  const cleanData = sanitizeTaskPayload({
    ...taskData,
    id: taskId,
    createdAt: taskData.createdAt || new Date().toISOString()
  });

  await setDoc(taskRef, cleanData);
  return { id: taskId, ...cleanData };
};

export const updateTaskDoc = async (userId, taskId, updatedFields) => {
  if (!userId || !taskId) throw new Error('Missing userId or taskId');
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  const cleanFields = sanitizeTaskPayload(updatedFields);
  await updateDoc(taskRef, cleanFields);
};

export const deleteTaskDoc = async (userId, taskId) => {
  if (!userId || !taskId) throw new Error('Missing userId or taskId');
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskRef);
};

export const bulkDeleteDocs = async (userId, taskIds) => {
  if (!userId || !taskIds.length) return;
  const batch = writeBatch(db);
  taskIds.forEach(id => {
    const ref = doc(db, 'users', userId, 'tasks', id);
    batch.delete(ref);
  });
  await batch.commit();
};

export const bulkUpdateDocs = async (userId, taskIds, updateFields) => {
  if (!userId || !taskIds.length) return;
  const batch = writeBatch(db);
  const cleanFields = sanitizeTaskPayload(updateFields);
  taskIds.forEach(id => {
    const ref = doc(db, 'users', userId, 'tasks', id);
    batch.update(ref, cleanFields);
  });
  await batch.commit();
};
