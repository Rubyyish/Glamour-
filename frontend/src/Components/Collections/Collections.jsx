import { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Collections.css';

const Collections = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useLayoutEffect(() => {
    // Scroll to top instantly when component mounts
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

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
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
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
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
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
      image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&q=80',
      price: '$28',
      category: 'Tops',
      brand: 'H&M',
      size: 'L',
      colors: ['Gray', 'Charcoal'],
      season: 'All Season',
      condition: 'Good',
      description: 'Tailored waistcoat perfect for layering. Great for both casual and formal occasions.',
      tags: ['Formal', 'Layering', 'Classic']
    }
  ];

  const categoryCards = [
    {
      id: 1,
      title: 'Trousers',
      description: 'Discover our curated selection of pre-loved trousers, each piece carefully chosen for quality and style. From tailored fits to relaxed silhouettes.',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
      buttonText: 'BROWSE TROUSERS'
    },
    {
      id: 2,
      title: 'Shirts',
      description: 'Explore our collection of vintage and contemporary shirts, each with its own story. Perfect for any occasion, from casual to formal.',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
      buttonText: 'BROWSE SHIRTS'
    }
  ];

  const weeksFavorites = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80'
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
          <div className="collections-logo">GLAMOURÉ</div>
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
          <img src="https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1200&q=80" alt="New Season" />
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
            <div key={product.id} className="featured-product-card" onClick={() => setSelectedItem(product)}>
              <div className="featured-product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="featured-product-info">
                <h3>{product.name}</h3>
                <p className="featured-product-price">{product.price}</p>
                <button className="featured-product-btn" onClick={(e) => { e.stopPropagation(); setSelectedItem(product); }}>VIEW ITEM</button>
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
                <button className="category-card-btn">{category.buttonText}</button>
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
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>
              <div className="item-detail-info">
                <div className="info-row">
                  <span className="info-label">Price:</span>
                  <span className="info-value price-value">{selectedItem.price}</span>
                </div>
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
                {selectedItem.condition && (
                  <div className="info-row">
                    <span className="info-label">Condition:</span>
                    <span className="info-value">{selectedItem.condition}</span>
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
                <div className="info-row">
                  <span className="info-label">Season:</span>
                  <span className="info-value">{selectedItem.season}</span>
                </div>
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
                {selectedItem.description && (
                  <div className="info-row description-row">
                    <span className="info-label">Description:</span>
                    <p className="info-value">{selectedItem.description}</p>
                  </div>
                )}
                <div className="item-detail-actions">
                  <button className="add-to-wardrobe-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M9 3v18"/>
                      <path d="M15 3v18"/>
                    </svg>
                    Add to Wardrobe
                  </button>
                  <button className="try-ar-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                      <polyline points="17 2 12 7 7 2"/>
                    </svg>
                    Try with AR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
