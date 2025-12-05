import React, { useState } from 'react';
import { 
  FaCalendarAlt, FaTrophy, 
  FaSearch,
  FaFilter, FaClock, FaChevronRight,
  FaShareAlt, FaEye, FaBookmark,
  FaFlag, FaChartLine, FaBolt, FaTags,
  FaLocationArrow, FaCalendarDay, FaInfoCircle,
  FaArrowRight, FaExpand, FaCompress
} from 'react-icons/fa';
import './Events.css';
import Modal from './Modal';
const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004';

const sportIcons = {
  'Kabaddi': { icon: '🤼', color: '#FF6B6B' },
  'Cricket': { icon: '🏏', color: '#4ECDC4' },
  'Volleyball': { icon: '🏐', color: '#45B7D1' },
  'Tennis': { icon: '🎾', color: '#96CEB4' },
  'Badminton': { icon: '🏸', color: '#FFEAA7' },
  'Others': { icon: '⚡', color: '#DDA0DD' }
};

const prizeIcons = {
  '1st': { icon: '👑', class: 'gold' },
  '2nd': { icon: '🥈', class: 'silver' },
  '3rd': { icon: '🥉', class: 'bronze' },
  '4th': { icon: '🏆', class: 'platinum' },
  '5th': { icon: '⭐', class: 'star' }
};

