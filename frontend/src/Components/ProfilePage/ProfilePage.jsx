import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { authApi } from '../../api';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      // Update profile logic will be added
      const updatedUser = {
        ...user,
        name: formData.name
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Password change logic will be added
      toast.success('Password changed successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      logout();
      toast.success('Logged out successfully! 👋');
    }
  };

  const isGoogleUser = user?.authProvider === 'google';

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-content">
          <button onClick={() => navigate('/home')} className="back-to-home">
            ← Back to Home
          </button>
          <h1 className="profile-logo">Glamouré</h1>
          <button onClick={handleLogout} className="profile-logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="profile-container">
        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-info-header">
            <div className="profile-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
              {isGoogleUser && (
                <span className="auth-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connected with Google
                </span>
              )}
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="profile-section">
            <div className="section-header">
              <h3>Profile Information</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="edit-button">
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="form-input"
                />
                <small className="form-hint">Email cannot be changed</small>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(prev => ({
                        ...prev,
                        name: user?.name || ''
                      }));
                    }}
                    className="cancel-button"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password Section - Only for local users */}
          {!isGoogleUser && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Change Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                      className="form-input"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="password-toggle"
                    >
                      {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      className="form-input"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="password-toggle"
                    >
                      {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      className="form-input"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="password-toggle"
                    >
                      {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Account Info */}
          <div className="profile-section">
            <div className="section-header">
              <h3>Account Information</h3>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Account Type</span>
                <span className="info-value">
                  {isGoogleUser ? 'Google Account' : 'Email Account'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
