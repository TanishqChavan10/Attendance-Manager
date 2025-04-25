import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const { register, error } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requiredPercentage, setRequiredPercentage] = useState(75);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      //clear context error
      register({clear: true});
      return;
    }
    
    if (requiredPercentage < 0 || requiredPercentage > 100) {
      setLocalError('Required percentage must be between 0 and 100');
       //clear context error
       register({clear: true});
      return;
    }

    setLoading(true);
    try {
      const res = await register({ 
        username, 
        password,
        requiredAttendancePercentage: Number(requiredPercentage)
      });

      if(res.error){
        register({error: res.error});
      }else{
        register({clear: true});
      }
      
      navigate('/login');
    } catch (err) {
      // Error is handled by the auth context
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="info-text">Enter your details to get started</p>
        
        {localError && <div className="error-message">{localError}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="requiredPercentage">
              Required Attendance Percentage
              <span className="tip">Set the minimum attendance required by your college/university</span>
            </label>
            <input
              id="requiredPercentage"
              type="number"
              min="0"
              max="100"
              value={requiredPercentage}
              onChange={(e) => setRequiredPercentage(Number(e.target.value))}
              required
            />
          </div>
          
          <div className="form-note">
            <p>Note: The required attendance percentage cannot be easily changed after registration.</p>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>{loading? "Loading...": "Sign Up"}</button>
        </form>
        
        <div className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup; 