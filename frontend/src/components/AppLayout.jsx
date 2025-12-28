import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import LandingPage from './LandingPage';
import MainPage from './MainPage';
import SignIn from './SignIn';
import SignUp from './SignUp';
import VerifyEmail from './VerifyEmail';
import Events from './Events';
import UploadEventForm from './UploadEventForm';
import ChampionsPage from './ChampionsPage';
import Profile from './Profile';
import { useApp } from '../context/AppContext';

const AppLayout = () => {
  const location = useLocation();
  const { events, reels, addEvent, addReel, handleLike, closeUploadForm } = useApp();
  
  // Scroll to top on route change (except for reels page which has its own scroll)
  useEffect(() => {
    if (location.pathname !== '/reels') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [location.pathname]);
  
  const noNavRoutes = ['/', '/signin', '/signup', '/verify-email'];
  const shouldShowNav = !noNavRoutes.includes(location.pathname);

  return (
    <div className="App">
      {shouldShowNav && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<MainPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/events" element={<Events events={events} />} />
          <Route path="/upload" element={<UploadEventForm addEvent={addEvent} onClose={closeUploadForm} />} />
          <Route path="/reels" element={<ChampionsPage reels={reels} handleLike={handleLike} />} />
          <Route path="/profile" element={<Profile events={events} addReel={addReel} />} />
        </Routes>
      </main>
      {shouldShowNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
