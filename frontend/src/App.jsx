import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CombinedProvider from './context/CombinedProvider';
import AppLayout from './components/AppLayout';
import './App.css';

function App() {
  return (
    <Router>
      <CombinedProvider>
        <AppLayout />
      </CombinedProvider>
    </Router>
  );
}

export default App;
