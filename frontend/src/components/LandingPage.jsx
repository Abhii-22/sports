import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaArrowRight, FaUsers, FaCalendarAlt, FaFire, FaStar } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const fullText = "Welcome to Sports Club";
  const subtitleText = "Your ultimate destination for sports events and community";

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  const [subtitleDisplayed, setSubtitleDisplayed] = useState('');
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= fullText.length) {
      setTimeout(() => {
        if (subtitleIndex < subtitleText.length) {
          const timeout = setTimeout(() => {
            setSubtitleDisplayed(subtitleText.substring(0, subtitleIndex + 1));
            setSubtitleIndex(subtitleIndex + 1);
          }, 50);
          return () => clearTimeout(timeout);
        }
      }, 500);
    }
  }, [currentIndex, subtitleIndex, subtitleText, fullText]);

  const features = [
    { icon: <FaTrophy />, text: "Championships" },
    { icon: <FaUsers />, text: "Community" },
    { icon: <FaCalendarAlt />, text: "Events" },
    { icon: <FaFire />, text: "Competitions" }
  ];

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="gradient-overlay"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="landing-container">
        <div className="landing-content">
          <div className="logo-section">
            <div className="logo-wrapper">
              <FaTrophy className="logo-icon" />
            </div>
            <span className="logo-text">SportsClub</span>
          </div>
          
          <h1 className="main-title">
            {displayedText}
            <span className="cursor">|</span>
          </h1>
          
          <p className="subtitle">
            {subtitleDisplayed}
            {subtitleIndex < subtitleText.length && <span className="cursor">|</span>}
          </p>

          <div className="features-preview">
            {features.map((feature, index) => (
              <div key={index} className="feature-badge" style={{ animationDelay: `${1.5 + index * 0.2}s` }}>
                {feature.icon}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="button-group">
            <Link to="/signup" className="btn btn-primary">
              <span>Get Started</span>
              <FaArrowRight className="btn-icon" />
            </Link>
            <Link to="/signin" className="btn btn-secondary">Sign In</Link>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <span>Scroll to explore</span>
      </div>
    </div>
  );
};

export default LandingPage;
