import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../components/styles/auth-new.css";

const Register = () => {
  const [form, setForm] = useState({ 
    username: "", 
    email: "",
    password: "", 
    confirmPassword: "" 
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register, error, loading } = useAuth();

  useEffect(() => {
    // Add the active class after component mounts for animation
    const timer = setTimeout(() => setIsActive(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check password strength
    const strength = calculatePasswordStrength(form.password);
    setPasswordStrength(strength);
    
    // Check if passwords match
    setPasswordMatch(form.password === form.confirmPassword || form.confirmPassword === "");
  }, [form.password, form.confirmPassword]);

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Number check
    if (/[0-9]/.test(password)) strength += 25;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "#FF5252";
    if (passwordStrength <= 50) return "#FFC107";
    if (passwordStrength <= 75) return "#4CAF50";
    return "#2196F3";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (form.password !== form.confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    
    try {
      // Only send username and password to the register function
      const { username, password } = form;
      await register({ username, password });
      navigate("/login");
    } catch (err) {
      // Error is handled by the auth context
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="auth-page">
      <div className={`register-container ${isActive ? 'active' : ''}`}>
        <div className="auth-card">
          <div className="auth-card-inner">
            <div className="auth-card-front">
              <div className="auth-header">
                <div className="logo-container">
                  <div className="logo signup-logo">
                    <span className="logo-icon">🚀</span>
                  </div>
                </div>
                <h1>Create Account</h1>
                <p>Join us and start tracking your attendance</p>
              </div>
              
              {error && (
                <div className="error-message">
                  <i className="error-icon">⚠️</i>
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-floating">
                  <input
                    id="username"
                    type="text"
                    placeholder=" "
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">
                    <i className="input-icon">👤</i>
                    Username
                  </label>
                  <div className="input-highlight"></div>
                </div>
                
                <div className="form-floating">
                  <input
                    id="email"
                    type="email"
                    placeholder=" "
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <label htmlFor="email">
                    <i className="input-icon">✉️</i>
                    Email (Optional)
                  </label>
                  <div className="input-highlight"></div>
                </div>
                
                <div className="form-floating">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder=" "
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <label htmlFor="password">
                    <i className="input-icon">🔒</i>
                    Password
                  </label>
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                  <div className="input-highlight"></div>
                </div>
                
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar-container">
                      <div 
                        className="strength-bar" 
                        style={{ 
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor()
                        }}
                      ></div>
                    </div>
                    <span className="strength-text" style={{ color: getStrengthColor() }}>
                      {passwordStrength <= 25 && "Weak"}
                      {passwordStrength > 25 && passwordStrength <= 50 && "Fair"}
                      {passwordStrength > 50 && passwordStrength <= 75 && "Good"}
                      {passwordStrength > 75 && "Strong"}
                    </span>
                  </div>
                )}
                
                <div className="form-floating">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder=" "
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    className={!passwordMatch ? "input-error" : ""}
                  />
                  <label htmlFor="confirmPassword">
                    <i className="input-icon">🔒</i>
                    Confirm Password
                  </label>
                  <div className="input-highlight"></div>
                  {!passwordMatch && (
                    <div className="password-match-error">Passwords do not match</div>
                  )}
                </div>
                
                <div className="form-options">
                  <div className="checkbox-wrapper">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms" className="checkbox-label">
                      I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link>
                    </label>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="auth-button signup-button"
                  disabled={loading || !passwordMatch}
                >
                  {loading ? (
                    <div className="loader">
                      <span className="loader-dot"></span>
                      <span className="loader-dot"></span>
                      <span className="loader-dot"></span>
                    </div>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <i className="button-icon">→</i>
                    </>
                  )}
                </button>
              </form>
              
              <div className="auth-footer">
                <p>Already have an account?</p>
                <Link to="/login" className="login-link">
                  <span>Sign In</span>
                  <i className="link-icon">→</i>
                </Link>
              </div>
              
              <div className="auth-decoration auth-decoration-1"></div>
              <div className="auth-decoration auth-decoration-2"></div>
              <div className="auth-decoration auth-decoration-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
