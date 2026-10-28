export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isOverdue = (dateStr, isCompleted = false) => {
  if (!dateStr || isCompleted) return false;
  const today = getTodayDateString();
  return dateStr < today;
};

export const isToday = (dateStr) => {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
};

export const isTomorrow = (dateStr) => {
  if (!dateStr) return false;
  return dateStr === getTomorrowDateString();
};

export const getRelativeDateLabel = (dateStr) => {
  if (!dateStr) return null;
  if (isToday(dateStr)) return { text: 'Today', badgeClass: 'bg-primary text-white' };
  if (isTomorrow(dateStr)) return { text: 'Tomorrow', badgeClass: 'bg-info text-dark' };
  if (isOverdue(dateStr)) return { text: 'Overdue', badgeClass: 'bg-danger text-white' };
  
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  const formatted = dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(new Date().getFullYear() !== Number(year) ? { year: 'numeric' } : {})
  });
  return { text: formatted, badgeClass: 'bg-secondary-subtle text-secondary-emphasis' };
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};
