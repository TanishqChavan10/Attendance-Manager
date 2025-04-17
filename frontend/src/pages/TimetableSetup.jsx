import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TimetableContext } from "../context/TimetableContext";

const TimetableSetup = () => {
  const { timetable, loading, error, saveEntireTimetable, loadTimetable } = useContext(TimetableContext);
  const [classes, setClasses] = useState([]);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  // Load existing timetable when component mounts
  useEffect(() => {
    loadTimetable();
  }, []);

  // Update local state when timetable from context changes
  useEffect(() => {
    if (timetable && timetable.classes) {
      setClasses([...timetable.classes]);
    }
  }, [timetable]);

  const addClass = () => {
    setClasses([...classes, { day: "", subject: "", time: "" }]);
  };

  const handleChange = (index, field, value) => {
    const newClasses = [...classes];
    newClasses[index][field] = value;
    setClasses(newClasses);
  };

  const removeEntry = (index) => {
    const newClasses = [...classes];
    newClasses.splice(index, 1);
    setClasses(newClasses);
  };

  const validateEntry = (entry) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    if (!days.includes(entry.day)) {
      return false;
    }
    
    if (!entry.subject || entry.subject.trim() === "") {
      return false;
    }
    
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    if (!timeRegex.test(entry.time)) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (classes.length === 0) {
      setFormError("Please add at least one class to your timetable");
      return;
    }

    // Validate each entry
    for (const entry of classes) {
      if (!validateEntry(entry)) {
        setFormError("Please fill all fields correctly. Day must be a valid day, time must be in format 'HH:MM AM/PM'");
        return;
      }
    }

    setFormError("");
    const success = await saveEntireTimetable(classes);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="timetable-setup-container">
      <h2>Setup Your Timetable</h2>
      
      <div className="card">
        <p className="info-text">Add your weekly schedule below. This will help track your attendance for each class.</p>
        
        {formError && <div className="error-message">{formError}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <div className="timetable-entries">
          {classes.length === 0 && (
            <div className="empty-timetable">
              <p>No classes added yet. Click the button below to add your first class.</p>
            </div>
          )}
          
          {classes.map((entry, index) => (
            <div key={index} className="timetable-entry">
              <div className="form-group">
                <label htmlFor={`day-${index}`}>Day:</label>
                <select
                  id={`day-${index}`}
                  value={entry.day}
                  onChange={(e) => handleChange(index, "day", e.target.value)}
                >
                  <option value="">Select a day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor={`subject-${index}`}>Subject:</label>
                <input
                  id={`subject-${index}`}
                  type="text"
                  placeholder="Subject Name"
                  value={entry.subject}
                  onChange={(e) => handleChange(index, "subject", e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor={`time-${index}`}>Time:</label>
                <input
                  id={`time-${index}`}
                  type="text"
                  placeholder="e.g. 9:00 AM"
                  value={entry.time}
                  onChange={(e) => handleChange(index, "time", e.target.value)}
                />
              </div>
              
              <button 
                className="btn-remove" 
                onClick={() => removeEntry(index)}
                title="Remove this class"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="button-container">
          <button className="btn-add" onClick={addClass}>
            Add Class
          </button>
          <button 
            className="btn-save" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Timetable"}
          </button>
        </div>
      </div>
      
      {classes.length > 0 && (
        <div className="card timetable-preview">
          <h3>Timetable Preview</h3>
          <div className="preview-container">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
              <div key={day} className="day-column">
                <h4>{day}</h4>
                <div className="classes-list">
                  {classes.filter(c => c.day === day)
                    .sort((a, b) => {
                      const timeA = a.time.split(' ');
                      const timeB = b.time.split(' ');
                      return timeA[0].localeCompare(timeB[0]);
                    })
                    .map((c, idx) => (
                      <div key={idx} className="class-item">
                        <div className="subject">{c.subject}</div>
                        <div className="time">{c.time}</div>
                      </div>
                    ))
                  }
                  {classes.filter(c => c.day === day).length === 0 && (
                    <p className="no-classes">No classes</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableSetup;
