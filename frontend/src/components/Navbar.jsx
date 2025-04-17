import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const lastScrollY = useRef(0);

  // Add scroll event listener for scrolled state and hide on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state for shadow effect
      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Hide navbar on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 300 && !mobileMenuOpen) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Check if current route matches
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Toggle body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      setHidden(false); // Ensure navbar is visible when menu is open
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${hidden ? 'hide' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          <div className="nav-brand">
            <Link to="/">
              <span className="brand-text">Attendance Manager</span>
            </Link>
          </div>
          
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
                <Link to="/timetable" className={isActive('/timetable') ? 'active' : ''}>Timetable</Link>
                <Link to="/courses/add" className={isActive('/courses/add') ? 'active' : ''}>Add Course</Link>
                <button 
                  className="btn-danger btn-ripple btn-rounded" 
                  onClick={logout}
                >
                  Logout {user?.username && `(${user.username})`}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link>
                <Link to="/register" className={isActive('/register') ? 'active' : ''}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="navbar-overlay" onClick={closeMenu}></div>
    </nav>
  );
};

export default Navbar;
