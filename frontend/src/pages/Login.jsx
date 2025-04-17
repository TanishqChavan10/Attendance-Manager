import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../components/styles/auth-new.css";

const Login = () => {
  const { login, error, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [isActive, setIsActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add the active class after component mounts for animation
    const timer = setTimeout(() => setIsActive(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by the auth context
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="auth-page">
      <div className={`login-container ${isActive ? 'active' : ''}`}>
        <div className="auth-card">
          <div className="auth-card-inner">
            <div className="auth-card-front">
              <div className="auth-header">
                <div className="logo-container">
                  <div className="logo">
                    <span className="logo-icon">📊</span>
                  </div>
                </div>
                <h1>Welcome Back</h1>
                <p>Sign in to continue to your dashboard</p>
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
                
                <div className="form-options">
                  <div className="checkbox-wrapper">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember" className="checkbox-label">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                </div>
                
                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loader">
                      <span className="loader-dot"></span>
                      <span className="loader-dot"></span>
                      <span className="loader-dot"></span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <i className="button-icon">→</i>
                    </>
                  )}
                </button>
              </form>
              
              <div className="auth-footer">
                <p>Don't have an account?</p>
                <Link to="/register" className="signup-link">
                  <span>Create Account</span>
                  <i className="link-icon">+</i>
                </Link>
              </div>
              
              <div className="auth-decoration auth-decoration-1"></div>
              <div className="auth-decoration auth-decoration-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
