import { useState, useEffect, useContext } from 'react';
import { TimetableContext } from '../context/TimetableContext';
import { CourseContext } from '../context/CourseContext';
import { 
  getLastPromptDate, 
  setLastPromptDate, 
  shouldShowPromptToday, 
  markClassAttendanceTracked,
  hasTrackedClassToday,
  forceShowAttendancePrompt
} from '../utils/localStorage';

const AttendancePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [attendanceResponses, setAttendanceResponses] = useState({});
  const [untrackedClassesOnly, setUntrackedClassesOnly] = useState(true);

  const { getTodaysClasses, markClassAttendance } = useContext(TimetableContext);
  const { recordAttendance } = useContext(CourseContext);

  // Function to determine if a class time has passed
  const hasClassTimePassed = (timeStr) => {
    if (!timeStr) return false;
    
    try {
      // Parse time like "09:00 AM"
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const classTime = new Date();
      classTime.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      
      return now >= classTime;
    } catch (error) {
      console.error("Error parsing time:", error);
      return false;
    }
  };

  // Check if we should show the prompt - run this periodically
  const checkPromptConditions = () => {
    // Get today's classes
    const classes = getTodaysClasses();
    
    if (!classes || classes.length === 0) {
      return false;
    }
    
    // Filter for classes that:
    // 1. Have already started/passed (if time-based checking is enabled)
    // 2. Haven't been tracked today (if untrackedClassesOnly is true)
    const relevantClasses = classes.filter(cls => {
      const timeHasPassed = hasClassTimePassed(cls.time);
      const notTrackedYet = !hasTrackedClassToday(cls._id);
      
      return timeHasPassed && (untrackedClassesOnly ? notTrackedYet : true);
    });
    
    // If there are relevant classes and we either haven't shown the prompt today
    // or we're forcing a check, then show the prompt
    if (relevantClasses.length > 0 && (shouldShowPromptToday() || !untrackedClassesOnly)) {
      setTodaysClasses(relevantClasses);
      
      // Initialize attendance responses
      const initialResponses = {};
      relevantClasses.forEach(cls => {
        initialResponses[cls._id] = null; // null = not answered yet
      });
      setAttendanceResponses(initialResponses);
      
      return true;
    }
    
    return false;
  };

  // Periodically check for classes throughout the day
  useEffect(() => {
    // Initial check with a small delay to ensure context data is loaded
    const initialTimer = setTimeout(() => {
      const shouldShow = checkPromptConditions();
      setShowPrompt(shouldShow);
    }, 1500);
    
    // Then check every 30 minutes for new classes that have started
    const intervalTimer = setInterval(() => {
      const shouldShow = checkPromptConditions();
      if (shouldShow) {
        setShowPrompt(true);
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [getTodaysClasses]);

  // Handle response change
  const handleResponseChange = (classId, attended) => {
    setAttendanceResponses(prev => ({
      ...prev,
      [classId]: attended
    }));
  };

  // Handle submit
  const handleSubmit = async () => {
    // Record attendance for all answered classes
    const promises = Object.entries(attendanceResponses)
      .filter(([_, attended]) => attended !== null) // Only process answered ones
      .map(async ([classId, attended]) => {
        try {
          // Use markClassAttendance which will update both the local state and API
          const success = await markClassAttendance(classId, attended);
          
          if (success) {
            // Mark this class as tracked for today
            markClassAttendanceTracked(classId);
          }
          
          return success;
        } catch (error) {
          console.error("Error marking attendance:", error);
          return false;
        }
      });
    
    await Promise.all(promises);
    
    // Save that we showed the prompt today (if using daily prompt)
    if (untrackedClassesOnly) {
      setLastPromptDate();
    }
    
    // Close the prompt
    setShowPrompt(false);
  };

  // Handle dismiss
  const handleDismiss = () => {
    // Just mark that we showed it today
    if (untrackedClassesOnly) {
      setLastPromptDate();
    }
    setShowPrompt(false);
  };

  // Force show the prompt (could be triggered by a button elsewhere)
  const forceShowPrompt = () => {
    setUntrackedClassesOnly(false);
    const shouldShow = checkPromptConditions();
    setShowPrompt(shouldShow);
  };

  // If not showing, return null
  if (!showPrompt) {
    return null;
  }

  return (
    <div className="attendance-prompt-overlay">
      <div className="attendance-prompt-card">
        <div className="attendance-prompt-header">
          <h2>Mark Today's Attendance</h2>
          <p>Did you attend these classes today?</p>
        </div>
        
        <div className="attendance-prompt-body">
          {todaysClasses.length === 0 ? (
            <p className="no-classes-message">You have no classes scheduled for today.</p>
          ) : (
            todaysClasses.map(cls => (
              <div key={cls._id} className="class-attendance-item">
                <div className="class-info">
                  <h3>{cls.subject}</h3>
                  <p>{cls.time}</p>
                </div>
                <div className="attendance-options">
                  <button
                    className={`btn ${attendanceResponses[cls._id] === true ? 'btn-success active' : 'btn-outline'}`}
                    onClick={() => handleResponseChange(cls._id, true)}
                  >
                    Attended
                  </button>
                  <button
                    className={`btn ${attendanceResponses[cls._id] === false ? 'btn-danger active' : 'btn-outline'}`}
                    onClick={() => handleResponseChange(cls._id, false)}
                  >
                    Missed
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="attendance-prompt-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={Object.values(attendanceResponses).some(v => v === null) || todaysClasses.length === 0}
          >
            Save Attendance
          </button>
          <button className="btn btn-outline" onClick={handleDismiss}>Remind Me Later</button>
        </div>
      </div>
    </div>
  );
};

// Export the component
export default AttendancePrompt;

// Also export the function to force show the prompt
export const showAttendancePrompt = () => {
  forceShowAttendancePrompt();
}; 