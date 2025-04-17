import React from 'react';

const Dashboard = () => {
  // Sample data, replace with actual data from API
  const attendanceSummary = {
    totalClasses: 50,
    attendedClasses: 45,
    percentage: 90,
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="attendance-summary">
        <p>Total Classes: {attendanceSummary.totalClasses}</p>
        <p>Attended Classes: {attendanceSummary.attendedClasses}</p>
        <p>Attendance Percentage: {attendanceSummary.percentage}%</p>
      </div>
      {/* Add more dashboard features here */}
    </div>
  );
};

export default Dashboard; 