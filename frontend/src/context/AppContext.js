import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004';

export const AppProvider = ({ children }) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [reels, setReels] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage or AuthContext
    const user = JSON.parse(localStorage.getItem('user')) || null;
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API}/api/events`);
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      }
    };

    const fetchAllPosts = async () => {
      try {
        const res = await axios.get(`${API}/api/posts`);
        const transformedReels = res.data.map(post => ({
          id: post._id,
          src: `${API}${post.mediaUrl}`,
          type: post.mediaType,
          likes: post.likes || 0,
          liked: ((currentUser) && (post.likedBy?.some(likedUser => 
            (likedUser._id === currentUser._id) || (likedUser.toString() === currentUser._id)
          ))) || false,
          uploadedBy: post.user ? {
            name: post.user.name,
            email: post.user.email,
            profilePictureUrl: post.user.profilePictureUrl
          } : {
            name: 'Unknown User',
            email: '',
            profilePictureUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop'
          }
        }));
        setReels(transformedReels);
      } catch (error) {
        console.error('Failed to fetch all posts', error);
      }
    };

    fetchEvents();
    fetchAllPosts();
  }, [currentUser]);

  const addEvent = (newEvent) => {
    setEvents(prevEvents => [...prevEvents, { ...newEvent, id: prevEvents.length + 1 }]);
    setShowUploadForm(false);
  };

  const addReel = (file) => {
    const newId = `item-${Date.now()}`;
    const newUrl = URL.createObjectURL(file);

    const newPost = {
      id: newId,
      poster: newUrl,
      title: file.name,
      date: new Date().toLocaleDateString(),
      uploadedBy: currentUser ? currentUser.email : '',
    };
    setEvents(prevEvents => [newPost, ...prevEvents]);

    const newReel = {
      id: newId,
      src: newUrl,
      type: file.type,
      likes: 0,
      liked: false,
      uploadedBy: {
        name: currentUser?.name || 'Unknown User',
        email: currentUser?.email || '',
        profilePictureUrl: currentUser?.profilePictureUrl || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop'
      }
    };
    setReels(prevReels => [newReel, ...prevReels]);
  };

  const handleLike = async (reelId) => {
    try {
      const currentReel = reels.find(reel => reel.id === reelId);
      if (!currentReel) return;

      const endpoint = currentReel.liked ? 'unlike' : 'like';
      const response = await axios.put(`${API}/api/posts/${reelId}/${endpoint}`, {}, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      setReels(reels.map(reel => {
        if (reel.id === reelId) {
          return { 
            ...reel, 
            liked: response.data.liked, 
            likes: response.data.likes 
          };
        }
        return reel;
      }));
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
      setReels(reels.map(reel => {
        if (reel.id === reelId) {
          return { ...reel, liked: !reel.liked, likes: reel.liked ? reel.likes - 1 : reel.likes + 1 };
        }
        return reel;
      }));
    }
  };


  const toggleUploadForm = () => {
    setShowUploadForm(prev => !prev);
  };

  const closeUploadForm = () => {
    setShowUploadForm(false);
  };

  return (
    <AppContext.Provider value={{
      showUploadForm,
      events,
      reels,
      addEvent,
      addReel,
      handleLike,
      toggleUploadForm,
      closeUploadForm
    }}>
      {children}
    </AppContext.Provider>
  );
};
