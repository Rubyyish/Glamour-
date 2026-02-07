import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './About.css';

const About = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      logout();
    }
  };

  return (
    <div className="about-page">
      {/* Navigation */}
      <nav className="about-nav">
        <div className="about-nav-content">
          <button onClick={() => navigate('/home')} className="back-to-home-about">
            ← Back
          </button>
          <div className="about-logo">GLAMOURÉ</div>
          <div className="nav-right-about">
            <div className="user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="user-name-btn-about"
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
                <div className="user-dropdown-menu-about">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item-about"
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
                    className="dropdown-item-about"
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
            <button onClick={handleLogout} className="logout-btn-about">Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <p className="about-hero-subtitle">About Us</p>
          <h1 className="about-hero-title">
            Redefining Fashion<br/>
            Through Sustainability
          </h1>
          <p className="about-hero-description">
            At Glamouré, we believe fashion should be accessible, sustainable, and personalized.<br/>
            Our mission is to revolutionize thrift shopping with cutting-edge AR technology.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-text">
            <span className="section-label">OUR MISSION</span>
            <h2>Sustainable Fashion<br/>for Everyone</h2>
            <p>We're on a mission to make sustainable fashion accessible to everyone. By combining the thrill of thrift shopping with innovative AR technology, we're creating a new way to discover pre-loved fashion that's both eco-friendly and exciting.</p>
            <p>Every garment in our collection has been carefully curated for quality, style, and sustainability. We believe in giving clothes a second life and helping you build a wardrobe that's uniquely yours.</p>
          </div>
          <div className="mission-visual">
            <div className="mission-image">
              <img src="https://images.unsplash.com/photo-1558769132-cb1aea1c8a5a?w=600&q=80" alt="Sustainable Fashion" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2 className="values-title">Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3>Sustainability</h3>
            <p>We're committed to reducing fashion waste by giving quality garments a second life. Every purchase helps reduce environmental impact.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3>Quality</h3>
            <p>Each piece is carefully inspected and curated to ensure you receive only the best pre-loved fashion items.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </div>
            <h3>Innovation</h3>
            <p>Our AR try-on technology bridges the gap between online thrift shopping and the in-store experience.</p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="tech-section">
        <div className="tech-content">
          <div className="tech-visual">
            <div className="tech-image">
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" alt="AR Technology" />
            </div>
          </div>
          <div className="tech-text">
            <span className="section-label">TECHNOLOGY</span>
            <h2>AR Try-On<br/>Experience</h2>
            <p>Experience the future of thrift shopping with our revolutionary AR try-on technology. See how pre-loved garments look on you in real-time, from any device, before making a purchase.</p>
            <div className="tech-features">
              <div className="tech-feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Real-time visualization</span>
              </div>
              <div className="tech-feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Perfect fit recommendations</span>
              </div>
              <div className="tech-feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Works on any device</span>
              </div>
            </div>
            <button className="tech-cta-btn">Try AR Experience</button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="impact-content">
          <h2>Our Impact</h2>
          <div className="impact-stats">
            <div className="impact-stat">
              <h3>10,000+</h3>
              <p>Garments Given New Life</p>
            </div>
            <div className="impact-stat">
              <h3>5,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="impact-stat">
              <h3>50 Tons</h3>
              <p>Textile Waste Prevented</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Start Your Sustainable Fashion Journey</h2>
          <p>Join thousands of fashion lovers who are making a difference, one thrifted piece at a time.</p>
          <button onClick={() => navigate('/collections')} className="cta-button">
            Browse Collections
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="about-footer-content">
          <div className="footer-left">
            <div className="footer-logo">GLAMOURÉ</div>
            <p>Revolutionizing thrift fashion through technology.</p>
          </div>
          <div className="footer-links-about">
            <div className="footer-column-about">
              <h4>Thrift</h4>
              <a href="#">New Arrivals</a>
              <a href="#">Collections</a>
              <a href="#">Featured</a>
            </div>
            <div className="footer-column-about">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Returns</a>
              <a href="#">Shipping</a>
            </div>
            <div className="footer-column-about">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Sustainability</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom-about">
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

export default About;
