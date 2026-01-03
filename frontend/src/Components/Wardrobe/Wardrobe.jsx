import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { getAllWardrobes, createWardrobe, deleteWardrobe } from '../../api/wardrobeApi';
import './Wardrobe.css';

const Wardrobe = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [wardrobes, setWardrobes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWardrobeName, setNewWardrobeName] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch wardrobes on component mount
  useEffect(() => {
    fetchWardrobes();
  }, []);

  const fetchWardrobes = async () => {
    try {
      setLoading(true);
      const response = await getAllWardrobes();
      if (response.success) {
        setWardrobes(response.wardrobes);
      }
    } catch (error) {
      console.error('Error fetching wardrobes:', error);
      toast.error('Failed to load wardrobes');
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

  const handleCreateWardrobe = async () => {
    if (!newWardrobeName.trim()) {
      toast.error('Please enter a wardrobe name');
      return;
    }

    try {
      const response = await createWardrobe({ name: newWardrobeName });
      
      if (response.success) {
        setWardrobes([response.wardrobe, ...wardrobes]);
        setNewWardrobeName('');
        setShowCreateModal(false);
        toast.success(`Wardrobe "${newWardrobeName}" created!`);
      }
    } catch (error) {
      console.error('Error creating wardrobe:', error);
      toast.error('Failed to create wardrobe');
    }
  };

  const handleDeleteWardrobe = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (confirmDelete) {
      try {
        const response = await deleteWardrobe(id);
        
        if (response.success) {
          setWardrobes(wardrobes.filter(w => w._id !== id));
          toast.success('Wardrobe deleted');
        }
      } catch (error) {
        console.error('Error deleting wardrobe:', error);
        toast.error('Failed to delete wardrobe');
      }
    }
  };

  return (
    <div className="wardrobe-page">
      {/* Header */}
      <header className="wardrobe-header">
        <div className="wardrobe-header-content">
          <button onClick={() => navigate('/home')} className="back-to-home">
            ← Back to Home
          </button>
          <h1 className="wardrobe-logo">Glamouré</h1>
          <button onClick={handleLogout} className="wardrobe-logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="wardrobe-container">
        <div className="wardrobe-header-section">
          <div>
            <h2 className="wardrobe-title">My Wardrobes</h2>
            <p className="wardrobe-subtitle">Organize your fashion collections</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="create-wardrobe-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Wardrobe
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading wardrobes...</p>
          </div>
        ) : (
          <>
            {/* Wardrobes Grid */}
            {wardrobes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👗</div>
                <h3>No wardrobes yet</h3>
                <p>Create your first wardrobe to start organizing your fashion items</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="create-first-btn"
                >
                  Create Your First Wardrobe
                </button>
              </div>
            ) : (
              <div className="wardrobes-grid">
                {wardrobes.map((wardrobe) => (
                  <div key={wardrobe._id} className="wardrobe-card">
                    <div className="wardrobe-card-header">
                      <h3>{wardrobe.name}</h3>
                      <button
                        onClick={() => handleDeleteWardrobe(wardrobe._id, wardrobe.name)}
                        className="delete-wardrobe-btn"
                        title="Delete wardrobe"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                    <div className="wardrobe-card-body">
                      <div className="wardrobe-stats">
                        <span className="stat-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7h-9"/>
                            <path d="M14 17H5"/>
                            <circle cx="17" cy="17" r="3"/>
                            <circle cx="7" cy="7" r="3"/>
                          </svg>
                          {wardrobe.items.length} items
                        </span>
                        <span className="stat-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {new Date(wardrobe.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/wardrobe/${wardrobe._id}`)}
                      className="view-wardrobe-btn"
                    >
                      View Wardrobe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Wardrobe Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Wardrobe</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <label>Wardrobe Name</label>
              <input
                type="text"
                value={newWardrobeName}
                onChange={(e) => setNewWardrobeName(e.target.value)}
                placeholder="e.g., Summer Collection, Work Outfits"
                className="modal-input"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWardrobe()}
              />
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateWardrobe}
                className="modal-create-btn"
              >
                Create Wardrobe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wardrobe;
