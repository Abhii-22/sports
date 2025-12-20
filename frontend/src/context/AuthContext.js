import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Use the environment variable if it exists, otherwise use the current host with port 5004 for development
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5004';

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
    try {
      const res = await axios.post(`${API}/api/auth/signin`, { email, password });
      
      // Handle case where email is not verified
      if (res.data.requiresVerification) {
        return { 
          success: false, 
          requiresVerification: true,
          email: email
        };
      }
      
      // Handle successful login with token
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: 'Invalid response from server' 
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error.response?.data?.msg || error.response?.data?.message || 'Failed to sign in. Please try again.',
        requiresVerification: error.response?.data?.requiresVerification || false,
        email: error.response?.data?.email
      };
    }
  };

  const signOut = () => {
    setToken(null);
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const signUp = async (name, email, password) => {
    try {
      console.log('Sending signup request with:', { name, email, password: '***' });
      const res = await axios.post(`${API}/api/auth/signup`, { 
        name, 
        email, 
        password 
      });
      
      if (res.data && res.data.userId) {
        console.log('Signup successful, verification required:', { userId: res.data.userId });
        // Return the email for verification
        return { 
          success: true, 
          requiresVerification: true,
          email: email
        };
      } else {
        console.error('Unexpected signup response:', res.data);
        return { 
          success: false, 
          error: 'Unexpected response from server. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Sign up error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      let errorMessage = 'Failed to sign up. Please try again.';
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data) {
          if (error.response.data.msg) {
            errorMessage = error.response.data.msg;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            // Handle validation errors
            errorMessage = Object.values(error.response.data.errors)
              .map(err => typeof err === 'string' ? err : (err.msg || JSON.stringify(err)))
              .join('\n');
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
        }
        
        // Specific error for 400 Bad Request
        if (error.response.status === 400) {
          errorMessage = errorMessage || 'Invalid request. Please check your input.';
        }
        
        // Specific error for 409 Conflict (user already exists)
        if (error.response.status === 409) {
          errorMessage = 'An account with this email already exists.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        errorMessage = `Request error: ${error.message}`;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        status: error.response?.status
      };
    }
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

