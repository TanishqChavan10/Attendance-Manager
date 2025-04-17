/**
 * Utility functions for working with localStorage
 */

// Get the date when attendance prompt was last shown
export const getLastPromptDate = () => {
  const lastPrompt = localStorage.getItem('lastAttendancePrompt');
  return lastPrompt ? new Date(lastPrompt) : null;
};

// Set the date when attendance prompt was shown
export const setLastPromptDate = (date = new Date()) => {
  localStorage.setItem('lastAttendancePrompt', date.toISOString());
};

// Check if attendance prompt should be shown today
export const shouldShowPromptToday = () => {
  const lastPrompt = getLastPromptDate();
  
  // If never shown before, return true
  if (!lastPrompt) return true;
  
  // Get today's date at midnight (to compare just the day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get last prompt date at midnight
  const lastPromptDay = new Date(lastPrompt);
  lastPromptDay.setHours(0, 0, 0, 0);
  
  // Return true if the last prompt was before today
  return lastPromptDay < today;
};

// For marking that we've tracked a specific class's attendance for today
export const markClassAttendanceTracked = (classId) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `attendance_tracked_${classId}_${today}`;
  localStorage.setItem(key, 'true');
};

// Check if we've already tracked a class's attendance today
export const hasTrackedClassToday = (classId) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `attendance_tracked_${classId}_${today}`;
  return localStorage.getItem(key) === 'true';
};

// Force the attendance prompt to show on next check
export const forceShowAttendancePrompt = () => {
  localStorage.removeItem('lastAttendancePrompt');
}; 