import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmail.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5004';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state or query params
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (location.search) {
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, [location]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/api/auth/verify-email`, {
        email,
        otp: otpValue
      });
      
      if (response.data.token) {
        // Store the token and redirect to home
        localStorage.setItem('token', response.data.token);
        // You might want to update the auth context here as well
        window.location.href = '/home';
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.response?.data?.msg || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      await axios.post(`${API}/api/auth/resend-verification`, {
        email
      });
      
      // Start cooldown timer (60 seconds)
      setResendCooldown(60);
      let countdown = 60;
      const timer = setInterval(() => {
        countdown--;
        setResendCooldown(countdown);
        if (countdown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      
      setError('A new verification code has been sent to your email.');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.msg || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-form">
        <h2>Verify Your Email</h2>
        <p className="verification-text">
          We've sent a 6-digit verification code to <strong>{email}</strong>.
          Please enter it below to verify your email address.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="otp-input-container">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleOtpChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-input"
                autoFocus={index === 0}
              />
            ))}
          </div>
          
          <button 
            type="submit" 
            className="verify-button"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <div className="resend-otp">
            <p>
              Didn't receive the code?{' '}
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="resend-button"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
