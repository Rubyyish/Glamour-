import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Handle scroll effect for navigation
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    
    if (confirmLogout) {
      logout();
      toast.success('Logged out successfully! 👋');
    }
    // If user clicks "No", nothing happens and they stay on the page
  };

  return (
    <div className="home-container">
      {/* Minimal Navigation */}
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo">GLAMOURÉ</div>
          <div className="nav-center">
            <button onClick={() => navigate('/collections')} className="nav-link-btn">Collections</button>
            <a href="#ar-tryon">AR Try-On</a>
            <a href="#technology">Technology</a>
            <button onClick={() => navigate('/about')} className="nav-link-btn">About</button>
          </div>
          <div className="nav-right">
            <div className="user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="user-name-btn"
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
                <div className="user-dropdown-menu">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item"
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
                    className="dropdown-item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M9 3v18"/>
                      <path d="M15 3v18"/>
                    </svg>
                    Wardrobe
                  </button>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => {
                        navigate('/admin');
                        setShowUserMenu(false);
                      }}
                      className="dropdown-item admin-item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      Admin Panel
                    </button>
                  )}
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="logout-btn">Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean & Minimal */}
      <section className="hero-minimal">
        <div className="hero-video-background">
          <video autoPlay loop muted playsInline className="hero-video">
            <source src="/videos/hero-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="hero-video-overlay"></div>
        </div>
        <div className="hero-minimal-content">
          <p className="hero-subtitle">Introducing AR Fashion</p>
          <h1 className="hero-title">
            The Future<br/>
            of Fashion
          </h1>
          <p className="hero-description">
            Experience fashion in augmented reality.<br/>
            Try on garments virtually before you buy.
          </p>
          <div className="hero-cta">
            <button className="btn-primary-minimal">Start AR Experience</button>
            <button onClick={() => navigate('/collections')} className="btn-secondary-minimal">Explore Collections</button>
          </div>
        </div>
      </section>

      {/* AR Technology Section */}
      <section className="ar-section-minimal" id="ar-tryon">
        <div className="ar-content-minimal">
          <div className="ar-text">
            <span className="section-label">AR TECHNOLOGY</span>
            <h2>Try Before<br/>You Buy</h2>
            <p>Experience our revolutionary AR try-on technology. See how garments look on you in real-time, from any device.</p>
            <div className="ar-features-list">
              <div className="feature-item">
                <div className="feature-icon-minimal">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div>
                  <h4>Real-Time Visualization</h4>
                  <p>See garments on your body in real-time with advanced AR technology that maps to your exact measurements.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-minimal">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                </div>
                <div>
                  <h4>Any Device</h4>
                  <p>Access AR try-on from your smartphone, tablet, or desktop. No app download required.</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-minimal">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h4>Perfect Fit</h4>
                  <p>Our AI-powered sizing recommendations ensure you get the perfect fit every time.</p>
                </div>
              </div>
            </div>
            <button className="btn-primary-minimal launch-ar-btn-minimal">Launch AR Try-On</button>
          </div>
          <div className="ar-visual">
            <div className="ar-demo-card">
              <div className="ar-badge-top">
                <span className="ar-status-dot"></span>
                AR Active
              </div>
              <div className="ar-demo-image">
                <img src="https://images.unsplash.com/photo-1558769132-cb1aea1c8a5a?w=600&q=80" alt="AR Demo" />
              </div>
              <div className="ar-product-card">
                <div className="ar-product-info-minimal">
                  <span className="product-label">Current Item</span>
                  <h4 className="product-name-minimal">Oversized Blazer</h4>
                </div>
                <button className="add-to-cart-minimal">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid - Minimal */}
      <section className="collections-minimal" id="collections">
        <div className="collections-header-minimal">
          <h2>Collections</h2>
          <button onClick={() => navigate('/collections')} className="view-all-minimal">View All →</button>
        </div>
        <div className="collections-grid-minimal">
          <div className="collection-item" onClick={() => navigate('/category/formal-elegance')}>
            <div className="collection-image">
              <img src="/images/formal-elegance.jpg" alt="Formal" />
            </div>
            <div className="collection-details">
              <h3>Formal Elegance</h3>
              <p>18 Items</p>
            </div>
          </div>
          <div className="collection-item" onClick={() => navigate('/category/casual-comfort')}>
            <div className="collection-image">
              <img src="/images/casual-comfort.jpg" alt="Casual" />
            </div>
            <div className="collection-details">
              <h3>Casual Comfort</h3>
              <p>24 Items</p>
            </div>
          </div>
          <div className="collection-item" onClick={() => navigate('/category/accessories')}>
            <div className="collection-image">
              <img src="/images/accessories.jpg" alt="Accessories" />
            </div>
            <div className="collection-details">
              <h3>Accessories</h3>
              <p>32 Items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section" id="technology">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to receive updates on new fits and accessories.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="about-content">
          <span className="section-label">About Us</span>
          <h2>Redefining Fashion<br/>Through Innovation</h2>
          <p>At Glamouré, we believe fashion should be accessible, sustainable, and personalized. Our cutting-edge AR technology bridges the gap between online shopping and the in-store experience, allowing you to make confident purchasing decisions from the comfort of your home.</p>
          <p>Founded with a vision to revolutionize the fashion industry, we combine artificial intelligence, augmented reality, and expert curation to deliver a shopping experience unlike any other.</p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="footer-minimal">
        <div className="footer-content-minimal">
          <div className="footer-left">
            <div className="footer-logo">GLAMOURÉ</div>
            <p>Revolutionizing fashion through technology.</p>
          </div>
          <div className="footer-links-minimal">
            <div className="footer-column-minimal">
              <h4>Shop</h4>
              <a href="#">New Arrivals</a>
              <a href="#">Collections</a>
              <a href="#">Sale</a>
            </div>
            <div className="footer-column-minimal">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Returns</a>
              <a href="#">Shipping</a>
            </div>
            <div className="footer-column-minimal">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Careers</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom-minimal">
          <p>© 2024 Glamouré. All rights reserved.</p>
          <div className="footer-social">
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
            <a href="#">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;