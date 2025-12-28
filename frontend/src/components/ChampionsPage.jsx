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
              video.play().catch(error => {
                console.error('Error playing video:', error);
              });
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

    if (video.paused) {
      video.play().catch(error => {
        console.error('Error playing video:', error);
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
