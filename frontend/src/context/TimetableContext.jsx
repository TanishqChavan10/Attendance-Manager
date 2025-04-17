import { createContext, useState, useEffect } from "react";
import {
  getTimetable,
  saveTimetable,
  addClass,
  updateClass,
  removeClass,
  organizeTimetableByDay
} from "../api/timetable";
import { useAuth } from "./AuthContext";

export const TimetableContext = createContext();

export const TimetableProvider = ({ children }) => {
  const [timetable, setTimetable] = useState(() => {
    // Initialize from localStorage if available
    const savedTimetable = localStorage.getItem('timetableData');
    return savedTimetable ? JSON.parse(savedTimetable) : { classes: [] };
  });
  const [organizedTimetable, setOrganizedTimetable] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadTimetable();
    } else {
      // Even when not authenticated, we keep the local data to prevent flashing
      const savedTimetable = localStorage.getItem('timetableData');
      if (savedTimetable) {
        setTimetable(JSON.parse(savedTimetable));
      } else {
        setTimetable({ classes: [] });
      }
      setOrganizedTimetable({});
    }
  }, [isAuthenticated]);

  // Organize timetable by day whenever it changes
  useEffect(() => {
    setOrganizedTimetable(organizeTimetableByDay(timetable));
    
    // Save to localStorage whenever timetable changes
    if (timetable && timetable.classes) {
      localStorage.setItem('timetableData', JSON.stringify(timetable));
    }
  }, [timetable]);

  // Load the user's timetable
  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userTimetable = await getTimetable();
      // If timetable is returned from server, use it and update localStorage
      if (userTimetable) {
        setTimetable(userTimetable);
        localStorage.setItem('timetableData', JSON.stringify(userTimetable));
      } else {
        // If no timetable is returned from server, try to use localStorage data
        const savedTimetable = localStorage.getItem('timetableData');
        if (savedTimetable) {
          setTimetable(JSON.parse(savedTimetable));
        } else {
          // If nothing in localStorage either, initialize empty
          setTimetable({ classes: [] });
        }
      }
    } catch (err) {
      console.error("Error loading timetable:", err);
      setError("Failed to load timetable. Using locally stored data if available.");
      
      // On error, fall back to localStorage data
      const savedTimetable = localStorage.getItem('timetableData');
      if (savedTimetable) {
        setTimetable(JSON.parse(savedTimetable));
      } else {
        setTimetable({ classes: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  // Save the entire timetable
  const saveEntireTimetable = async (classes) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure classes is an array
      const classesArray = Array.isArray(classes) ? classes : [];
      console.log("Saving timetable with classes:", classesArray);
      
      const updatedTimetable = await saveTimetable(classesArray);
      setTimetable(updatedTimetable);
      return true;
    } catch (err) {
      console.error("Error saving timetable:", err);
      setError("Failed to save timetable. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add a class to the timetable
  const addClassToTimetable = async (classData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTimetable = await addClass(classData);
      setTimetable(updatedTimetable);
      return true;
    } catch (err) {
      console.error("Error adding class to timetable:", err);
      setError("Failed to add class to timetable. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update a class in the timetable
  const updateClassInTimetable = async (classId, classData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTimetable = await updateClass(classId, classData);
      setTimetable(updatedTimetable);
      return true;
    } catch (err) {
      console.error("Error updating class in timetable:", err);
      setError("Failed to update class in timetable. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove a class from the timetable
  const removeClassFromTimetable = async (classId) => {
    try {
      setLoading(true);
      setError(null);
      await removeClass(classId);
      setTimetable(prev => ({
        ...prev,
        classes: prev.classes.filter(c => c._id !== classId)
      }));
      return true;
    } catch (err) {
      console.error("Error removing class from timetable:", err);
      setError("Failed to remove class from timetable. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get classes for a specific day
  const getClassesForDay = (day) => {
    return organizedTimetable[day] || [];
  };

  // Get today's classes
  const getTodaysClasses = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    
    // Check if we have cached today's classes in localStorage
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cachedClassesKey = `todaysClasses_${todayStr}`;
    const cachedClasses = localStorage.getItem(cachedClassesKey);
    
    if (cachedClasses) {
      try {
        return JSON.parse(cachedClasses);
      } catch (err) {
        console.error("Error parsing cached classes:", err);
        // Continue to get fresh classes if parsing fails
      }
    }
    
    // Get fresh classes for today
    const todaysClasses = getClassesForDay(today);
    
    // Cache today's classes in localStorage
    if (todaysClasses && todaysClasses.length > 0) {
      localStorage.setItem(cachedClassesKey, JSON.stringify(todaysClasses));
    }
    
    return todaysClasses;
  };

  // Get attendance stats
  const getAttendanceStats = () => {
    if (!timetable || !timetable.classes || !Array.isArray(timetable.classes)) {
      return { total: 0, attended: 0, percentage: 0, requiredPercentage: 75 };
    }
    
    // Force refresh from localStorage in case there are updates
    let currentTimetableData;
    try {
      const storedData = localStorage.getItem('timetableData');
      if (storedData) {
        currentTimetableData = JSON.parse(storedData);
      } else {
        currentTimetableData = timetable;
      }
    } catch (err) {
      console.error("Error parsing timetable data from localStorage:", err);
      currentTimetableData = timetable;
    }
    
    // Get the total number of classes
    const total = currentTimetableData.classes.length;
    
    // Count classes that have been attended
    // A class is considered attended if it has the 'attended' property set to true
    const attended = currentTimetableData.classes.filter(cls => cls.attended === true).length;
    
    // Calculate the attendance percentage
    const percentage = total > 0 ? (attended / total) * 100 : 0;
    
    // Get the required percentage (default to 75% if not set)
    const requiredPercentage = user?.requiredAttendancePercentage || 75;
    
    // For debugging
    console.log("Attendance calculation (refreshed):", { total, attended, percentage, requiredPercentage });
    
    return {
      total,
      attended,
      percentage,
      requiredPercentage
    };
  };

  // Mark attendance for a class
  const markAttendance = async (classId, date, status) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!timetable || !timetable.classes) {
        throw new Error("No timetable data available");
      }
      
      // Create an updated timetable with the attendance marked
      const updatedTimetable = {
        ...timetable,
        classes: timetable.classes.map(c => {
          if (c._id === classId) {
            // Create or update the attendance record
            const updatedAttendance = { ...(c.attendance || {}) };
            updatedAttendance[date] = status;
            
            return {
              ...c,
              attendance: updatedAttendance
            };
          }
          return c;
        })
      };
      
      // Save to localStorage immediately
      localStorage.setItem('timetableData', JSON.stringify(updatedTimetable));
      
      // Update state
      setTimetable(updatedTimetable);
      
      // Log attendance info - we're bypassing actual API call
      console.log(`Marked attendance for class ${classId} on ${date} as ${status}`);
    } catch (err) {
      console.error("Error marking attendance:", err);
      setError("Attendance marked locally but failed to sync with server.");
    } finally {
      setLoading(false);
    }
  };

  // Mark class attendance
  const markClassAttendance = async (classId, attended) => {
    try {
      setLoading(true);
      
      // Update the local timetable state
      const updatedTimetable = {
        ...timetable,
        classes: timetable.classes.map(c => 
          c._id === classId ? { ...c, attended: attended } : c
        )
      };
      
      // Save the updated timetable to localStorage
      localStorage.setItem('timetableData', JSON.stringify(updatedTimetable));
      
      // Update the state with the new timetable
      setTimetable(updatedTimetable);
      
      // Update the cached today's classes in localStorage
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const cachedClassesKey = `todaysClasses_${todayStr}`;
      const cachedClassesJSON = localStorage.getItem(cachedClassesKey);
      
      if (cachedClassesJSON) {
        try {
          const cachedClasses = JSON.parse(cachedClassesJSON);
          const updatedCachedClasses = cachedClasses.map(c => 
            c._id === classId ? { ...c, attended: attended } : c
          );
          localStorage.setItem(cachedClassesKey, JSON.stringify(updatedCachedClasses));
        } catch (err) {
          console.error("Error updating cached classes:", err);
        }
      }
      
      // Log the updated attendance status
      console.log(`Marked class ${classId} attendance as ${attended ? 'attended' : 'not attended'}`);
      
      // Update via API
      await updateClass(classId, { attended });
      
      return true;
    } catch (error) {
      console.error("Error marking attendance:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Force a sync with the backend to ensure local state matches server state
  const forceSync = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("TimetableContext: Force syncing timetable with backend...");
      
      // First, get the latest timetable from the server
      const serverTimetable = await getTimetable();
      console.log("TimetableContext: Latest timetable from server:", serverTimetable);
      
      // Update local state
      setTimetable(serverTimetable || { classes: [] });
      
      return true;
    } catch (err) {
      console.error("TimetableContext: Error during force sync:", err);
      setError("Failed to sync timetable. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TimetableContext.Provider
      value={{
        timetable,
        organizedTimetable,
        loading,
        error,
        loadTimetable,
        saveEntireTimetable,
        addClassToTimetable,
        updateClassInTimetable,
        removeClassFromTimetable,
        getClassesForDay,
        getTodaysClasses,
        getAttendanceStats,
        markAttendance,
        markClassAttendance,
        forceSync
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
}; 