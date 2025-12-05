import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './UploadEventForm.css';

const UploadEventForm = ({ addEvent, onClose }) => {
  const { token } = useAuth();
  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sportName: '',
    place: '',
    date: '',
    timings: '',
    prize1: '',
    prize2: '',
    prize3: '',
    prize4: '',
    prize5: '',
    eventImage: null
  });
  
  const formRef = useRef(null);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
      onClose();
      window.history.back();
    };

    window.addEventListener('popstate', handleBackButton);
    
    // Push a new state to enable back button handling
    window.history.pushState({ modal: true }, '', window.location.pathname);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [onClose]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY - endY;
    
    // Swipe down to close (threshold of 100px)
    if (diff < -100) {
      onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    const data = new FormData();
    // Handle file upload with the correct field name 'eventImage'
    if (formData.eventImage) {
      data.append('eventImage', formData.eventImage);
    }
    
    // Append all form fields, including empty strings for required fields
    const formFields = ['title', 'sportName', 'date', 'place', 'prize1', 'prize2', 'prize3', 'prize4', 'prize5'];
    
    formFields.forEach(field => {
      // Always include required fields, even if empty (to trigger proper validation)
      data.append(field, formData[field] || '');
    });
    
    // Add timings if it exists
    if (formData.timings) {
      data.append('timings', formData.timings);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-auth-token': token,
      },
    };

    try {
      const res = await axios.post(`${API}/api/events`, data, config);
      addEvent(res.data);
      setSubmitSuccess(true);
      
      // Hide the success message and close the form after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to upload event', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-form-dropdown">
      <div className="dropdown-overlay" onClick={onClose}></div>
      <div 
        className="dropdown-content"
        ref={formRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="dropdown-header">
          <h3>🏆 Create New Event</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-row">
            <div className="form-group">
              <label>Event Title *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>
            <div className="form-group">
              <label>Sport Name *</label>
              <input 
                type="text" 
                name="sportName" 
                value={formData.sportName}
                onChange={handleInputChange}
                placeholder="e.g., Cricket, Football"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Venue *</label>
              <input 
                type="text" 
                name="place" 
                value={formData.place}
                onChange={handleInputChange}
                placeholder="Event location"
                required
              />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Timings</label>
            <input 
              type="text" 
              name="timings" 
              value={formData.timings}
              onChange={handleInputChange}
              placeholder="e.g., 9:00 AM - 6:00 PM"
            />
          </div>

          <div className="prizes-section">
            <h4>🎁 Prize Distribution</h4>
            <div className="prizes-grid">
              {['1st', '2nd', '3rd', '4th', '5th'].map((position, index) => (
                <div className="prize-input" key={position}>
                  <label>{position}</label>
                  <input 
                    type="text" 
                    name={`prize${index + 1}`}
                    value={formData[`prize${index + 1}`]}
                    onChange={handleInputChange}
                    placeholder="Prize details"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Event Image</label>
            <div className="file-input-wrapper">
              <input 
                type="file" 
                name="eventImage" 
                onChange={handleInputChange}
                accept="image/*"
                id="eventImage"
              />
              <label htmlFor="eventImage" className="file-input-label">
                {formData.eventImage ? formData.eventImage.name : '📷 Choose Image'}
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? '⏳ Creating...' : '🚀 Create Event'}
            </button>
          </div>
          
          {/* Success Message */}
          {submitSuccess && (
            <div className="success-message">
              <div className="success-content">
                <span className="success-icon">✓</span>
                <span>Event Submitted successfully!</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadEventForm;
