import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header = () => {
  const { currentUser } = useAuth();
  const { toggleUploadForm } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/profile' || location.pathname === '/events' || location.pathname === '/reels') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [location]);

  return (
    <header className={isVisible ? 'header-visible' : 'header-hidden'}>
      <h1><Link to="/">Sports Club</Link></h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/home#about">About</Link></li>
                    <li><Link to="/home#contact">Contact</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/reels">Reels</Link></li>
        </ul>
      </nav>
      <div className="auth-buttons">
        {currentUser ? (
          <>
            <button onClick={toggleUploadForm} className="btn btn-upload">Upload Event</button>
            <div className="profile-container">
              <Link to="/profile" className="profile-icon">
                {currentUser.name.charAt(0).toUpperCase()}
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link to="/signin" className="btn btn-signin">Sign In</Link>
            <Link to="/signup" className="btn btn-signup">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
