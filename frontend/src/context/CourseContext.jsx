import { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { fetchCourses, createCourse, markAttendance } from "../api/courses";

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadCourses();
    } else {
      setCourses([]);
    }
  }, [isAuthenticated]);

  // Load courses from backend
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchCourses();
      setCourses(data || []);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new course
  const addCourse = async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newCourse = await createCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
      return true;
    } catch (err) {
      console.error("Error adding course:", err);
      setError("Failed to add course. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Record attendance for a course
  const recordAttendance = async (courseId, attended) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCourse = await markAttendance(courseId, attended);
      
      setCourses(prev => 
        prev.map(course => {
          if (course._id === courseId) {
            return updatedCourse;
          }
          return course;
        })
      );
      
      return true;
    } catch (err) {
      console.error("Error recording attendance:", err);
      setError("Failed to record attendance. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall attendance percentage
  const getOverallAttendance = () => {
    if (!courses.length) return 0;
    
    const totalAttended = courses.reduce((sum, course) => sum + course.attendedClasses, 0);
    const totalClasses = courses.reduce((sum, course) => sum + course.totalClasses, 0);
    
    if (totalClasses === 0) return 0;
    return (totalAttended / totalClasses) * 100;
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        loadCourses,
        addCourse,
        recordAttendance,
        getOverallAttendance
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
