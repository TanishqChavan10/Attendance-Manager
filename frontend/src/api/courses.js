import axiosClient from "./axiosClient";

// Fetch all courses for the current user
export const fetchCourses = async () => {
  try {
    const res = await axiosClient.get("/courses");
    return res.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

// Get a specific course by ID
export const fetchCourse = async (courseId) => {
  const res = await axiosClient.get(`/courses/${courseId}`);
  return res.data;
};

// Create a new course
export const createCourse = async (courseData) => {
  try {
    const res = await axiosClient.post("/courses", courseData);
    return res.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

// Update an existing course
export const updateCourse = async (courseId, courseData) => {
  try {
    const res = await axiosClient.put(`/courses/${courseId}`, courseData);
    return res.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (courseId) => {
  try {
    const res = await axiosClient.delete(`/courses/${courseId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// Mark attendance for a course
export const markAttendance = async (courseId, attended, date) => {
  try {
    const res = await axiosClient.post(`/courses/${courseId}/attendance`, {
      attended,
      date: date || new Date().toISOString().split('T')[0] // YYYY-MM-DD
    });
    return res.data;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

// New function added by AI
// Adjust attendance for a course
export const adjustAttendance = async (courseId, data) => {
  try {
    const res = await axiosClient.patch(
      `/courses/${courseId}/adjust-attendance`,
      data
    );
    return res.data;
  } catch (error) {
    console.error("Error adjusting attendance:", error);
    throw error;
  }
};
// Calculate attendance recovery
export const calculateRecovery = (course, targetPercentage = 75) => {
  if (!course) return { possible: false, classesNeeded: 0 };

  const { attendedClasses, totalClasses } = course;
  const currentPercentage = totalClasses === 0 ? 0 : (attendedClasses / totalClasses) * 100;

  // If we've already met the target, no recovery needed
  if (currentPercentage >= targetPercentage) {
    return { possible: true, classesNeeded: 0, currentPercentage };
  }

  // Calculate how many consecutive classes need to be attended to reach target percentage
  // Using the formula: (attended + x) / (total + x) >= target/100
  // Solving for x: x >= (target*total - 100*attended) / (100 - target)
  const numerator = (targetPercentage * totalClasses) - (100 * attendedClasses);
  const denominator = (100 - targetPercentage);
  
  // If denominator is zero or negative, recovery is not possible
  if (denominator <= 0) {
    return { possible: false, classesNeeded: Infinity, currentPercentage };
  }
  
  const classesNeeded = Math.ceil(numerator / denominator);
  
  return {
    possible: true,
    classesNeeded: Math.max(0, classesNeeded),
    currentPercentage
  };
};

// Calculate bunkable classes
export const calculateBunkable = (course, targetPercentage = 75) => {
  if (!course) return { possible: false, classesCanBunk: 0 };

  const { attendedClasses, totalClasses } = course;
  const currentPercentage = totalClasses === 0 ? 0 : (attendedClasses / totalClasses) * 100;

  // If we're already below the target, can't bunk any classes
  if (currentPercentage < targetPercentage) {
    return { possible: false, classesCanBunk: 0, currentPercentage };
  }

  // Calculate how many consecutive classes can be bunked while staying above target percentage
  // Using the formula: (attended) / (total + x) >= target/100
  // Solving for x: x <= (100*attended - target*total) / target
  const numerator = (100 * attendedClasses) - (targetPercentage * totalClasses);
  const denominator = targetPercentage;
  
  // If denominator is zero, can't calculate
  if (denominator <= 0) {
    return { possible: false, classesCanBunk: 0, currentPercentage };
  }
  
  const classesCanBunk = Math.floor(numerator / denominator);
  
  return {
    possible: true,
    classesCanBunk: Math.max(0, classesCanBunk),
    currentPercentage
  };
};
