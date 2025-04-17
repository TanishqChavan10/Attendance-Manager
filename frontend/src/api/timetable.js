import axiosClient from "./axiosClient";

// Get user's timetable
export const getTimetable = async () => {
  try {
    const res = await axiosClient.get("/timetable");
    
    // Store the fetched timetable in localStorage for offline access
    if (res.data) {
      localStorage.setItem('timetableData', JSON.stringify(res.data));
    }
    
    return res.data;
  } catch (error) {
    console.error("Error fetching timetable:", error);
    
    // Try to get the timetable from localStorage if API fails
    const cachedTimetable = localStorage.getItem('timetableData');
    if (cachedTimetable) {
      console.log("Using cached timetable data from localStorage");
      return JSON.parse(cachedTimetable);
    }
    
    throw error;
  }
};

// Create or update the full timetable
export const saveTimetable = async (classes) => {
  try {
    const res = await axiosClient.post("/timetable", { classes: Array.isArray(classes) ? classes : [] });
    return res.data;
  } catch (error) {
    console.error("Error saving timetable:", error);
    throw error;
  }
};

// Add a single class to the timetable
export const addClass = async (classData) => {
  try {
    const res = await axiosClient.post("/timetable/class", classData);
    return res.data;
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

// Update a specific class in the timetable
export const updateClass = async (classId, classData) => {
  try {
    const res = await axiosClient.put(`/timetable/class/${classId}`, classData);
    return res.data;
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
};

// Remove a class from the timetable
export const removeClass = async (classId) => {
  try {
    const res = await axiosClient.delete(`/timetable/class/${classId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing class:", error);
    throw error;
  }
};

// Utility function to organize timetable by days
export const organizeTimetableByDay = (timetable) => {
  if (!timetable || !timetable.classes || !Array.isArray(timetable.classes)) return {};

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const organized = {};

  days.forEach(day => {
    organized[day] = timetable.classes.filter(c => c.day === day)
      .sort((a, b) => {
        // Convert time strings to comparable values (e.g., "9:00 AM" to minutes since midnight)
        const timeA = convertTimeToMinutes(a.time);
        const timeB = convertTimeToMinutes(b.time);
        return timeA - timeB;
      });
  });

  return organized;
};

// Helper function to convert time strings to minutes for sorting
const convertTimeToMinutes = (timeStr) => {
  try {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    
    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  } catch (error) {
    console.error("Error parsing time:", timeStr, error);
    return 0;
  }
};
