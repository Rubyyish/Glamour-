import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './SigninPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const { register, loading } = useAuth();

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'medium';
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) return 'strong';
    return 'medium';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const userData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password
        };
        
        await register(userData);
        // Show toast notification after successful registration
        setTimeout(() => {
          toast.success(`🎉 Welcome to Glamouré, ${formData.firstName}! Your account has been created successfully!`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 100);
      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error?.message || error?.error || 'Registration failed. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="signin-container">
      {/* Left Panel - Brand */}
      <div className="signin-brand-panel">
        <div 
          className="signin-brand-background"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80')"
          }}
        />
        <div className="signin-brand-content">
          <h1 className="signin-brand-title">Glamouré</h1>
          <p className="signin-brand-tagline">Elevate Your Look, Effortlessly</p>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="signin-form-panel">
        <div className="signin-form-container">
          <div className="signin-form-header">
            <h2 className="signin-form-title">Sign Up</h2>
          </div>

          <div>
            {/* Name Fields */}
            <div className="signin-form-row">
              <div className="signin-form-group">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="First Name"
                  className={`signin-form-input ${errors.firstName ? 'error' : ''}`}
                />
                {errors.firstName && (
                  <p className="signin-error-message">{errors.firstName}</p>
                )}
              </div>

              <div className="signin-form-group">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Last Name"
                  className={`signin-form-input ${errors.lastName ? 'error' : ''}`}
                />
                {errors.lastName && (
                  <p className="signin-error-message">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div className="signin-form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Email"
                className={`signin-form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <p className="signin-error-message">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="signin-form-group">
              <div className="signin-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Password"
                  className={`signin-form-input ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="signin-password-toggle"
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
                <p className="signin-error-message">{errors.password}</p>
              )}
              {/* Password Strength Indicator */}
              {formData.password && !errors.password && (
                <div className="signin-password-strength">
                  <div className="signin-strength-bar">
                    <div className={`signin-strength-fill ${passwordStrength}`}></div>
                  </div>
                  <p className="signin-strength-text">
                    Password strength: {passwordStrength || 'weak'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="signin-form-group">
              <div className="signin-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Confirm Password"
                  className={`signin-form-input ${errors.confirmPassword ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="signin-password-toggle"
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <p className="signin-error-message">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="signin-terms">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label htmlFor="agreeToTerms">
                I agree to the{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()}>
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="signin-error-message" style={{ marginTop: '-0.5rem' }}>
                {errors.terms}
              </p>
            )}

            {/* Submit Button */}
            <div className="signin-submit-container">
              <button 
                onClick={handleSubmit} 
                className="signin-submit-button"
                disabled={!agreeToTerms || loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>

            {/* Divider */}
            <div className="signin-divider">
              <div className="signin-divider-line"></div>
              <span className="signin-divider-text">or sign up with</span>
              <div className="signin-divider-line"></div>
            </div>

            {/* Google Sign In Button */}
            <div className="signin-social-buttons">
              <button 
                className="signin-social-button signin-google-button"
                onClick={handleGoogleSignIn}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Login Link */}
            <div className="signin-form-links">
              <p className="signin-login-text">
                Already have an account?{' '}
                <button className="signin-login-link" onClick={() => navigate('/login')}>
                  Log in!
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;