import React from 'react';
import { useApp } from '../context/AppContext';
import Home from './Home';
import About from './About';
import Feedback from './Feedback';

const MainPage = () => {
  const { showUploadForm, addEvent, closeUploadForm } = useApp();
  
  return (
    <>
      <Home showUploadForm={showUploadForm} addEvent={addEvent} onClose={closeUploadForm} />
      <About />
      <Feedback />
    </>
  );
};

export default MainPage;
