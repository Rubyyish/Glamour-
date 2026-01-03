import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { getWardrobeById, addItemToWardrobe, removeItemFromWardrobe, updateItemInWardrobe, toggleItemFavorite } from '../../api/wardrobeApi';
import './WardrobeDetail.css';

const WardrobeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();
  const [wardrobe, setWardrobe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    category: 'Other',
    colors: [],
    tags: [],
    brand: '',
    size: '',
    visibility: 'Private',
    price: '',
    datePurchased: '',
    season: 'All Season',
    stylingTags: {
      occasion: [],
      mood: []
    },
    status: 'Keep',
    comments: ''
  });

  const [colorInput, setColorInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [occasionInput, setOccasionInput] = useState('');
  const [moodInput, setMoodInput] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    season: 'All',
    status: 'All',
    brand: 'All'
  });

  useEffect(() => {
    fetchWardrobe();
  }, [id]);

  useEffect(() => {
    // Close filter dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWardrobe = async () => {
    try {
      setLoading(true);
      const response = await getWardrobeById(id);
      if (response.success) {
        setWardrobe(response.wardrobe);
      }
    } catch (error) {
      console.error('Error fetching wardrobe:', error);
      toast.error('Failed to load wardrobe');
      navigate('/wardrobe');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll use a data URL. In production, upload to cloud storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addArrayItem = (field, value, setter) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()]
      });
      setter('');
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const addStylingTag = (type, value, setter) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        stylingTags: {
          ...formData.stylingTags,
          [type]: [...formData.stylingTags[type], value.trim()]
        }
      });
      setter('');
    }
  };

  const removeStylingTag = (type, index) => {
    setFormData({
      ...formData,
      stylingTags: {
        ...formData.stylingTags,
        [type]: formData.stylingTags[type].filter((_, i) => i !== index)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.imageUrl) {
      toast.error('Name and image are required');
      return;
    }

    try {
      const response = await addItemToWardrobe(id, formData);
      
      if (response.success) {
        setWardrobe(response.wardrobe);
        resetForm();
        setShowAddModal(false);
        toast.success('Item added successfully!');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    const confirmDelete = window.confirm(`Remove "${itemName}" from this wardrobe?`);
    if (confirmDelete) {
      try {
        const response = await removeItemFromWardrobe(id, itemId);
        
        if (response.success) {
          setWardrobe(response.wardrobe);
          toast.success('Item removed');
        }
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item');
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      imageUrl: item.imageUrl,
      category: item.category || 'Other',
      colors: item.colors || [],
      tags: item.tags || [],
      brand: item.brand || '',
      size: item.size || '',
      visibility: item.visibility || 'Private',
      price: item.price || '',
      datePurchased: item.datePurchased ? new Date(item.datePurchased).toISOString().split('T')[0] : '',
      season: item.season || 'All Season',
      stylingTags: {
        occasion: item.stylingTags?.occasion || [],
        mood: item.stylingTags?.mood || []
      },
      status: item.status || 'Keep',
      comments: item.comments || ''
    });
    setImagePreview(item.imageUrl);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.imageUrl) {
      toast.error('Name and image are required');
      return;
    }

    try {
      const response = await updateItemInWardrobe(id, editingItem._id, formData);
      
      if (response.success) {
        setWardrobe(response.wardrobe);
        resetForm();
        setShowEditModal(false);
        setEditingItem(null);
        toast.success('Item updated successfully!');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleToggleFavorite = async (itemId, e) => {
    e.stopPropagation();
    try {
      const response = await toggleItemFavorite(id, itemId);
      
      if (response.success) {
        setWardrobe(response.wardrobe);
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  // Filter and search logic
  const getFilteredItems = () => {
    if (!wardrobe?.items) return [];

    let filtered = [...wardrobe.items];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(item => item.isFavorite);
    }

    // Category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Season filter
    if (filters.season !== 'All') {
      filtered = filtered.filter(item => item.season === filters.season);
    }

    // Status filter
    if (filters.status !== 'All') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Brand filter
    if (filters.brand !== 'All') {
      filtered = filtered.filter(item => item.brand === filters.brand);
    }

    return filtered;
  };

  const getUniqueBrands = () => {
    if (!wardrobe?.items) return [];
    const brands = wardrobe.items
      .map(item => item.brand)
      .filter(brand => brand && brand.trim());
    return [...new Set(brands)].sort();
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setShowFavoritesOnly(false);
    setFilters({
      category: 'All',
      season: 'All',
      status: 'All',
      brand: 'All'
    });
  };

  const hasActiveFilters = () => {
    return searchQuery.trim() || 
           showFavoritesOnly || 
           filters.category !== 'All' || 
           filters.season !== 'All' || 
           filters.status !== 'All' || 
           filters.brand !== 'All';
  };

  const filteredItems = getFilteredItems();

  const resetForm = () => {
    setFormData({
      name: '',
      imageUrl: '',
      category: 'Other',
      colors: [],
      tags: [],
      brand: '',
      size: '',
      visibility: 'Private',
      price: '',
      datePurchased: '',
      season: 'All Season',
      stylingTags: {
        occasion: [],
        mood: []
      },
      status: 'Keep',
      comments: ''
    });
    setImagePreview(null);
    setColorInput('');
    setTagInput('');
    setOccasionInput('');
    setMoodInput('');
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="wardrobe-detail-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wardrobe-detail-page">
      {/* Header */}
      <header className="wardrobe-header">
        <div className="wardrobe-header-content">
          <button onClick={() => navigate('/wardrobe')} className="back-to-home">
            ← Back to Wardrobes
          </button>
          <h1 className="wardrobe-logo">Glamouré</h1>
          <button onClick={handleLogout} className="wardrobe-logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="wardrobe-detail-container">
        <div className="wardrobe-detail-header">
          <div>
            <h2 className="wardrobe-detail-title">{wardrobe?.name}</h2>
            <p className="wardrobe-detail-subtitle">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              {wardrobe?.items?.length !== filteredItems.length && ` of ${wardrobe?.items?.length} total`}
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="add-item-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Item
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, brand, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search">
                ×
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`favorites-filter-btn ${showFavoritesOnly ? 'active' : ''}`}
            title={showFavoritesOnly ? 'Show all items' : 'Show favorites only'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {showFavoritesOnly && <span className="filter-badge">On</span>}
          </button>

          <div className="filter-dropdown-container">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="filter-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filters
              {hasActiveFilters() && <span className="filter-badge">{Object.values(filters).filter(v => v !== 'All').length}</span>}
            </button>

            {showFilterDropdown && (
              <div className="filter-dropdown">
                <div className="filter-dropdown-header">
                  <h4>Filter Items</h4>
                  {hasActiveFilters() && (
                    <button onClick={clearAllFilters} className="clear-filters-btn">
                      Clear All
                    </button>
                  )}
                </div>

                <div className="filter-group">
                  <label>Category</label>
                  <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                    <option value="All">All Categories</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Season</label>
                  <select value={filters.season} onChange={(e) => setFilters({...filters, season: e.target.value})}>
                    <option value="All">All Seasons</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                    <option value="All Season">All Season</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Status</label>
                  <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="All">All Status</option>
                    <option value="Keep">Keep</option>
                    <option value="Swap">Swap</option>
                    <option value="Donate">Donate</option>
                    <option value="Resell">Resell</option>
                  </select>
                </div>

                {getUniqueBrands().length > 0 && (
                  <div className="filter-group">
                    <label>Brand</label>
                    <select value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})}>
                      <option value="All">All Brands</option>
                      {getUniqueBrands().map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            {wardrobe?.items?.length === 0 ? (
              <>
                <div className="empty-icon">👔</div>
                <h3>No items yet</h3>
                <p>Start adding outfits to your wardrobe</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="create-first-btn"
                >
                  Add Your First Item
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">🔍</div>
                <h3>No items found</h3>
                <p>Try adjusting your search or filters</p>
                <button onClick={clearAllFilters} className="create-first-btn">
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <div key={item._id} className="item-card" onClick={() => setSelectedItem(item)}>
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.name} />
                  <button
                    onClick={(e) => handleToggleFavorite(item._id, e)}
                    className={`favorite-btn ${item.isFavorite ? 'active' : ''}`}
                    title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={item.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <div className="item-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item);
                      }}
                      className="edit-item-btn"
                      title="Edit item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item._id, item.name);
                      }}
                      className="delete-item-btn"
                      title="Remove item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  {item.brand && <p className="item-brand">{item.brand}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="modal-content add-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Item</h3>
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="add-item-form">
              <div className="form-scroll">
                {/* Image Upload */}
                <div className="form-group">
                  <label>Image *</label>
                  <div className="image-upload-area">
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button type="button" onClick={() => { setImagePreview(null); setFormData({...formData, imageUrl: ''}); }} className="remove-image">×</button>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <span>Click to upload image</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Blue Denim Jacket"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g., Zara, H&M"
                    />
                  </div>
                  <div className="form-group">
                    <label>Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                      placeholder="e.g., M, 32, L"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="form-group">
                  <label>Colors</label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('colors', colorInput, setColorInput))}
                      placeholder="Add color and press Enter"
                    />
                    <button type="button" onClick={() => addArrayItem('colors', colorInput, setColorInput)} className="add-tag-btn">+</button>
                  </div>
                  <div className="tags-list">
                    {formData.colors.map((color, index) => (
                      <span key={index} className="tag">
                        {color}
                        <button type="button" onClick={() => removeArrayItem('colors', index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="form-group">
                  <label>Tags</label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('tags', tagInput, setTagInput))}
                      placeholder="Add tag and press Enter"
                    />
                    <button type="button" onClick={() => addArrayItem('tags', tagInput, setTagInput)} className="add-tag-btn">+</button>
                  </div>
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button type="button" onClick={() => removeArrayItem('tags', index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date Purchased</label>
                    <input
                      type="date"
                      value={formData.datePurchased}
                      onChange={(e) => setFormData({...formData, datePurchased: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Season</label>
                    <select value={formData.season} onChange={(e) => setFormData({...formData, season: e.target.value})}>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                      <option value="Winter">Winter</option>
                      <option value="All Season">All Season</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Visibility</label>
                    <select value={formData.visibility} onChange={(e) => setFormData({...formData, visibility: e.target.value})}>
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                      <option value="Friends">Friends</option>
                    </select>
                  </div>
                </div>

                {/* Styling Tags */}
                <div className="form-group">
                  <label>Occasion</label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={occasionInput}
                      onChange={(e) => setOccasionInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStylingTag('occasion', occasionInput, setOccasionInput))}
                      placeholder="e.g., Casual, Formal, Party"
                    />
                    <button type="button" onClick={() => addStylingTag('occasion', occasionInput, setOccasionInput)} className="add-tag-btn">+</button>
                  </div>
                  <div className="tags-list">
                    {formData.stylingTags.occasion.map((occ, index) => (
                      <span key={index} className="tag">
                        {occ}
                        <button type="button" onClick={() => removeStylingTag('occasion', index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Mood</label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={moodInput}
                      onChange={(e) => setMoodInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStylingTag('mood', moodInput, setMoodInput))}
                      placeholder="e.g., Confident, Relaxed, Edgy"
                    />
                    <button type="button" onClick={() => addStylingTag('mood', moodInput, setMoodInput)} className="add-tag-btn">+</button>
                  </div>
                  <div className="tags-list">
                    {formData.stylingTags.mood.map((mood, index) => (
                      <span key={index} className="tag">
                        {mood}
                        <button type="button" onClick={() => removeStylingTag('mood', index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Keep">Keep</option>
                    <option value="Swap">Swap</option>
                    <option value="Donate">Donate</option>
                    <option value="Resell">Resell</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Comments</label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    placeholder="Add any notes about this item..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="modal-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="modal-create-btn">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div className="modal-content add-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Item</h3>
              <button 
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateItem} className="add-item-form">
              <div className="form-scroll">
                {/* Image Upload */}
                <div className="form-group">
                  <label>Image *</label>
                  <div className="image-upload-area">
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button type="button" onClick={() => { setImagePreview(null); setFormData({...formData, imageUrl: ''}); }} className="remove-image">×</button>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <span>Click to upload image</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Blue Denim Jacket"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g., Zara, H&M"
                    />
                  </div>
                  <div className="form-group">
                    <label>Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                      placeholder="e.g., M, 32, L"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="form-group">
                  <label>Colors</label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('colors', colorInput, setColorInput))}
                      placeholder="Add color and press Enter"
                    />
                    <button type="button" onClick={() => addArrayItem('colors', colorInput, setColorInput)} className="add-tag-btn">+</button>
                  </div>
                  <div className="tags-list">
                    {formData.colors.map((color, index) => (
                      <span key={index} className="tag">
                        {color}
                        <button type="button" onClick={() => removeArrayItem('colors', index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="form-group">
                  <label>Tags</label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('tags', tagInput, setTagInput))}
                      placeholder="Add tag and press Enter"
                    />
                    <button type="button" onClick={() => addArrayItem('tags', tagInput, setTagInput)} className="add-tag-btn">+</button>
                  </div>
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button type="button" onClick={() => removeArrayItem('tags', index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date Purchased</label>
                    <input
                      type="date"
                      value={formData.datePurchased}
                      onChange={(e) => setFormData({...formData, datePurchased: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Season</label>
                    <select value={formData.season} onChange={(e) => setFormData({...formData, season: e.target.value})}>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                      <option value="Winter">Winter</option>
                      <option value="All Season">All Season</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Visibility</label>
                    <select value={formData.visibility} onChange={(e) => setFormData({...formData, visibility: e.target.value})}>
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                      <option value="Friends">Friends</option>
                    </select>
                  </div>
                </div>

                {/* Styling Tags */}
                <div className="form-group">
                  <label>Occasion</label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={occasionInput}
                      onChange={(e) => setOccasionInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStylingTag('occasion', occasionInput, setOccasionInput))}
                      placeholder="e.g., Casual, Formal, Party"
                    />
                    <button type="button" onClick={() => addStylingTag('occasion', occasionInput, setOccasionInput)} className="add-tag-btn">+</button>
                  </div>
                  <div className="tags-list">
                    {formData.stylingTags.occasion.map((occ, index) => (
                      <span key={index} className="tag">
                        {occ}
                        <button type="button" onClick={() => removeStylingTag('occasion', index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Mood</label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={moodInput}
                      onChange={(e) => setMoodInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStylingTag('mood', moodInput, setMoodInput))}
                      placeholder="e.g., Confident, Relaxed, Edgy"
                    />
                    <button type="button" onClick={() => addStylingTag('mood', moodInput, setMoodInput)} className="add-tag-btn">+</button>
                  </div>
                  <div className="tags-list">
                    {formData.stylingTags.mood.map((mood, index) => (
                      <span key={index} className="tag">
                        {mood}
                        <button type="button" onClick={() => removeStylingTag('mood', index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Keep">Keep</option>
                    <option value="Swap">Swap</option>
                    <option value="Donate">Donate</option>
                    <option value="Resell">Resell</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Comments</label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    placeholder="Add any notes about this item..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="modal-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="modal-create-btn">
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content item-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.name}</h3>
              <button onClick={() => setSelectedItem(null)} className="modal-close">×</button>
            </div>
            <div className="item-detail-content">
              <div className="item-detail-image">
                <img src={selectedItem.imageUrl} alt={selectedItem.name} />
              </div>
              <div className="item-detail-info">
                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{selectedItem.category}</span>
                </div>
                {selectedItem.brand && (
                  <div className="info-row">
                    <span className="info-label">Brand:</span>
                    <span className="info-value">{selectedItem.brand}</span>
                  </div>
                )}
                {selectedItem.size && (
                  <div className="info-row">
                    <span className="info-label">Size:</span>
                    <span className="info-value">{selectedItem.size}</span>
                  </div>
                )}
                {selectedItem.colors?.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Colors:</span>
                    <div className="tags-list">
                      {selectedItem.colors.map((color, i) => (
                        <span key={i} className="tag">{color}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItem.tags?.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Tags:</span>
                    <div className="tags-list">
                      {selectedItem.tags.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItem.price > 0 && (
                  <div className="info-row">
                    <span className="info-label">Price:</span>
                    <span className="info-value">${selectedItem.price}</span>
                  </div>
                )}
                {selectedItem.datePurchased && (
                  <div className="info-row">
                    <span className="info-label">Purchased:</span>
                    <span className="info-value">{new Date(selectedItem.datePurchased).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Season:</span>
                  <span className="info-value">{selectedItem.season}</span>
                </div>
                {selectedItem.stylingTags?.occasion?.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Occasion:</span>
                    <div className="tags-list">
                      {selectedItem.stylingTags.occasion.map((occ, i) => (
                        <span key={i} className="tag">{occ}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItem.stylingTags?.mood?.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Mood:</span>
                    <div className="tags-list">
                      {selectedItem.stylingTags.mood.map((mood, i) => (
                        <span key={i} className="tag">{mood}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge status-${selectedItem.status.toLowerCase()}`}>{selectedItem.status}</span>
                </div>
                {selectedItem.comments && (
                  <div className="info-row">
                    <span className="info-label">Comments:</span>
                    <p className="info-value">{selectedItem.comments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardrobeDetail;
