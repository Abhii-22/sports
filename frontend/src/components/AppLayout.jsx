import React from 'react';
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
