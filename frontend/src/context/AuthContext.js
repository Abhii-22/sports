import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5004'; // Force API URL to port 5004

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await axios.get(`${API}/api/profile/me`);
          setCurrentUser(res.data);
        } catch (err) {
          console.error('Failed to load user', err);
          signOut();
        }
      } else {
        delete axios.defaults.headers.common['x-auth-token'];
      }
    };
    loadUser();
  }, [token, API]);

  const signIn = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/signin`, { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };

  const signOut = () => {
    setToken(null);
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const signUp = async (name, email, password) => {
    const res = await axios.post(`${API}/api/auth/signup`, { name, email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };

  const value = {
    currentUser,
    token,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

