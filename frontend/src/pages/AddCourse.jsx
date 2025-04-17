import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseContext } from '../context/CourseContext';

const AddCourse = () => {
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { addCourse } = useContext(CourseContext);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!courseName.trim()) {
      errors.courseName = 'Course name is required';
    }
    
    if (!courseCode.trim()) {
      errors.courseCode = 'Course code is required';
    }
    
    if (!instructor.trim()) {
      errors.instructor = 'Instructor name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await addCourse({
      courseName,
      courseCode,
      instructor
    });
    
    setIsSubmitting(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="add-course-container fade-in">
      <div className="page-header">
        <h1>Add New Course</h1>
        <p>Add a new course to track its attendance</p>
      </div>
      
      <div className="form-container scale-in">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="courseName">Course Name <span className="required">*</span></label>
            <input
              type="text"
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className={formErrors.courseName ? 'error' : ''}
            />
            {formErrors.courseName && <div className="error-message">{formErrors.courseName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="courseCode">Course Code <span className="required">*</span></label>
            <input
              type="text"
              id="courseCode"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className={formErrors.courseCode ? 'error' : ''}
            />
            {formErrors.courseCode && <div className="error-message">{formErrors.courseCode}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="instructor">Instructor <span className="required">*</span></label>
            <input
              type="text"
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className={formErrors.instructor ? 'error' : ''}
            />
            {formErrors.instructor && <div className="error-message">{formErrors.instructor}</div>}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary btn-ripple"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding Course...' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourse; 