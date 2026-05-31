import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { getAllWardrobes, addItemToWardrobe } from '../../api/wardrobeApi';
import { getFavorites, toggleFavorite } from '../../api/favoritesApi';
import { handleImageError, getImageWithFallback } from '../../utils/imagePlaceholder';
import LensStudioAR from '../LensStudioAR/LensStudioAR';
import './Collections.css';

const Collections = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showARTryOn, setShowARTryOn] = useState(false);
  const [arItem, setArItem] = useState(null);
  const [showWardrobeSelector, setShowWardrobeSelector] = useState(false);
  const [wardrobes, setWardrobes] = useState([]);
  const [loadingWardrobes, setLoadingWardrobes] = useState(false);
  const [addingToWardrobe, setAddingToWardrobe] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    // Scroll the fullpage container to top when new item is selected
    setTimeout(() => {
      const fullpageContent = document.querySelector('.item-detail-fullpage-content');
      if (fullpageContent) {
        fullpageContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  };

  useLayoutEffect(() => {
    // Scroll to top instantly when component mounts
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (selectedItem || showWardrobeSelector) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem, showWardrobeSelector]);

  useEffect(() => {
    fetchWardrobes();
    fetchFavorites();
  }, []);

  const fetchWardrobes = async () => {
    try {
      setLoadingWardrobes(true);
      const response = await getAllWardrobes();
      if (response.success) {
        setWardrobes(response.wardrobes);
      }
    } catch (error) {
      console.error('Error fetching wardrobes:', error);
    } finally {
      setLoadingWardrobes(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await getFavorites();
      if (response.success) {
        setFavorites(response.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Don't show error for favorites - it's not critical
      // Just log it and continue
      if (error.response?.status === 401) {
        console.warn('Auth required for favorites');
      }
    }
  };

  const handleToggleFavorite = async (item, e) => {
    e.stopPropagation();
    try {
      const itemData = {
        itemId: item.id.toString(),
        name: item.name,
        imageUrl: item.image,
        category: item.category,
        price: item.price,
        brand: item.brand || '',
        description: item.description || ''
      };

      const response = await toggleFavorite(itemData);
      
      if (response.success) {
        setFavorites(response.favorites || []);
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const isFavorite = (itemId) => {
    return favorites.some(fav => fav.itemId === itemId.toString());
  };

  const handleAddToWardrobe = async (wardrobeId) => {
    if (!selectedItem) return;

    try {
      setAddingToWardrobe(true);
      
      // Convert the collection item to wardrobe item format
      const itemData = {
        name: selectedItem.name,
        imageUrl: selectedItem.image,
        category: selectedItem.category,
        brand: selectedItem.brand || '',
        size: selectedItem.size || '',
        colors: selectedItem.colors || [],
        tags: selectedItem.tags || [],
        season: selectedItem.season || 'All Season',
        price: selectedItem.price.replace('$', ''),
        comments: selectedItem.description || ''
      };

      const response = await addItemToWardrobe(wardrobeId, itemData);
      
      if (response.success) {
        toast.success(`Added "${selectedItem.name}" to wardrobe!`);
        setShowWardrobeSelector(false);
      }
    } catch (error) {
      console.error('Error adding to wardrobe:', error);
      toast.error('Failed to add item to wardrobe');
    } finally {
      setAddingToWardrobe(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedItem) return;

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to make a purchase');
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemName: selectedItem.name,
          itemPrice: selectedItem.price,
          itemImage: selectedItem.image.startsWith('http') ? selectedItem.image : `${window.location.origin}${selectedItem.image}`,
          itemCategory: selectedItem.category,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`);
    
    if (confirmDelete) {
      // For now, just show a success message
      // In a real app, you would call an API to delete the item
      toast.success(`"${selectedItem.name}" has been deleted`);
      setSelectedItem(null);
      
      // TODO: Implement actual delete API call
      // Example:
      // await deleteCollectionItem(selectedItem.id);
    }
  };

  const handleDeleteCard = (product, e) => {
    e.stopPropagation();
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`);
    
    if (confirmDelete) {
      toast.success(`"${product.name}" has been deleted`);
      
      // TODO: Implement actual delete API call and remove from state
      // Example:
      // await deleteCollectionItem(product.id);
      // setFeaturedProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      logout();
    }
  };

  const featuredProducts = [
    {
      id: 1,
      name: 'SHEARLING COAT',
      image: '/images/shearling_coat_display.jpg',
      price: '$45',
      category: 'Outerwear',
      brand: 'Vintage',
      size: 'M',
      colors: ['Brown', 'Tan'],
      season: 'Winter',
      condition: 'Excellent',
      description: 'Vintage shearling coat in excellent condition. Warm and stylish, perfect for cold weather.',
      tags: ['Vintage', 'Winter', 'Cozy']
    },
    {
      id: 2,
      name: 'DENIM MAXI DRESS',
      image: '/images/demin_maxi_dress_disply.jpg',
      price: '$32',
      category: 'Dresses',
      brand: 'Levi\'s',
      size: 'S',
      colors: ['Blue', 'Denim'],
      season: 'All Season',
      condition: 'Very Good',
      description: 'Classic denim maxi dress with button-down front. Versatile piece that works for any season.',
      tags: ['Denim', 'Casual', 'Versatile']
    },
    {
      id: 3,
      name: 'HOLLY DAY WAISTCOAT',
      image: 'images/holly_day_waistcoat_display.jpg',
      price: '$28',
      category: 'Tops',
      brand: 'H&M',
      size: 'L',
      colors: ['Gray', 'Charcoal'],
      season: 'All Season',
      condition: 'Good',
      description: 'Tailored waistcoat perfect for layering. Great for both casual and formal occasions.',
      tags: ['Formal', 'Layering', 'Classic']
    },
    {
      id: 4,
      name: 'VINTAGE LEATHER JACKET',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      price: '$65',
      category: 'Outerwear',
      brand: 'Vintage',
      size: 'M',
      colors: ['Black', 'Leather'],
      season: 'Fall',
      condition: 'Excellent',
      description: 'Classic black leather jacket with timeless appeal. Perfect for adding edge to any outfit.',
      tags: ['Vintage', 'Leather', 'Edgy']
    },
    {
      id: 5,
      name: 'FLORAL MIDI SKIRT',
      image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80',
      price: '$24',
      category: 'Bottoms',
      brand: 'Zara',
      size: 'M',
      colors: ['Floral', 'Multi'],
      season: 'Spring',
      condition: 'Very Good',
      description: 'Beautiful floral midi skirt with flowing silhouette. Perfect for spring and summer occasions.',
      tags: ['Floral', 'Feminine', 'Spring']
    },
    {
      id: 6,
      name: 'CASHMERE SWEATER',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
      price: '$38',
      category: 'Tops',
      brand: 'J.Crew',
      size: 'S',
      colors: ['Cream', 'Beige'],
      season: 'Winter',
      condition: 'Excellent',
      description: 'Luxurious cashmere sweater in pristine condition. Soft, warm, and incredibly comfortable.',
      tags: ['Cashmere', 'Luxury', 'Cozy']
    },
    {
      id: 7,
      name: 'HIGH-WAIST TROUSERS',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80',
      price: '$29',
      category: 'Bottoms',
      brand: 'Mango',
      size: 'M',
      colors: ['Black', 'Navy'],
      season: 'All Season',
      condition: 'Very Good',
      description: 'Tailored high-waist trousers with elegant fit. Versatile piece for work or evening wear.',
      tags: ['Professional', 'Tailored', 'Classic']
    },
    {
      id: 8,
      name: 'SILK BLOUSE',
      image: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&q=80',
      price: '$35',
      category: 'Tops',
      brand: 'Massimo Dutti',
      size: 'S',
      colors: ['White', 'Ivory'],
      season: 'All Season',
      condition: 'Excellent',
      description: 'Elegant silk blouse with delicate draping. Perfect for both professional and casual settings.',
      tags: ['Silk', 'Elegant', 'Versatile']
    },
    {
      id: 9,
      name: 'WOOL PEACOAT',
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
      price: '$52',
      category: 'Outerwear',
      brand: 'Burberry',
      size: 'L',
      colors: ['Navy', 'Blue'],
      season: 'Winter',
      condition: 'Very Good',
      description: 'Classic wool peacoat with double-breasted design. Timeless piece that never goes out of style.',
      tags: ['Classic', 'Wool', 'Timeless']
    }
  ];

  const categoryCards = [
    {
      id: 1,
      title: 'Trousers',
      description: 'Discover our curated selection of pre-loved trousers, each piece carefully chosen for quality and style. From tailored fits to relaxed silhouettes.',
      image: 'images/trousers_display.jpg',
      buttonText: 'BROWSE TROUSERS',
      link: '/category/trousers'
    },
    {
      id: 2,
      title: 'Shirts',
      description: 'Explore our collection of vintage and contemporary shirts, each with its own story. Perfect for any occasion, from casual to formal.',
      image: 'images/shirts_display.jpg',
      buttonText: 'BROWSE SHIRTS',
      link: '/category/shirts'
    }
  ];

  const weeksFavorites = [
    {
      id: 1,
      image: 'images/TWF_vintage_display.jpg'
    },
    {
      id: 2,
      image: 'images/TWF_darkacademia_display.jpg'
    },
    {
      id: 3,
      image: 'images/TWF_desi_display.png'
    }
  ];

  return (
    <div className="collections-page">
      {/* Navigation */}
      <nav className="collections-nav">
        <div className="collections-nav-content">
          <button onClick={() => navigate('/home')} className="back-to-home-collections">
            ← Back
          </button>
          <button onClick={() => navigate('/home')} className="collections-logo">GLAMOURÉ</button>
          <div className="nav-right-collections">
            <div className="user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="user-name-btn-collections"
              >
                {user?.name}
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="currentColor"
                  style={{ marginLeft: '6px', transition: 'transform 0.3s' }}
                  className={showUserMenu ? 'rotate-180' : ''}
                >
                  <path d="M6 9L1 4h10z"/>
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown-menu-collections">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item-collections"
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
                    className="dropdown-item-collections"
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
            <button onClick={handleLogout} className="logout-btn-collections">Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="collections-hero">
        <div className="collections-hero-image">
          <img src="/images/newseason.jpg" alt="New Season" />
        </div>
        <div className="collections-hero-text">
          <p className="collections-hero-subtitle">IT'S TIME FOR A</p>
          <h1 className="collections-hero-title">
            NEW<br/>
            SEASON
          </h1>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="featured-products-section">
        <div className="featured-products-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="featured-product-card" onClick={() => handleItemClick(product)}>
              <div className="featured-product-image">
                <img 
                  src={getImageWithFallback(product.image, 'clothing')} 
                  alt={product.name}
                  onError={(e) => handleImageError(e, 'clothing')}
                />
                <button 
                  className="delete-card-btn"
                  onClick={(e) => handleDeleteCard(product, e)}
                  aria-label="Delete item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
                <button 
                  className={`favorite-btn ${isFavorite(product.id) ? 'active' : ''}`}
                  onClick={(e) => handleToggleFavorite(product, e)}
                  aria-label="Add to favorites"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
              <div className="featured-product-info">
                <h3>{product.name}</h3>
                <p className="featured-product-category">{product.category}</p>
                <p className="featured-product-brand">{product.brand}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="category-cards-section">
        <div className="category-cards-grid">
          {categoryCards.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-card-image">
                <img src={category.image} alt={category.title} />
              </div>
              <div className="category-card-content">
                <h2>{category.title}</h2>
                <p>{category.description}</p>
                <button 
                  className="category-card-btn"
                  onClick={() => navigate(category.link)}
                >
                  {category.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="quote-content">
          <h2>OUR STORY</h2>
          <p>
            Fashion is a story told in fabric and form. Each piece in our thrift collection is carefully curated to bring you timeless elegance and sustainable style. We believe in giving quality garments a second life, reducing waste while helping you discover unique pieces that will become cherished parts of your wardrobe for years to come.
          </p>
        </div>
      </section>

      {/* This Week's Favourite */}
      <section className="weeks-favourite-section">
        <h2 className="weeks-favourite-title">THIS WEEK'S FAVOURITE</h2>
        <div className="weeks-favourite-grid">
          {weeksFavorites.map(item => (
            <div key={item.id} className="weeks-favourite-item">
              <img src={item.image} alt="Favourite" />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="collections-newsletter">
        <div className="collections-newsletter-content">
          <p className="newsletter-subtitle">Sign up for our newsletter and get</p>
          <p className="newsletter-discount">15% off</p>
          <div className="newsletter-form-collections">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="collections-footer">
        <div className="collections-footer-content">
          <div className="footer-links-row">
            <a href="#">About</a>
            <a href="#">Customer service</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-social-icons">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">ig</a>
            <a href="#" aria-label="Pinterest">p</a>
            <a href="#" aria-label="YouTube">yt</a>
          </div>
        </div>
      </footer>

      {/* Item Detail Full Page */}
      {selectedItem && (
        <div className="item-detail-fullpage">
          <div className="item-detail-fullpage-content">
            <button onClick={() => setSelectedItem(null)} className="fullpage-back-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            
            <div className="fullpage-scroll-container">
              {/* Main Item Section */}
              <div className="fullpage-item-main">
                <div className="fullpage-item-image">
                  <img src={selectedItem.image} alt={selectedItem.name} />
                </div>
                
                <div className="fullpage-item-info">
                  <h1 className="fullpage-item-name">{selectedItem.name}</h1>
                  <p className="fullpage-item-price">{selectedItem.price}</p>
                  
                  <div className="fullpage-item-specs">
                    <div className="fullpage-spec-item">
                      <span className="fullpage-spec-label">Brand</span>
                      <span className="fullpage-spec-value">{selectedItem.brand}</span>
                    </div>
                    <div className="fullpage-spec-item">
                      <span className="fullpage-spec-label">Category</span>
                      <span className="fullpage-spec-value">{selectedItem.category}</span>
                    </div>
                    <div className="fullpage-spec-item">
                      <span className="fullpage-spec-label">Size</span>
                      <span className="fullpage-spec-value">{selectedItem.size}</span>
                    </div>
                    <div className="fullpage-spec-item">
                      <span className="fullpage-spec-label">Condition</span>
                      <span className="fullpage-spec-value">{selectedItem.condition}</span>
                    </div>
                    <div className="fullpage-spec-item">
                      <span className="fullpage-spec-label">Season</span>
                      <span className="fullpage-spec-value">{selectedItem.season}</span>
                    </div>
                  </div>

                  {selectedItem.description && (
                    <div className="fullpage-item-description">
                      <h4>Description</h4>
                      <p>{selectedItem.description}</p>
                    </div>
                  )}

                  <div className="fullpage-item-actions">
                    <button 
                      className="fullpage-action-btn fullpage-primary-btn"
                      onClick={() => setShowWardrobeSelector(true)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M9 3v18"/>
                        <path d="M15 3v18"/>
                      </svg>
                      Add to Wardrobe
                    </button>
                    <button 
                      className="fullpage-action-btn fullpage-secondary-btn"
                      onClick={() => {
                        setArItem(selectedItem);
                        setShowARTryOn(true);
                        setSelectedItem(null);
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                        <polyline points="17 2 12 7 7 2"/>
                      </svg>
                      Try with AR
                    </button>
                    <button 
                      className="fullpage-action-btn fullpage-edit-btn"
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      {isEditMode ? 'Cancel Edit' : 'Edit Item'}
                    </button>
                    <button 
                      className="fullpage-action-btn fullpage-delete-btn"
                      onClick={handleDeleteItem}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      Delete Item
                    </button>
                    <button 
                      className="fullpage-action-btn fullpage-buy-btn"
                      onClick={handleBuyNow}
                    >
                      💳 Buy Now — {selectedItem.price}
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggested Items Section */}
              <div className="fullpage-suggested-section">
                <h3 className="fullpage-suggested-title">You May Also Like</h3>
                <div className="fullpage-suggested-grid">
                  {featuredProducts
                    .filter(item => item.id !== selectedItem.id)
                    .slice(0, 3)
                    .map(item => (
                      <div 
                        key={item.id} 
                        className="fullpage-suggested-card"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="fullpage-suggested-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="fullpage-suggested-info">
                          <h4>{item.name}</h4>
                          <p className="fullpage-suggested-price">{item.price}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wardrobe Selector Modal */}
      {showWardrobeSelector && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowWardrobeSelector(false)}>
          <div className="modal-content wardrobe-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Wardrobe</h3>
              <button onClick={() => setShowWardrobeSelector(false)} className="modal-close">×</button>
            </div>
            <div className="wardrobe-selector-content">
              <p className="wardrobe-selector-subtitle">Choose which wardrobe to add "{selectedItem.name}" to:</p>
              
              {loadingWardrobes ? (
                <div className="loading-wardrobes">
                  <div className="spinner"></div>
                  <p>Loading wardrobes...</p>
                </div>
              ) : wardrobes.length === 0 ? (
                <div className="no-wardrobes">
                  <p>You don't have any wardrobes yet.</p>
                  <button 
                    onClick={() => navigate('/wardrobe')}
                    className="create-wardrobe-link-btn"
                  >
                    Create Your First Wardrobe
                  </button>
                </div>
              ) : (
                <div className="wardrobes-list">
                  {wardrobes.map((wardrobe) => (
                    <button
                      key={wardrobe._id}
                      onClick={() => handleAddToWardrobe(wardrobe._id)}
                      className="wardrobe-option-btn"
                      disabled={addingToWardrobe}
                    >
                      <div className="wardrobe-option-info">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <path d="M9 3v18"/>
                          <path d="M15 3v18"/>
                        </svg>
                        <div>
                          <h4>{wardrobe.name}</h4>
                          <p>{wardrobe.items.length} items</p>
                        </div>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Snap Lens AR Try-On */}
      {showARTryOn && arItem && (
        <LensStudioAR 
          item={arItem}
          onClose={() => {
            setShowARTryOn(false);
            setArItem(null);
          }} 
        />
      )}
    </div>
  );
};

export default Collections;
