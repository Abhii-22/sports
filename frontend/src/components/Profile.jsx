import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import UploadModal from './UploadModal';
import EditProfileModal from './EditProfileModal';
import './Profile.css';

const Profile = () => {
  const { currentUser, signOut } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [stats, setStats] = useState({
    posts: 0,
    events: 0,
    totalLikes: 0
  });
  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004'; // Force API URL to port 5004

  useEffect(() => {
    const fetchPosts = async (userId) => {
      try {
        const res = await axios.get(`${API}/api/posts/user/${userId}`);
        // Add liked status to each post
        const postsWithLikedStatus = res.data.map(post => ({
          ...post,
          liked: (currentUser && post.likedBy?.some(likedUser => 
            (likedUser._id === currentUser._id) || (likedUser.toString() === currentUser._id)
          )) || false
        }));
        setPosts(postsWithLikedStatus);
        // Update stats
        setStats(prev => ({
          ...prev,
          posts: res.data.length,
          totalLikes: res.data.reduce((acc, post) => acc + (post.likes || 0), 0)
        }));
      } catch (error) {
        console.error('Failed to load posts', error);
        setError('Failed to load posts');
      }
    };

    const fetchEvents = async (userId) => {
      try {
        const res = await axios.get(`${API}/api/events/user/${userId}`);
        setEvents(res.data);
        // Update stats
        setStats(prev => ({
          ...prev,
          events: res.data.length
        }));
      } catch (error) {
        console.error('Failed to load events', error);
        setError('Failed to load events');
      }
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API}/api/profile/me`);
        setProfileData(res.data);
        await Promise.all([
          fetchPosts(res.data._id),
          fetchEvents(res.data._id)
        ]);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    } else {
      setLoading(false);
      setError('Please log in to view your profile');
    }
  }, [currentUser, API]);

  const handleUploadSuccess = () => {
    // Refetch posts and events to show the new ones
    const fetchPosts = async (userId) => {
      try {
        const res = await axios.get(`${API}/api/posts/user/${userId}`);
        // Add liked status to each post
        const postsWithLikedStatus = res.data.map(post => ({
          ...post,
          liked: (currentUser && post.likedBy?.some(likedUser => 
            (likedUser._id === currentUser._id) || (likedUser.toString() === currentUser._id)
          )) || false
        }));
        setPosts(postsWithLikedStatus);
        setStats(prev => ({
          ...prev,
          posts: res.data.length,
          totalLikes: res.data.reduce((acc, post) => acc + (post.likes || 0), 0)
        }));
      } catch (error) {
        console.error('Failed to load posts', error);
      }
    };

    const fetchEvents = async (userId) => {
      try {
        const res = await axios.get(`${API}/api/events/user/${userId}`);
        setEvents(res.data);
        setStats(prev => ({
          ...prev,
          events: res.data.length
        }));
      } catch (error) {
        console.error('Failed to load events', error);
      }
    };

    if (currentUser) {
      Promise.all([
        fetchPosts(currentUser._id),
        fetchEvents(currentUser._id)
      ]);
    }
    setShowUploadModal(false);
  };

  const handleSaveProfile = (updatedProfile) => {
    setProfileData(updatedProfile);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleLikePost = async (postId) => {
    try {
      // Find current post to check if liked
      const currentPost = posts.find(post => post._id === postId);
      if (!currentPost) return;

      // Make API call to like/unlike
      const endpoint = currentPost.liked ? 'unlike' : 'like';
      const response = await axios.put(`${API}/api/posts/${postId}/${endpoint}`, {}, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      // Update posts state with response data
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, likes: response.data.likes, liked: response.data.liked }
            : post
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalLikes: prev.totalLikes + (response.data.liked ? 1 : -1)
      }));
    } catch (error) {
      console.error('Failed to like post', error);
      // Fallback to frontend-only update if API fails
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? { ...post, likes: (post.likes || 0) + 1, liked: true }
            : post
        )
      );
      
      // Update stats
      const updatedPosts = posts.map(post => 
        post._id === postId 
          ? { ...post, likes: (post.likes || 0) + 1, liked: true }
          : post
      );
      setStats(prev => ({
        ...prev,
        totalLikes: updatedPosts.reduce((acc, post) => acc + (post.likes || 0), 0)
      }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="error-container">
        <div className="error-icon">🔒</div>
        <h3>Profile Not Available</h3>
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={profileData.profilePictureUrl} 
          alt="Profile" 
          className="profile-picture" 
        />
        <div className="profile-info">
          <div className="profile-main-info">
            <h2>{profileData.name}</h2>
            <div className="profile-buttons">
              <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>Edit Profile</button>
              <button onClick={() => setShowUploadModal(true)} className="upload-btn">Upload</button>
              <button onClick={signOut} className="sign-out-btn">Sign Out</button>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <strong>{stats.posts}</strong>
              <span>Posts</span>
            </div>
            <div className="stat-item">
              <strong>{stats.events}</strong>
              <span>Events</span>
            </div>
            <div className="stat-item">
              <strong>{stats.totalLikes}</strong>
              <span>Likes</span>
            </div>
          </div>
          <div className="profile-bio">
            <p>{profileData.bio}</p>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <div 
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`} 
          onClick={() => setActiveTab('posts')}
        >
          POSTS
        </div>
        <div 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`} 
          onClick={() => setActiveTab('events')}
        >
          EVENTS
        </div>
      </div>

      {activeTab === 'posts' ? (
        <div className="user-events-list">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div 
                key={post._id} 
                className="profile-event-card" 
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handlePostClick(post)}
              >
                {post.mediaType && post.mediaType.startsWith('video/') ? (
                  <div className="video-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                ) : null}
                <img src={`${API}${post.mediaUrl}`} alt={post.title} className="event-poster" />
                <div className="event-overlay">
                  <div className="post-info">
                    <h4>{post.title || 'Untitled'}</h4>
                    <div className="post-meta">
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <div className="post-stats">
                        <span className="likes-count">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {post.likes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts-container">
              <div className="no-posts-icon">📸</div>
              <p className="no-events-msg">You haven't uploaded any posts yet.</p>
              <button onClick={() => setShowUploadModal(true)} className="first-upload-btn">
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="user-events-list">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div 
                key={event._id} 
                className="profile-event-card" 
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handlePostClick(event)}
              >
                <div className="event-badge">🏆</div>
                <img src={`${API}${event.poster}`} alt={event.title} className="event-poster" />
                <div className="event-overlay">
                  <div className="post-info">
                    <h4>{event.title}</h4>
                    <div className="post-meta">
                      <span className="post-date">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <div className="post-stats">
                        <span className="sport-tag">{event.sportName}</span>
                        <span className="view-count">
                          👁️ {event.viewCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts-container">
              <div className="no-posts-icon">🏆</div>
              <p className="no-events-msg">You haven't created any events yet.</p>
              <button onClick={() => setShowUploadModal(true)} className="first-upload-btn">
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Post/Event View Modal */}
      {showPostModal && selectedPost && (
        <div className="post-modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowPostModal(false)}>×</button>
            <div className="post-modal-body">
              <div className="post-media">
                {selectedPost.mediaType ? (
                  // It's a post
                  selectedPost.mediaType.startsWith('video/') ? (
                    <video src={`${API}${selectedPost.mediaUrl}`} controls autoPlay className="modal-video" />
                  ) : (
                    <img src={`${API}${selectedPost.mediaUrl}`} alt={selectedPost.title} className="modal-image" />
                  )
                ) : (
                  // It's an event
                  <img src={`${API}${selectedPost.poster}`} alt={selectedPost.title} className="modal-image" />
                )}
              </div>
              <div className="post-details">
                <h3>
                  {selectedPost.title || 'Untitled'}
                  {selectedPost.viewCount && (
                    <span className="event-views">
                      👁️ {selectedPost.viewCount || 0}
                    </span>
                  )}
                </h3>
                {selectedPost.mediaType ? (
                  // Post details
                  <p className="post-date-detail">
                    Posted on {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </p>
                ) : (
                  // Event details
                  <div className="event-details">
                    <p className="post-date-detail">
                      📅 {new Date(selectedPost.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="event-location">
                      📍 {selectedPost.place}
                    </p>
                    <p className="event-sport">
                      🏆 {selectedPost.sportName}
                    </p>
                    {selectedPost.rules && (
                      <p className="event-rules">
                        📋 {selectedPost.rules}
                      </p>
                    )}
                  </div>
                )}
                <div className="post-actions">
                  {selectedPost.mediaType ? (
                    // Post like button
                    <button 
                      className={`like-button ${selectedPost.liked ? 'liked' : ''}`}
                      onClick={() => handleLikePost(selectedPost._id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {selectedPost.likes || 0} Likes
                    </button>
                  ) : (
                    // Event action buttons
                    <div className="event-actions">
                      <span className="event-type-badge">EVENT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} />}
      {showEditModal && (
        <EditProfileModal 
          user={profileData} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleSaveProfile} 
        />
      )}
    </div>
  );
};

export default Profile;
