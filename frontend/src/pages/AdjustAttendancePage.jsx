//New page added by AI
import React, { useState } from 'react';
import { adjustAttendance } from '../api/courses';

function AdjustAttendancePage() {
  const [courseId, setCourseId] = useState('');
  const [attendedClasses, setAttendedClasses] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [message, setMessage] = useState('');

  const handleCourseIdChange = (event) => {
    setCourseId(event.target.value);
  };

  const handleAttendedClassesChange = (event) => {
    setAttendedClasses(parseInt(event.target.value, 10));
  };

  const handleTotalClassesChange = (event) => {
    setTotalClasses(parseInt(event.target.value, 10));
  };

  const handleSubmit = async () => {
    try {
      const data = { attendedClasses, totalClasses };
      await adjustAttendance(courseId, data);
      setMessage('Attendance adjusted successfully!');
    } catch (error) {
      setMessage('Error adjusting attendance.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>Adjust Attendance</h1>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="courseId" style={{ display: 'block', marginBottom: '5px' }}>Course ID:</label>
        <input
          type="text"
          id="courseId"
          value={courseId}
          onChange={handleCourseIdChange}
          style={{ width: '300px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="attendedClasses" style={{ display: 'block', marginBottom: '5px' }}>Attended Classes:</label>
        <input
          type="number"
          id="attendedClasses"
          value={attendedClasses}
          onChange={handleAttendedClassesChange}
          style={{ width: '300px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="totalClasses" style={{ display: 'block', marginBottom: '5px' }}>Total Classes:</label>
        <input
          type="number"
          id="totalClasses"
          value={totalClasses}
          onChange={handleTotalClassesChange}
          style={{ width: '300px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      <button
        onClick={handleSubmit}
        style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Submit
      </button>
      <div style={{ marginTop: '20px', color: message.includes('Error') ? 'red' : 'green' }}>{message}</div>
    </div>
  );
}

export default AdjustAttendancePage;