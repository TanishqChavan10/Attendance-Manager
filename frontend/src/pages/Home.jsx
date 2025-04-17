import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Scroll to top when the home page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <div className="home-container fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-xl) 0' }}>
      <h1 className="bounce-in" style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-lg)' }}>
        Welcome to <span className="gradient-text">Attendance Manager</span>
      </h1>
      
      <div className="glass-effect" style={{ 
        background: 'var(--gradient-primary)', 
        color: 'white', 
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--spacing-xl)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="shimmer" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px' }}></div>
        <h2 className="scale-in" style={{ color: 'white', marginBottom: 'var(--spacing-md)' }}>Track Your Attendance Effortlessly</h2>
        <p className="slide-in-left" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-lg)' }}>
          Keep track of your course attendance, get insights, and never miss a class again!
        </p>
        
        {loading ? (
          <div className="loading-dots">
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
          </div>
        ) : (
          isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary btn-rounded btn-3d pulse">
              Go to Dashboard
            </Link>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-primary btn-rounded btn-3d">
                Log In
              </Link>
              <Link to="/register" className="btn-outline btn-rounded" style={{ marginLeft: 'var(--spacing-md)' }}>
                Sign Up
              </Link>
            </div>
          )
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <div className="feature-card staggered-item" style={{ 
          padding: 'var(--spacing-lg)', 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div className="feature-icon" style={{ marginBottom: 'var(--spacing-sm)' }}>📊</div>
          <h3>Track Attendance</h3>
          <p>Easily record and monitor your class attendance for all courses.</p>
        </div>
        
        <div className="feature-card staggered-item" style={{ 
          padding: 'var(--spacing-lg)', 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div className="feature-icon" style={{ marginBottom: 'var(--spacing-sm)' }}>📈</div>
          <h3>Visualize Progress</h3>
          <p>Get insights with visual charts and attendance percentages.</p>
        </div>
        
        <div className="feature-card staggered-item" style={{ 
          padding: 'var(--spacing-lg)', 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div className="feature-icon" style={{ marginBottom: 'var(--spacing-sm)' }}>⏰</div>
          <h3>Never Miss Class</h3>
          <p>Set reminders and view your daily class schedule.</p>
        </div>
      </div>
      
      <div className="cta-container" style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-lg)' }}>
        <h2>Ready to Start?</h2>
        <p>Join thousands of students using Attendance Manager to stay on track.</p>
        {!isAuthenticated && !loading && (
          <Link to="/register" className="btn-gradient btn-lg btn-rounded scale-in">
            Get Started Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
  