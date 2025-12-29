import React, { useState, useRef, useEffect } from 'react';
import { FaHeart, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import './ChampionsPage.css';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004';

const ChampionsPage = ({ reels, handleLike }) => {
  const [mutedStates, setMutedStates] = useState({});
  const videoRefs = useRef({});
  const reelRefs = useRef({});
  const containerRef = useRef(null);
  const [currentReel, setCurrentReel] = useState(null);

  // Initialize mute states for all reels
  useEffect(() => {
    const initialMutedStates = {};
    reels.forEach(reel => {
      if (reel.type && reel.type.startsWith('video/')) {
        // Check if we already have a state for this reel
        if (mutedStates[reel.id] === undefined) {
          initialMutedStates[reel.id] = true; // Start with sound off by default
        } else {
          initialMutedStates[reel.id] = mutedStates[reel.id];
        }
      }
    });
    // Only update if there are new reels
    if (Object.keys(initialMutedStates).length > 0) {
      setMutedStates(prev => ({
        ...prev,
        ...initialMutedStates
      }));
    }
  }, [reels]);

  // Set up intersection observer for video playback
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const videoId = entry.target.getAttribute('data-reel-id');
          const video = videoRefs.current[videoId];
          
          if (entry.isIntersecting) {
            // When a reel comes into view
            setCurrentReel(videoId);
            if (video) {
              // Check if video has a valid source before playing
              if (video.src && video.readyState >= 2) {
                video.play().catch(error => {
                  // Silently handle play errors (user interaction, autoplay policies, etc.)
                  if (error.name !== 'NotSupportedError') {
                    console.error('Error playing video:', error);
                  }
                });
              }
            }
          } else {
            // When a reel goes out of view
            if (video && videoId === currentReel) {
              video.pause();
              video.currentTime = 0; // Reset to start
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.8 // Trigger when 80% of the reel is visible
      }
    );

    // Observe all reel containers
    Object.values(reelRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    // Cleanup
    return () => {
      Object.values(reelRefs.current).forEach(el => {
        if (el) observer.unobserve(el);
      });
      observer.disconnect();
    };
  }, [reels, currentReel]);

  const toggleMute = (reelId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    setMutedStates(prev => {
      const newState = {
        ...prev,
        [reelId]: !prev[reelId]
      };
      
      // Update the video element's muted state
      const video = videoRefs.current[reelId];
      if (video) {
        video.muted = newState[reelId];
      }
      
      return newState;
    });
  };

  const handleVideoClick = (e, reelId) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    // Check if video has a valid source before playing
    if (!video.src || video.readyState === 0) {
      console.warn('Video source not available or not loaded');
      return;
    }

    if (video.paused) {
      video.play().catch(error => {
        // Silently handle play errors
        if (error.name !== 'NotSupportedError') {
          console.error('Error playing video:', error);
        }
      });
    } else {
      video.pause();
    }
  };

  return (
    <div className="reels-container" ref={containerRef}>
      {reels.length > 0 ? (
        reels.map(reel => (
          <div 
            key={reel.id} 
            className="reel"
            ref={el => reelRefs.current[reel.id] = el}
            data-reel-id={reel.id}
          >
            {reel.type && reel.type.startsWith('video/') ? (
              <div className="video-container">
                <video 
                  ref={el => {
                    videoRefs.current[reel.id] = el;
                    // Ensure the video's muted state is in sync with our state
                    if (el) {
                      el.muted = mutedStates[reel.id] !== false;
                    }
                  }}
                  src={reel.src} 
                  autoPlay 
                  loop 
                  playsInline
                  muted={mutedStates[reel.id] !== false}
                  className="reel-media"
                  onClick={(e) => handleVideoClick(e, reel.id)}
                  onError={(e) => {
                    const video = e.target;
                    const error = video.error;
                    
                    // Only log in development mode
                    if (process.env.NODE_ENV === 'development') {
                      if (error) {
                        const errorMessages = {
                          1: 'MEDIA_ERR_ABORTED - Video loading aborted',
                          2: 'MEDIA_ERR_NETWORK - Network error',
                          3: 'MEDIA_ERR_DECODE - Video decoding error',
                          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported'
                        };
                        console.warn(`Video load error for reel ${reel.id}:`, errorMessages[error.code] || `Error code ${error.code}`);
                      } else {
                        console.warn('Video load error for reel:', reel.id);
                      }
                    }
                    
                    // Prevent infinite error loop
                    video.onerror = null;
                    
                    // Hide the video element
                    video.style.display = 'none';
                    
                    // Hide the mute button
                    const muteButton = video.parentNode?.querySelector('.mute-button');
                    if (muteButton) {
                      muteButton.style.display = 'none';
                    }
                    
                    // Check if error message already exists
                    const container = video.parentNode;
                    if (!container) return;
                    
                    const existingError = container.querySelector('.video-error-message');
                    if (existingError) return;
                    
                    // Create error message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'video-error-message';
                    errorDiv.textContent = 'Video not available';
                    errorDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; min-height: 100%; color: #999; background: #f5f5f5; border-radius: 8px; font-size: 14px;';
                    
                    // Insert error message
                    container.insertBefore(errorDiv, video.nextSibling);
                  }}
                  onLoadedData={(e) => {
                    // Video source loaded successfully
                    if (e.target.readyState >= 2) {
                      // Video is ready to play
                    }
                  }}
                />
                <button 
                  className="mute-button"
                  onClick={(e) => toggleMute(reel.id, e)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    toggleMute(reel.id, e);
                  }}
                  title={mutedStates[reel.id] ? 'Unmute' : 'Mute'}
                  aria-label={mutedStates[reel.id] ? 'Unmute video' : 'Mute video'}
                >
                  {mutedStates[reel.id] !== false ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
              </div>
            ) : (
              <div className="video-container">
                <img src={reel.src} alt="Reel content" className="reel-media" />
              </div>
            )}
            <div className="reel-user-profile">
              <img 
                src={
                  reel.uploadedBy?.profilePictureUrl 
                    ? reel.uploadedBy.profilePictureUrl.startsWith('http')
                      ? reel.uploadedBy.profilePictureUrl
                      : `${API}${reel.uploadedBy.profilePictureUrl}`
                    : 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop'
                } 
                alt={`${reel.uploadedBy?.name || 'User'} profile`} 
                className="reel-profile-picture"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop';
                }}
              />
              <div className="reel-user-info">
                <p className="reel-username">{reel.uploadedBy?.name || 'Unknown User'}</p>
              </div>
            </div>
            <div className="reel-actions">
              <button onClick={() => handleLike(reel.id)} className={reel.liked ? 'like-btn liked' : 'like-btn'}>
                <FaHeart />
              </button>
              <span>{reel.likes}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="no-reels-msg">No reels yet. Be the first to upload!</p>
      )}
    </div>
  );
};

export default ChampionsPage;
