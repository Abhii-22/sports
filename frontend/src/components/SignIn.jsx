import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignIn.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setIsLoading(true);
      const result = await signIn(email, password);
      
      if (result.requiresVerification) {
        // Redirect to verification page with email
        navigate('/verify-email', { 
          state: { email: result.email || email },
          replace: true
        });
        return;
      }
      
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error || 'Failed to sign in. Please try again.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    // Implement Google Sign In
    console.log('Google sign in clicked');
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="username"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                Signing In...
              </>
            ) : 'Sign In'}
          </button>
          
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          
          <div className="social-login">
            <button 
              type="button" 
              className="social-button" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.28426 53.749 C -8.52426 55.229 -9.21651 56.479 -10.0808 57.329 L -10.1088 57.357 L -4.39875 62.098 L -4.152 62.098 C -1.2735 59.349 0.1785 55.539 0.1785 51.509 C 0.1785 50.809 0.1385 50.119 0.0585 49.439 L -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.8045 62.159 -6.7135 60.298 L -10.5925 57.088 C -11.6935 57.928 -13.1535 58.479 -14.754 58.479 C -17.884 58.479 -20.5635 56.389 -21.5035 53.529 L -25.8525 53.529 L -25.8525 56.439 C -23.943 60.399 -19.8139 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.5035 53.529 C -21.8135 52.619 -21.9835 51.649 -21.9835 50.649 C -21.9835 49.649 -21.8135 48.679 -21.5035 47.769 L -21.5035 44.859 L -25.8525 44.859 C -26.9125 46.959 -27.5035 49.299 -27.5035 51.649 C -27.5035 53.999 -26.9125 56.339 -25.8525 58.439 L -21.5035 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 44.819 C -12.9845 44.819 -11.4035 45.389 -10.0325 46.479 L -6.6825 43.129 C -8.9535 41.089 -11.6835 39.979 -14.754 39.979 C -19.8139 39.979 -23.943 42.819 -25.8525 46.779 L -21.5035 49.689 C -20.5635 46.829 -17.884 44.739 -14.754 44.739"/>
                </g>
              </svg>
              Continue with Google
            </button>
          </div>
        </form>
        
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;