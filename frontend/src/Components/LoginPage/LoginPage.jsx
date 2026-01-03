import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        console.log('Attempting login with:', { email, password: '***' });
        const response = await login({ email, password });
        console.log('Login successful, response:', response);
        // Show toast notification after successful login
        setTimeout(() => {
          toast.success(`Welcome back, ${response.user.name}! 🎉`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 100);
      } catch (error) {
        console.error('Login error details:', {
          error,
          message: error?.message,
          data: error?.data,
          response: error?.response
        });
        const errorMessage = error?.message || error?.error || 'Login failed. Please try again.';
        toast.error(errorMessage);
      }
    } else {
      console.log('Form validation failed:', errors);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel - Brand */}
      <div className="brand-panel">
        <div 
          className="brand-background"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80')"
          }}
        />
        <div className="brand-content">
          <h1 className="brand-title">Glamouré</h1>
          <p className="brand-tagline">Elevate Your Look, Effortlessly</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="form-panel">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">Login</h2>
          </div>

          <div>
            {/* OAuth Buttons */}
            <div className="oauth-buttons">
              <button onClick={handleGoogleLogin} className="oauth-button google-button">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Email"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <p className="error-message">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="submit-container">
              <button 
                onClick={handleSubmit} 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </div>

            {/* Links */}
            <div className="form-links">
              <button className="link-button" onClick={() => navigate('/forgot-password')}>
                Forgot your password?
              </button>
              <p className="signup-text">
                Don't have an account?{' '}
                <button className="signup-link" onClick={() => navigate('/signup')}>
                  Sign up!
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;