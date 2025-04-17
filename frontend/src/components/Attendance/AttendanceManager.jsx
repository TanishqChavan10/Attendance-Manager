import React, { useState } from 'react';

const AttendanceManager = () => {
  const [attendance, setAttendance] = useState({
    totalClasses: 50,
    attendedClasses: 45,
  });

  const markAttendance = (attended) => {
    setAttendance((prev) => ({
      ...prev,
      attendedClasses: attended ? prev.attendedClasses + 1 : prev.attendedClasses,
      totalClasses: prev.totalClasses + 1,
    }));
  };

  return (
    <div className="attendance-manager-container">
      <h2>Attendance Manager</h2>
      <div className="attendance-actions">
        <button onClick={() => markAttendance(true)}>Mark Attended</button>
        <button onClick={() => markAttendance(false)}>Mark Bunked</button>
      </div>
      <div className="attendance-summary">
        <p>Total Classes: {attendance.totalClasses}</p>
        <p>Attended Classes: {attendance.attendedClasses}</p>
        <p>Attendance Percentage: {((attendance.attendedClasses / attendance.totalClasses) * 100).toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default AttendanceManager; 