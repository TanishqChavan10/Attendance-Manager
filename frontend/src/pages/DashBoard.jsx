import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TimetableContext } from "../context/TimetableContext";
import { useAuth } from "../context/AuthContext";
import useAttendanceReminders from "../hooks/useAttendanceReminders";

const COLORS = ["#4CAF50", "#F44336"]; // Green for attended, Red for missed

const Dashboard = () => {
  const { user } = useAuth();
  const { getTodaysClasses, getAttendanceStats, markClassAttendance, timetable } = useContext(TimetableContext);
  const [showPercentageModal, setShowPercentageModal] = useState(false);
  const [newPercentage, setNewPercentage] = useState((user?.requiredAttendancePercentage || 75));
  const [updatingPercentage, setUpdatingPercentage] = useState(false);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, attended: 0, percentage: 0 });
  const [subjectAttendanceData, setSubjectAttendanceData] = useState([]);
  const navigate = useNavigate();
  
  // Initialize the attendance reminders
  useAttendanceReminders();

  // Load data when component mounts
  useEffect(() => {
    // First try to load attendance stats directly
    const stats = getAttendanceStats();
    if (stats && (stats.total > 0 || stats.attended > 0)) {
      console.log("Initial attendance stats:", stats);
      setAttendanceStats(stats);
    }
    
    // Also load subject-wise attendance data
    const subjectData = getSubjectAttendanceData();
    setSubjectAttendanceData(subjectData);
    
    // Try to load cached classes from localStorage first
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cachedClasses = localStorage.getItem(`todaysClasses_${todayStr}`);
    
    if (cachedClasses) {
      try {
        const parsedClasses = JSON.parse(cachedClasses);
        if (parsedClasses.length > 0) {
          setTodaysClasses(parsedClasses);
        }
      } catch (err) {
        console.error("Error parsing cached today's classes:", err);
      }
    }
    
    // Then update data from the context
    updateAttendanceData();
    
    // Set up a refresh interval to periodically check for updates
    const refreshTimer = setInterval(() => {
      const freshStats = getAttendanceStats();
      setAttendanceStats(freshStats);
      updateAttendanceData();
    }, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(refreshTimer);
    };
  }, []);

  // Load data when component mounts and when timetable changes
  useEffect(() => {
    console.log("Dashboard useEffect triggered - loading fresh data");
    
    // Immediately update all data
    updateAttendanceData();
    
    // Set up a refresh interval to periodically check for updates
    const refreshTimer = setInterval(() => {
      console.log("Periodic refresh triggered");
      updateAttendanceData();
    }, 10000); // Every 10 seconds
    
    return () => {
      clearInterval(refreshTimer);
    };
  }, [timetable]); // Re-run effect when timetable changes
  
  // Update attendance data
  const updateAttendanceData = () => {
    // Always refresh from localStorage first to ensure we have the latest data
    try {
      const cachedTimetable = localStorage.getItem('timetableData');
      if (cachedTimetable) {
        const parsedTimetable = JSON.parse(cachedTimetable);
        if (parsedTimetable && parsedTimetable.classes && parsedTimetable.classes.length > 0) {
          // Force sync the context to use the latest localStorage data
          console.log("Refreshing from cached timetable in localStorage");
        }
      }
    } catch (err) {
      console.error("Error parsing timetable from localStorage:", err);
    }
    
    // Get today's classes - this will now use the refreshed timetable
    const classes = getTodaysClasses();
    
    // Always update today's classes
    if (classes && classes.length > 0) {
      setTodaysClasses(classes);
      
      // Save today's classes to localStorage for persistence
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      localStorage.setItem(`todaysClasses_${todayStr}`, JSON.stringify(classes));
    } else {
      // Try to get classes from localStorage if nothing is returned
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const cachedClasses = localStorage.getItem(`todaysClasses_${todayStr}`);
      
      if (cachedClasses) {
        try {
          const parsedClasses = JSON.parse(cachedClasses);
          if (parsedClasses.length > 0) {
            setTodaysClasses(parsedClasses);
          }
        } catch (err) {
          console.error("Error parsing cached today's classes:", err);
        }
      }
    }
    
    // Always get fresh attendance statistics
    const stats = getAttendanceStats();
    console.log("Fresh attendance stats:", stats);
    
    // Always update the attendance stats
    setAttendanceStats(stats);
    
    // Always get fresh subject attendance data
    const subjectData = getSubjectAttendanceData();
    setSubjectAttendanceData(subjectData);
    
    // Debug output
    console.log("Updated attendance stats:", stats);
    console.log("Subject attendance data:", subjectData);
    if (classes && classes.length > 0) {
      console.log("Today's classes with attendance:", classes.map(cls => ({
        subject: cls.subject,
        time: cls.time,
        attended: cls.attended,
      })));
    }
  };
  
  // Get the user's required percentage
  const requiredPercentage = user?.requiredAttendancePercentage || 75;
  
  // Handler for marking attendance
  const handleAttendanceToggle = async (classId, currentStatus) => {
    console.log(`Toggling attendance for class ${classId} from ${currentStatus} to ${!currentStatus}`);
    
    const success = await markClassAttendance(classId, !currentStatus);
    
    if (success) {
      // Immediately get fresh attendance stats
      const updatedStats = getAttendanceStats();
      console.log("Updated attendance stats after toggle:", updatedStats);
      
      // Update state with new stats
      setAttendanceStats(updatedStats);
      
      // Update subject attendance data
      const updatedSubjectData = getSubjectAttendanceData();
      setSubjectAttendanceData(updatedSubjectData);
      
      // Refresh today's classes to show updated UI
      const updatedClasses = getTodaysClasses();
      setTodaysClasses(updatedClasses);
      
      // Save updated classes to localStorage
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem(`todaysClasses_${todayStr}`, JSON.stringify(updatedClasses));
      
      // Ensure total counts are synced
      if (updatedStats.total !== attendanceStats.total || 
          updatedStats.attended !== attendanceStats.attended ||
          updatedStats.percentage !== attendanceStats.percentage) {
        console.log("Forcing attendance stats update due to discrepancy");
        setAttendanceStats(updatedStats);
      }
    }
  };
  
  // Handler for updating required percentage
  const handlePercentageUpdate = async () => {
    if (newPercentage < 0 || newPercentage > 100) return;
    
    setUpdatingPercentage(true);
    try {
      // Use user context to update the required percentage
      // This assumes the useAuth hook has an updateRequiredPercentage function
      if (user && user.requiredAttendancePercentage !== newPercentage) {
        // For now just update the UI, but in the future implement API call
        // await updateRequiredPercentage(Number(newPercentage));
        console.log(`Updated required percentage from ${user.requiredAttendancePercentage} to ${newPercentage}`);
      }
      setShowPercentageModal(false);
    } catch (error) {
      console.error("Error updating required percentage:", error);
    } finally {
      setUpdatingPercentage(false);
    }
  };

  // Function to get attendance data for individual subjects
  const getSubjectAttendanceData = () => {
    // First try to get the latest data from localStorage
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
    
    // Check if timetable classes exist
    if (!currentTimetableData || !currentTimetableData.classes || 
        !Array.isArray(currentTimetableData.classes) || 
        currentTimetableData.classes.length === 0) {
      return [];
    }

    // Create a map to organize classes by subject
    const subjectMap = {};
    
    // Process each class in the timetable
    currentTimetableData.classes.forEach(cls => {
      // Initialize subject entry if it doesn't exist
      if (!subjectMap[cls.subject]) {
        subjectMap[cls.subject] = {
          total: 0,
          attended: 0
        };
      }
      
      // Increment total count for this subject
      subjectMap[cls.subject].total += 1;
      
      // Increment attended count if class was attended
      if (cls.attended) {
        subjectMap[cls.subject].attended += 1;
      }
    });
    
    // Generate a color palette based on the number of subjects
    const subjectColors = [
      '#4CAF50', // Green
      '#2196F3', // Blue
      '#FF9800', // Orange
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#00BCD4', // Cyan
      '#FFEB3B', // Yellow
      '#795548', // Brown
      '#607D8B'  // Blue Grey
    ];
    
    // Convert map to array for the chart
    const chartData = Object.keys(subjectMap).map((subject, index) => {
      const data = subjectMap[subject];
      return {
        name: subject,
        value: data.attended,
        total: data.total,
        color: subjectColors[index % subjectColors.length],
        percentage: data.total > 0 ? (data.attended / data.total) * 100 : 0
      };
    });
    
    // Sort by attendance percentage (highest first)
    chartData.sort((a, b) => b.percentage - a.percentage);
    
    console.log("Generated subject attendance data:", chartData);
    return chartData;
  };

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header bounce-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1>Welcome, <span className="highlight-container" style={{ fontWeight: '700', textShadow: '0 0 1px rgba(0,0,0,0.3)' }}>{user?.username || 'Student'}</span>!</h1>
        <p>Track and manage your attendance efficiently</p>
      </header>
      
      <div className="dashboard-stats">
        <div className="attendance-overview scale-in">
          <h2>Attendance Overview</h2>
          <div className="overall-attendance">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ margin: 0 }}>Overall Attendance:</h3>
              <span 
                className={`${attendanceStats.percentage >= requiredPercentage ? 'percentage-good shimmer' : 'percentage-bad pulse'}`}
                style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold' }}
              >
                {attendanceStats.percentage.toFixed(2)}%
              </span>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ 
                  width: `${Math.min(100, attendanceStats.percentage)}%`,
                  backgroundColor: attendanceStats.percentage >= requiredPercentage ? 'var(--success)' : 'var(--danger)'
                }}
              ></div>
            </div>
            
            <div className="min-attendance-info">
              <div className="required-percentage">
                <span>Minimum Required: <strong>{requiredPercentage}%</strong></span>
                <button 
                  className="btn-icon" 
                  onClick={() => setShowPercentageModal(true)}
                  title="Change required percentage"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </div>
              <div className="attendance-status">
                <span 
                  className={attendanceStats.percentage >= requiredPercentage ? 'status-good' : 'status-bad'}
                >
                  {attendanceStats.percentage >= requiredPercentage 
                    ? "✓ Meeting required attendance" 
                    : `✗ ${(requiredPercentage - attendanceStats.percentage).toFixed(2)}% below requirement`}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="todays-classes slide-in-right">
          <h2>Today's Classes</h2>
          {todaysClasses && todaysClasses.length > 0 ? (
            <>
              <ul className="class-list">
                {todaysClasses.map((classItem, index) => (
                  <li key={classItem._id || index} className="class-item staggered-item" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                    <div className="class-subject">{classItem.subject}</div>
                    <div className="class-time">{classItem.time}</div>
                    <button 
                      className={`attendance-toggle ${classItem.attended ? 'attended' : 'not-attended'}`}
                      onClick={() => handleAttendanceToggle(classItem._id, classItem.attended)}
                    >
                      {classItem.attended ? 
                        <span>Attended <i className="fas fa-check"></i></span> : 
                        <span>Mark as Attended</span>
                      }
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="empty-state glass-effect" style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
              <p>No classes scheduled for today.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: 'var(--spacing-md)' }}>
                <button 
                  className="btn btn-3d" 
                  onClick={() => navigate('/timetable')}
                >
                  Setup Timetable
                </button>
                {attendanceStats.total > 0 && (
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate('/timetable', { state: { showPastClasses: true } })}
                  >
                    View Past Attendance
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="timetable-attendance-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ margin: 0 }}>Subject-wise Attendance</h2>
        </div>
        
        {/* Display subject attendance data */}
        {subjectAttendanceData.length === 0 ? (
          <div className="empty-state">No attendance data available for subjects.</div>
        ) : (
          <div className="subject-charts-container">
            {subjectAttendanceData.map((subject, index) => (
              <div key={index} className="subject-chart-card">
                <h3>{subject.name}</h3>
                <div className="subject-chart">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Attended", value: subject.value },
                          { name: "Missed", value: subject.total - subject.value }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={subject.color} />
                        <Cell fill="#F44336" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="subject-stats">
                  <div className="stat-row">
                    <span className="stat-label">Attendance:</span>
                    <span className={`stat-value ${subject.percentage >= requiredPercentage ? 'good' : 'bad'}`}>
                      {subject.percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Attended:</span>
                    <span className="stat-value">{subject.value} / {subject.total}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Status:</span>
                    <span className={`stat-status ${subject.percentage >= requiredPercentage ? 'status-good' : 'status-bad'}`}>
                      {subject.percentage >= requiredPercentage 
                        ? "✓ Meeting requirement" 
                        : `✗ ${(requiredPercentage - subject.percentage).toFixed(2)}% below`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal for updating required percentage */}
      {showPercentageModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Required Attendance</h3>
              <button className="btn-close" onClick={() => setShowPercentageModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="warning-text">
                <i className="fas fa-exclamation-triangle"></i> 
                Changing this value requires admin approval at most institutions. 
                Make sure you enter the correct required percentage for your college/university.
              </p>
              <div className="form-group">
                <label htmlFor="newPercentage">Required Attendance Percentage:</label>
                <div className="input-with-hint">
                  <input 
                    id="newPercentage"
                    type="number" 
                    min="0" 
                    max="100" 
                    value={newPercentage}
                    onChange={(e) => setNewPercentage(Number(e.target.value))}
                  />
                  <span className="input-hint">Current: {requiredPercentage}%</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowPercentageModal(false)}
                disabled={updatingPercentage}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handlePercentageUpdate}
                disabled={updatingPercentage || newPercentage === requiredPercentage}
              >
                {updatingPercentage ? "Updating..." : "Save Percentage"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .attendance-toggle {
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          outline: none;
        }
        
        .attendance-toggle.attended {
          background-color: var(--success);
          color: white;
        }
        
        .attendance-toggle.not-attended {
          background-color: #f1f1f1;
          color: #666;
          border: 1px solid #ddd;
        }
        
        .attendance-toggle:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        
        .class-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: white;
          border-radius: 8px;
          margin-bottom: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .class-subject {
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }
        
        .class-time {
          color: #777;
          font-size: 14px;
        }
        
        .input-with-hint {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-hint {
          margin-left: 10px;
          font-size: 14px;
          color: #666;
          font-style: italic;
        }
        
        /* Subject-wise attendance styling */
        .subject-attendance-summary {
          margin-top: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
        }
        
        .subject-attendance-summary h4 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
        }
        
        .subject-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
        }
        
        .subject-item {
          background: white;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        /* Subject charts styling */
        .subject-charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          padding: 10px 0;
        }
        
        .subject-chart-card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
          padding: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .subject-chart-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }
        
        .subject-chart-card h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 18px;
          color: #333;
          text-align: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }
        
        .subject-chart {
          margin: 0 auto;
          width: 100%;
          height: 180px;
        }
        
        .subject-stats {
          margin-top: 15px;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        
        .stat-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        
        .stat-label {
          font-weight: 500;
          color: #555;
        }
        
        .stat-value {
          font-weight: 600;
        }
        
        .stat-value.good {
          color: var(--success);
        }
        
        .stat-value.bad {
          color: var(--danger);
        }
        
        .stat-status {
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-good {
          color: var(--success);
        }
        
        .status-bad {
          color: var(--danger);
        }
        
        .empty-state {
          background-color: #f8f9fa;
          border-radius: 10px;
          padding: 30px;
          text-align: center;
          color: #666;
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