const Events = ({ events: initialEvents = [] }) => {
  const [eventsList, setEventsList] = useState(initialEvents);

  // Update events list when the initialEvents prop changes
  React.useEffect(() => {
    setEventsList(initialEvents);
  }, [initialEvents]);

  // Track if a view has been recorded for each event
  const [viewedEvents, setViewedEvents] = useState(new Set());

  const trackEventView = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Only track for logged-in users
      
      // Check if this user has already viewed this event in this session
      if (viewedEvents.has(eventId)) {
        return; // Already viewed, don't count again
      }
      
      // Optimistically update the UI
      setEventsList(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, viewCount: (event.viewCount || 0) + 1 } 
            : event
        )
      );
      
      // Mark this event as viewed by this user in this session
      setViewedEvents(prev => new Set(prev).add(eventId));
      
      // Send the view to the server
      const response = await fetch(`${API}/api/events/view/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      // If there's an error, revert the optimistic update
      if (!response.ok) {
        setEventsList(prevEvents => 
          prevEvents.map(event => 
            event._id === eventId 
              ? { ...event, viewCount: Math.max(0, (event.viewCount || 1) - 1) } 
              : event
          )
        );
        // Remove from viewed events to allow retry
        setViewedEvents(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error tracking event view:', error);
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [savedEvents, setSavedEvents] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showEventSections, setShowEventSections] = useState(false);

  const sports = ['All', 'Kabaddi', 'Cricket', 'Volleyball', 'Tennis', 'Badminton', 'Others'];

  const filteredAndSortedEvents = eventsList
    .filter(event => {
      const matchesSport = selectedSport === 'All' || 
        (event.sportName && event.sportName.toLowerCase() === selectedSport.toLowerCase());
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.sportName && event.sportName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = !locationSearch || 
        (event.place && event.place.toLowerCase().includes(locationSearch.toLowerCase()));
      return matchesSport && matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        // First try to sort by createdAt if available (newest first)
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // Fallback to event date if createdAt is not available
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'popularity') {
        return (b.views || 0) - (a.views || 0);
      }
      // Default: sort by createdAt (newest first) or date if createdAt is not available
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(b.date) - new Date(a.date);
    });

  const openModal = (poster) => {
    setSelectedPoster(poster);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPoster(null);
  };

  const toggleSave = (eventId) => {
    const newSavedEvents = new Set(savedEvents);
    if (newSavedEvents.has(eventId)) {
      newSavedEvents.delete(eventId);
    } else {
      newSavedEvents.add(eventId);
    }
    setSavedEvents(newSavedEvents);
  };

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setSelectedPoster(`${API}${event.poster}`);
    setExpandedCard(expandedCard === event._id ? null : event._id);
    
    // Track the view when a card is clicked
    if (event._id) {
      trackEventView(event._id);
    }
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEventStatus = (eventDate) => {
    const days = getDaysUntilEvent(eventDate);
    if (days < 0) return { text: 'Event Ended', class: 'ended', color: '#FF6B6B' };
    if (days === 0) return { text: 'Today', class: 'today', color: '#FFD93D' };
    if (days === 1) return { text: 'Tomorrow', class: 'tomorrow', color: '#6BCF7F' };
    if (days <= 7) return { text: `${days} days`, class: 'soon', color: '#4ECDC4' };
    return { text: `${days} days`, class: 'upcoming', color: '#A8E6CF' };
  };

  const getStatsData = (eventsToCheck) => {
    const today = new Date();
    const upcoming = eventsToCheck.filter(e => new Date(e.date) > today).length;
    const todayEvents = eventsToCheck.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === today.toDateString();
    }).length;
    
    return {
      total: eventsToCheck.length,
      upcoming,
      today: todayEvents
    };
  };

  const stats = getStatsData(eventsList);

  return (
    <>
      <div className="events-page-modern">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
          </div>
          
          <div className="hero-content">
            <div className="hero-header">
              <div className="hero-title">
                <div className="title-badge">
                  <FaBolt className="badge-icon" />
                  <span>SPORTS HUB</span>
                </div>
                <h1>
                  <span className="title-main">Championship</span>
                  <span className="title-sub">Events</span>
                </h1>
                <p className="hero-description">
                  Discover and join the most exciting sports competitions in your area
                </p>
              </div>
              
            </div>

            {/* Event Sections Toggle Button */}
            <div className="event-sections-toggle">
              <button 
                className="toggle-sections-btn"
                onClick={() => setShowEventSections(!showEventSections)}
              >
                <FaFilter />
                <span>{showEventSections ? 'Hide' : 'Show'} Event Sections</span>
                <FaChevronRight className={`chevron ${showEventSections ? 'open' : ''}`} />
              </button>
            </div>

            {/* Stats Cards */}
            {showEventSections && (
            <div className="stats-grid">
              <div className="stat-card-modern">
                <div className="stat-icon-wrapper total">
                  <FaFlag />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Total Events</span>
                </div>
              </div>
              
              <div className="stat-card-modern">
                <div className="stat-icon-wrapper upcoming">
                  <FaCalendarDay />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{stats.upcoming}</span>
                  <span className="stat-label">Upcoming</span>
                </div>
              </div>
              
              <div className="stat-card-modern">
                <div className="stat-icon-wrapper today">
                  <FaBolt />
                </div>
                <div className="stat-content">
                  <span className="stat-number">{stats.today}</span>
                  <span className="stat-label">Today</span>
                </div>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* Advanced Filter Section */}
        <section className="filter-section">
          <div className="filter-header">
            <button 
              className="filter-toggle"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FaFilter />
              <span>Filters</span>
              <FaChevronRight className={`chevron ${filterOpen ? 'open' : ''}`} />
            </button>
          </div>
          
          <div className={`filter-content ${filterOpen ? 'open' : ''}`}>
            <div className="filter-row">
              <div className="search-wrapper">
                <div className="search-container">
                  <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="search-bar location-search">
                    <FaLocationArrow className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by location..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="filter-controls">
                <div className="sport-filter">
                  <div className="filter-label">
                    <FaTags />
                    <span>Sports</span>
                  </div>
                  <div className="sport-chips">
                    {sports.map(sport => (
                      <button 
                        key={sport}
                        className={`sport-chip ${selectedSport === sport ? 'active' : ''}`}
                        onClick={() => setSelectedSport(sport)}
                      >
                        {sportIcons[sport]?.icon || '🏆'}
                        <span>{sport}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="sort-control">
                  <div className="sort-select-wrapper">
                    <FaChartLine className="sort-icon" />
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select-modern"
                    >
                      <option value="date">📅 Sort by Date</option>
                      <option value="title">🔤 Sort by Name</option>
                      <option value="popularity">🔥 Sort by Popular</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events Display Area */}
        <section className="events-section">
          {filteredAndSortedEvents.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-illustration">
                <div className="empty-icon">
                  <FaSearch />
                </div>
                <div className="empty-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <h3>No Events Found</h3>
              <p>Try adjusting your search criteria or browse all sports</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedSport('All');
                  setSearchTerm('');
                  setSortBy('date');
                }}
              >
                <FaArrowRight />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {filteredAndSortedEvents.map((event, index) => {
                const status = getEventStatus(event.date);
                const isSaved = savedEvents.has(event._id);
                const isHovered = hoveredCard === event._id;
                const isExpanded = expandedCard === event._id;
                const sportInfo = sportIcons[event.sportName] || sportIcons['Others'];
                
                return (
                  <div 
                    key={event._id || index} 
                    className={`event-card-modern ${isHovered ? 'hovered' : ''} ${isExpanded ? 'expanded' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onMouseEnter={() => setHoveredCard(event._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Card Header */}
                    <div className="card-header-modern">
                      <div className="sport-indicator">
                        <div className="sport-icon" style={{ backgroundColor: sportInfo.color }}>
                          <span>{sportInfo.icon}</span>
                        </div>
                        <div className="sport-info">
                          <span className="sport-name">{event.sportName}</span>
                          <span className="event-category">Competition</span>
                        </div>
                      </div>
                      
                      <div className="card-actions-modern">
                        <div className="status-indicator" style={{ color: status.color }}>
                          <div className="status-dot" style={{ backgroundColor: status.color }}></div>
                          <span>{status.text}</span>
                        </div>
                        
                        <div className="action-buttons">
                          <button 
                            className={`action-btn-modern save ${isSaved ? 'saved' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(event._id);
                            }}
                            title="Save Event"
                          >
                            <FaBookmark />
                          </button>
                          <button 
                            className="action-btn-modern share"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Share functionality
                            }}
                            title="Share Event"
                          >
                            <FaShareAlt />
                          </button>
                          <button 
                            className="action-btn-modern expand"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(event);
                            }}
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? <FaCompress /> : <FaExpand />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Event Visual */}
                    <div className="event-visual-modern" onClick={() => {
                      openModal(`${API}${event.poster}`);
                      if (event._id) {
                        trackEventView(event._id);
                      }
                    }}>
                      <div className="poster-wrapper">
                        <img 
                          src={`${API}${event.poster}`} 
                          alt={event.title}
                          className="event-poster-modern"
                        />
                        <div className="poster-overlay-modern">
                          <div className="overlay-content">
                            <div className="expand-hint">
                              <FaExpand />
                              <span>Click to expand</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="card-content-modern">
                      <div className="event-title-section">
                        <h3 className="event-title-modern">{event.title}</h3>
                        <div className="event-meta-modern">
                          <div className="meta-item-modern">
                            <FaCalendarAlt className="meta-icon-modern" />
                            <div className="meta-content">
                              <span className="meta-label">Date</span>
                              <span className="meta-value">{new Date(event.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          </div>
                          
                          <div className="meta-item-modern">
                            <FaClock className="meta-icon-modern" />
                            <div className="meta-content">
                              <span className="meta-label">Time</span>
                              <span className="meta-value">
                                {new Date(event.date).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="meta-item-modern">
                            <FaLocationArrow className="meta-icon-modern" />
                            <div className="meta-content">
                              <span className="meta-label">Location</span>
                              <span className="meta-value">{event.place}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Details (shown when expanded) */}
                      {isExpanded && (
                        <div className="event-details-expanded">
                          <div className="detail-section">
                            <div className="detail-header">
                              <FaInfoCircle />
                              <span>Event Details</span>
                            </div>
                            <div className="detail-content">
                              <div className="detail-row">
                                <span className="detail-label">Sport:</span>
                                <span className="detail-value">{event.sportName}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Date:</span>
                                <span className="detail-value">
                                  {new Date(event.date).toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Time:</span>
                                <span className="detail-value">
                                  {new Date(event.date).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Location:</span>
                                <span className="detail-value">{event.place}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Rules:</span>
                                <span className="detail-value">{event.rules}</span>
                              </div>
                            </div>
                          </div>

                          {/* Prize Section */}
                          {event.prizes && Object.values(event.prizes).some(p => p) && (
                            <div className="prize-section-modern">
                              <div className="prize-header-modern">
                                <FaTrophy />
                                <span>Complete Prize Distribution</span>
                              </div>
                              <div className="prize-grid-modern">
                                {Object.entries(event.prizes).map(([rank, prize]) => (
                                  prize && (
                                    <div className="prize-card-modern" key={rank}>
                                      <div className="prize-rank">
                                        <span className="prize-icon">{prizeIcons[rank]?.icon}</span>
                                        <span className="rank-text">{rank}</span>
                                      </div>
                                      <div className="prize-amount">{prize}</div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Prize Preview - Show All Prizes */}
                      {!isExpanded && event.prizes && Object.values(event.prizes).some(p => p) && (
                        <div className="prize-preview">
                          <div className="prize-preview-header">
                            <FaTrophy />
                            <span>Prize Distribution</span>
                          </div>
                          <div className="prize-preview-items">
                            {Object.entries(event.prizes).map(([rank, prize]) => (
                              prize && (
                                <div className="prize-preview-item" key={rank}>
                                  <span>{prizeIcons[rank]?.icon}</span>
                                  <span>{prize}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      
      <Modal show={isModalOpen} onClose={closeModal}>
        {selectedPoster && <img src={selectedPoster} alt="Event poster" />}
      </Modal>
    </>
  );
};

export default Events;
