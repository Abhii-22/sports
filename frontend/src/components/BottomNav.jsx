import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './BottomNav.css';
import { FaHome, FaFutbol, FaPlusSquare, FaYoutube, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleUploadClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      navigate('/signin');
    }
  };

  return (
    <nav className="bottom-nav">
      <Link to="/home" className="nav-item">
        <FaHome />
      </Link>
            <Link to="/events" className="nav-item">
        <FaFutbol />
      </Link>
      <Link to="/upload" className="nav-item" onClick={handleUploadClick}>
        <FaPlusSquare />
      </Link>
      <Link to="/reels" className="nav-item">
        <FaYoutube />
      </Link>
      <Link to="/profile" className="nav-item">
        <FaUser />
      </Link>
    </nav>
  );
};

export default BottomNav;
