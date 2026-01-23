import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { getARPhotos, deleteARPhoto } from '../../api/arTryOnApi';
import './ARGallery.css';

const ARGallery = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await getARPhotos();
      if (response.success) {
        setPhotos(response.photos);
      }
    } catch (error) {
      console.error('Error fetching AR photos:', error);
      toast.error('Failed to load AR photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await deleteARPhoto(photoId);
      if (response.success) {
        setPhotos(photos.filter(p => p._id !== photoId));
        setSelectedPhoto(null);
        toast.success('Photo deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (photo) => {
    const link = document.createElement('a');
    link.download = `${photo.itemName}-ar-tryon.png`;
    link.href = photo.photoData;
    link.click();
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      logout();
    }
  };

  return (
    <div className="ar-gallery-page">
      {/* Navigation */}
      <nav className="ar-gallery-nav">
        <div className="ar-gallery-nav-content">
          <button onClick={() => navigate('/home')} className="back-btn-ar">
            ← Back
          </button>
          <button onClick={() => navigate('/home')} className="ar-gallery-logo">GLAMOURÉ</button>
          <div className="nav-right-ar">
            <div className="user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="user-name-btn-ar"
              >
                {user?.name}
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="currentColor"
                  style={{ marginLeft: '6px' }}
                >
                  <path d="M6 9L1 4h10z"/>
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown-menu-ar">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item-ar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/wardrobe');
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item-ar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M9 3v18"/>
                      <path d="M15 3v18"/>
                    </svg>
                    Wardrobe
                  </button>
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="logout-btn-ar">Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="ar-gallery-header">
        <h1>My AR Try-On Gallery</h1>
        <p>View all your virtual try-on photos</p>
      </div>

      {/* Gallery Content */}
      <div className="ar-gallery-content">
        {loading ? (
          <div className="ar-gallery-loading">
            <div className="spinner"></div>
            <p>Loading your photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="ar-gallery-empty">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
              <polyline points="17 2 12 7 7 2"/>
            </svg>
            <h2>No AR Photos Yet</h2>
            <p>Start trying on items to build your AR gallery</p>
            <button onClick={() => navigate('/collections')} className="explore-btn">
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="ar-gallery-grid">
            {photos.map((photo) => (
              <div 
                key={photo._id} 
                className="ar-photo-card"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.photoData} alt={photo.itemName} />
                <div className="ar-photo-overlay">
                  <h3>{photo.itemName}</h3>
                  <p>{new Date(photo.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content ar-photo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedPhoto.itemName}</h3>
              <button onClick={() => setSelectedPhoto(null)} className="modal-close">×</button>
            </div>
            <div className="ar-photo-detail">
              <img src={selectedPhoto.photoData} alt={selectedPhoto.itemName} />
              <div className="ar-photo-info">
                <p><strong>Category:</strong> {selectedPhoto.itemCategory}</p>
                <p><strong>Date:</strong> {new Date(selectedPhoto.createdAt).toLocaleString()}</p>
              </div>
              <div className="ar-photo-actions">
                <button 
                  onClick={() => handleDownload(selectedPhoto)} 
                  className="download-photo-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download
                </button>
                <button 
                  onClick={() => handleDelete(selectedPhoto._id)} 
                  className="delete-photo-btn"
                  disabled={deleting}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARGallery;
