import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../../api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromURL = searchParams.get('token');

  const [step, setStep] = useState(tokenFromURL ? 3 : 1); // 1: Email, 2: Choose method, 3: Reset password
  const [resetMethod, setResetMethod] = useState(null); // 'otp' or 'link'
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState(tokenFromURL || '');
  const [tempToken, setTempToken] = useState('');

  // Handle email submission
  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      toast.success(response.message || 'Reset email sent! Check your inbox.');
      setStep(2); // Move to method selection
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOTPChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Handle OTP paste
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOTP = pastedData.split('');
    while (newOTP.length < 6) newOTP.push('');
    setOTP(newOTP);
  };

  // Handle OTP backspace
  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOTP(email, otpString);
      setTempToken(response.tempToken);
      toast.success('OTP verified! Now set your new password.');
      setStep(3);
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = tempToken || resetToken;
      await authApi.resetPassword(token, newPassword);
      toast.success('Password reset successfully! You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      {/* Left Panel - Brand */}
      <div className="forgot-password-panel">
        <div 
          className="forgot-password-background"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80')"
          }}
        />
        <div className="forgot-password-brand-content">
          <h1 className="forgot-password-brand-title">Glamouré</h1>
          <p className="forgot-password-brand-tagline">Elevate Your Look, Effortlessly</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="forgot-password-form-panel">
        <div className="forgot-password-form-container">
          <button onClick={() => navigate('/login')} className="back-button">
            ← Back to Login
          </button>

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <div className="forgot-password-form-header">
                <h2 className="forgot-password-form-title">Forgot Password?</h2>
                <p className="forgot-password-subtitle">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleRequestReset}>
                <div className="forgot-password-form-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="forgot-password-form-input"
                    disabled={loading}
                  />
                </div>

                <div className="forgot-password-submit-container">
                  <button 
                    type="submit" 
                    className="forgot-password-submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Instructions'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 2: Choose Reset Method */}
          {step === 2 && (
            <>
              <div className="forgot-password-form-header">
                <h2 className="forgot-password-form-title">Choose Reset Method</h2>
                <p className="forgot-password-subtitle">
                  We've sent you an email with both options. Choose how you'd like to reset your password:
                </p>
              </div>

              <div className="reset-method-options">
                <button
                  className="reset-method-button"
                  onClick={() => {
                    setResetMethod('otp');
                    setStep(2.5);
                  }}
                >
                  <div className="method-icon">🔢</div>
                  <div className="method-title">Enter OTP Code</div>
                  <div className="method-description">
                    Enter the 6-digit code sent to your email
                  </div>
                </button>

                <div className="method-divider">OR</div>

                <button
                  className="reset-method-button"
                  onClick={() => {
                    toast.info('Please click the link in your email to reset your password');
                  }}
                >
                  <div className="method-icon">🔗</div>
                  <div className="method-title">Use Email Link</div>
                  <div className="method-description">
                    Click the reset link in your email
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Step 2.5: Enter OTP */}
          {step === 2.5 && (
            <>
              <div className="forgot-password-form-header">
                <h2 className="forgot-password-form-title">Enter OTP Code</h2>
                <p className="forgot-password-subtitle">
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP}>
                <div className="otp-input-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      onPaste={index === 0 ? handleOTPPaste : undefined}
                      className="otp-input"
                      disabled={loading}
                    />
                  ))}
                </div>

                <div className="forgot-password-submit-container">
                  <button 
                    type="submit" 
                    className="forgot-password-submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>

                <div className="resend-container">
                  <button
                    type="button"
                    className="resend-button"
                    onClick={() => setStep(1)}
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <div className="forgot-password-form-header">
                <h2 className="forgot-password-form-title">Set New Password</h2>
                <p className="forgot-password-subtitle">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleResetPassword}>
                <div className="forgot-password-form-group">
                  <div className="forgot-password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="forgot-password-form-input"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="forgot-password-password-toggle"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="forgot-password-form-group">
                  <div className="forgot-password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      className="forgot-password-form-input"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="forgot-password-password-toggle"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="forgot-password-submit-container">
                  <button 
                    type="submit" 
                    className="forgot-password-submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
