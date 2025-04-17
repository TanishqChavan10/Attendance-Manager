import { useEffect, useContext } from 'react';
import { TimetableContext } from '../context/TimetableContext';
import { showAttendancePrompt } from '../components/AttendancePrompt';
import { hasTrackedClassToday } from '../utils/localStorage';

/**
 * Custom hook to set up attendance reminders
 * This will check for classes throughout the day and trigger attendance prompts
 */
const useAttendanceReminders = () => {
  const { getTodaysClasses } = useContext(TimetableContext);

  useEffect(() => {
    // Helper function to extract hours and minutes from a time string
    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      
      try {
        // Parse time like "09:00 AM"
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        return { hours, minutes };
      } catch (error) {
        console.error("Error parsing time:", error);
        return null;
      }
    };

    // Calculate milliseconds until a specific time today
    const getMillisecondsUntil = (hours, minutes) => {
      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      
      // If the time is already past today, return null
      if (target <= now) return null;
      
      return target - now;
    };

    // Schedule a reminder for a specific class
    const scheduleClassReminder = (classItem) => {
      const timeInfo = parseTime(classItem.time);
      if (!timeInfo) return null;
      
      // Check if the class is already tracked today
      if (hasTrackedClassToday(classItem._id)) return null;
      
      // Calculate milliseconds until class
      const msUntil = getMillisecondsUntil(timeInfo.hours, timeInfo.minutes);
      if (!msUntil) return null; // Class time already passed
      
      // Schedule a reminder for a few minutes after the class starts
      const reminderDelay = msUntil + (15 * 60 * 1000); // 15 minutes after class starts
      
      const timerId = setTimeout(() => {
        showAttendancePrompt();
      }, reminderDelay);
      
      return timerId;
    };

    // Schedule reminders for today's classes
    const scheduleReminders = () => {
      const todaysClasses = getTodaysClasses();
      
      if (!todaysClasses || todaysClasses.length === 0) return [];
      
      // Schedule reminders for each class and keep track of the timer IDs
      const timerIds = todaysClasses
        .map(scheduleClassReminder)
        .filter(Boolean); // Remove null values
      
      return timerIds;
    };

    // Schedule all reminders when component mounts
    const timerIds = scheduleReminders();
    
    // Clean up all timers when component unmounts
    return () => {
      timerIds.forEach(id => clearTimeout(id));
    };
  }, [getTodaysClasses]);

  // No need to return anything, this hook just sets up side effects
  return null;
};

export default useAttendanceReminders; 