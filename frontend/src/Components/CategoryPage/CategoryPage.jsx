import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { getAllWardrobes, addItemToWardrobe } from '../../api/wardrobeApi';
import './CategoryPage.css';

const CategoryPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showWardrobeSelector, setShowWardrobeSelector] = useState(false);
  const [wardrobes, setWardrobes] = useState([]);
  const [loadingWardrobes, setLoadingWardrobes] = useState(false);
  const [addingToWardrobe, setAddingToWardrobe] = useState(false);

  useLayoutEffect(() => {
    // This runs synchronously before browser paints - no flash
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [category]);

  useEffect(() => {
    fetchWardrobes();
  }, [category]);

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

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      logout();
    }
  };

  // Category data with items
  const categoryData = {
    'formal-elegance': {
      title: 'Formal Elegance',
      description: 'Sophisticated pieces for professional and formal occasions',
      items: [
        {
          id: 1,
          name: 'Pinstripe Blazer',
          image: '/images/formal-elegance.jpg',
          price: '$45',
          status: 'resell',
          category: 'Outerwear',
          brand: 'Vintage',
          size: 'M',
          colors: ['Brown', 'Tan'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Classic pinstripe blazer perfect for formal occasions.',
          tags: ['Formal', 'Professional', 'Classic']
        },
        {
          id: 2,
          name: 'Tailored Suit Jacket',
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
          price: '$55',
          status: 'resell',
          category: 'Outerwear',
          brand: 'Hugo Boss',
          size: 'L',
          colors: ['Navy', 'Blue'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Premium tailored suit jacket in navy blue.',
          tags: ['Formal', 'Business', 'Elegant']
        },
        {
          id: 3,
          name: 'Black Dress Pants',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
          price: '$32',
          status: 'donate',
          category: 'Bottoms',
          brand: 'Calvin Klein',
          size: '32',
          colors: ['Black'],
          season: 'All Season',
          condition: 'Very Good',
          description: 'Classic black dress pants with perfect fit.',
          tags: ['Formal', 'Professional', 'Versatile']
        },
        {
          id: 10,
          name: 'White Dress Shirt',
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
          price: '$28',
          status: 'exchange',
          category: 'Tops',
          brand: 'Brooks Brothers',
          size: 'M',
          colors: ['White'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Crisp white dress shirt for formal occasions.',
          tags: ['Formal', 'Classic', 'Essential']
        },
        {
          id: 11,
          name: 'Silk Tie',
          image: 'https://images.unsplash.com/photo-1589756823695-278bc8356c59?w=600&q=80',
          price: '$18',
          status: 'keep',
          category: 'Accessories',
          brand: 'Hermès',
          size: 'One Size',
          colors: ['Navy', 'Red'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Elegant silk tie with classic pattern.',
          tags: ['Formal', 'Accessories', 'Luxury']
        },
        {
          id: 12,
          name: 'Leather Oxford Shoes',
          image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
          price: '$65',
          status: 'resell',
          category: 'Shoes',
          brand: 'Allen Edmonds',
          size: '10',
          colors: ['Black'],
          season: 'All Season',
          condition: 'Very Good',
          description: 'Classic leather oxford shoes for formal wear.',
          tags: ['Formal', 'Shoes', 'Leather']
        },
        {
          id: 13,
          name: 'Wool Trench Coat',
          image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&q=80',
          price: '$85',
          status: 'resell',
          category: 'Outerwear',
          brand: 'Burberry',
          size: 'L',
          colors: ['Beige', 'Tan'],
          season: 'Fall',
          condition: 'Excellent',
          description: 'Timeless wool trench coat for sophisticated style.',
          tags: ['Formal', 'Outerwear', 'Classic']
        },
        {
          id: 14,
          name: 'Leather Belt',
          image: 'https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=600&q=80',
          price: '$22',
          status: 'donate',
          category: 'Accessories',
          brand: 'Coach',
          size: '34',
          colors: ['Brown'],
          season: 'All Season',
          condition: 'Very Good',
          description: 'Quality leather belt with classic buckle.',
          tags: ['Formal', 'Accessories', 'Leather']
        },
        {
          id: 15,
          name: 'Pocket Square',
          image: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=600&q=80',
          price: '$12',
          status: 'keep',
          category: 'Accessories',
          brand: 'Paul Smith',
          size: 'One Size',
          colors: ['Multi'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Elegant pocket square to complete your formal look.',
          tags: ['Formal', 'Accessories', 'Detail']
        }
      ]
    },
    'casual-comfort': {
      title: 'Casual Comfort',
      description: 'Relaxed and comfortable pieces for everyday wear',
      items: [
        {
          id: 4,
          name: 'Denim Jacket',
          image: '/images/casual-comfort.jpg',
          price: '$38',
          status: 'exchange',
          category: 'Outerwear',
          brand: "Levi's",
          size: 'M',
          colors: ['Blue', 'Denim'],
          season: 'All Season',
          condition: 'Good',
          description: 'Classic denim jacket, perfect for casual outings.',
          tags: ['Casual', 'Denim', 'Everyday']
        },
        {
          id: 5,
          name: 'Cotton T-Shirt',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
          price: '$15',
          status: 'donate',
          category: 'Tops',
          brand: 'H&M',
          size: 'L',
          colors: ['White'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Soft cotton t-shirt for maximum comfort.',
          tags: ['Casual', 'Basic', 'Comfortable']
        },
        {
          id: 6,
          name: 'Jogger Pants',
          image: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&q=80',
          price: '$28',
          status: 'resell',
          category: 'Bottoms',
          brand: 'Nike',
          size: 'M',
          colors: ['Gray'],
          season: 'All Season',
          condition: 'Very Good',
          description: 'Comfortable jogger pants for relaxed days.',
          tags: ['Casual', 'Athleisure', 'Comfortable']
        },
        {
          id: 16,
          name: 'Hoodie',
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80',
          price: '$32',
          status: 'exchange',
          category: 'Tops',
          brand: 'Champion',
          size: 'L',
          colors: ['Gray'],
          season: 'Fall',
          condition: 'Excellent',
          description: 'Cozy hoodie for ultimate comfort.',
          tags: ['Casual', 'Comfortable', 'Cozy']
        },
        {
          id: 17,
          name: 'Sneakers',
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
          price: '$42',
          status: 'resell',
          category: 'Shoes',
          brand: 'Adidas',
          size: '9',
          colors: ['White'],
          season: 'All Season',
          condition: 'Very Good',
          description: 'Classic white sneakers for everyday wear.',
          tags: ['Casual', 'Shoes', 'Comfortable']
        },
        {
          id: 18,
          name: 'Flannel Shirt',
          image: 'https://images.unsplash.com/photo-1598032895397-b9c644f3a3c0?w=600&q=80',
          price: '$25',
          status: 'donate',
          category: 'Tops',
          brand: 'Uniqlo',
          size: 'M',
          colors: ['Red', 'Black'],
          season: 'Fall',
          condition: 'Good',
          description: 'Warm flannel shirt for casual comfort.',
          tags: ['Casual', 'Flannel', 'Cozy']
        },
        {
          id: 19,
          name: 'Cargo Shorts',
          image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
          price: '$22',
          status: 'exchange',
          category: 'Bottoms',
          brand: 'Gap',
          size: '32',
          colors: ['Khaki'],
          season: 'Summer',
          condition: 'Very Good',
          description: 'Practical cargo shorts for summer days.',
          tags: ['Casual', 'Summer', 'Practical']
        },
        {
          id: 20,
          name: 'Baseball Cap',
          image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
          price: '$15',
          status: 'keep',
          category: 'Accessories',
          brand: 'New Era',
          size: 'One Size',
          colors: ['Black'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Classic baseball cap for casual style.',
          tags: ['Casual', 'Accessories', 'Hat']
        },
        {
          id: 21,
          name: 'Canvas Backpack',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
          price: '$35',
          status: 'resell',
          category: 'Accessories',
          brand: 'Herschel',
          size: 'One Size',
          colors: ['Navy'],
          season: 'All Season',
          condition: 'Good',
          description: 'Durable canvas backpack for everyday use.',
          tags: ['Casual', 'Accessories', 'Practical']
        }
      ]
    },
    'accessories': {
      title: 'Accessories',
      description: 'Complete your look with stylish accessories',
      items: [
        {
          id: 7,
          name: 'Leather Handbag',
          image: '/images/accessories.jpg',
          price: '$42',
          status: 'resell',
          category: 'Accessories',
          brand: 'Coach',
          size: 'One Size',
          colors: ['Brown', 'Tan'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Elegant leather handbag with multiple compartments.',
          tags: ['Accessories', 'Leather', 'Elegant']
        },
        {
          id: 8,
          name: 'Silk Scarf',
          image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',
          price: '$18',
          status: 'exchange',
          category: 'Accessories',
          brand: 'Hermès',
          size: 'One Size',
          colors: ['Multi'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Luxurious silk scarf with beautiful patterns.',
          tags: ['Accessories', 'Silk', 'Luxury']
        },
        {
          id: 9,
          name: 'Sunglasses',
          image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
          price: '$25',
          status: 'donate',
          category: 'Accessories',
          brand: 'Ray-Ban',
          size: 'One Size',
          colors: ['Black'],
          season: 'Summer',
          condition: 'Very Good',
          description: 'Classic aviator sunglasses for sunny days.',
          tags: ['Accessories', 'Sunglasses', 'Summer']
        },
        {
          id: 22,
          name: 'Leather Wallet',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
          price: '$28',
          status: 'keep',
          category: 'Accessories',
          brand: 'Fossil',
          size: 'One Size',
          colors: ['Brown'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Classic leather wallet with multiple card slots.',
          tags: ['Accessories', 'Leather', 'Essential']
        },
        {
          id: 23,
          name: 'Watch',
          image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
          price: '$75',
          status: 'resell',
          category: 'Accessories',
          brand: 'Seiko',
          size: 'One Size',
          colors: ['Silver'],
          season: 'All Season',
          condition: 'Very Good',
          description: 'Elegant timepiece for any occasion.',
          tags: ['Accessories', 'Watch', 'Elegant']
        },
        {
          id: 24,
          name: 'Crossbody Bag',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
          price: '$38',
          status: 'exchange',
          category: 'Accessories',
          brand: 'Michael Kors',
          size: 'One Size',
          colors: ['Black'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Stylish crossbody bag perfect for daily use.',
          tags: ['Accessories', 'Bag', 'Practical']
        },
        {
          id: 25,
          name: 'Statement Necklace',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
          price: '$32',
          status: 'resell',
          category: 'Accessories',
          brand: 'Vintage',
          size: 'One Size',
          colors: ['Gold'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Bold statement necklace to elevate any outfit.',
          tags: ['Accessories', 'Jewelry', 'Statement']
        },
        {
          id: 26,
          name: 'Leather Gloves',
          image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80',
          price: '$35',
          status: 'donate',
          category: 'Accessories',
          brand: 'Burberry',
          size: 'M',
          colors: ['Black'],
          season: 'Winter',
          condition: 'Very Good',
          description: 'Elegant leather gloves for cold weather.',
          tags: ['Accessories', 'Winter', 'Leather']
        },
        {
          id: 27,
          name: 'Fedora Hat',
          image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=600&q=80',
          price: '$42',
          status: 'keep',
          category: 'Accessories',
          brand: 'Stetson',
          size: 'L',
          colors: ['Brown'],
          season: 'All Season',
          condition: 'Excellent',
          description: 'Classic fedora hat for sophisticated style.',
          tags: ['Accessories', 'Hat', 'Classic']
        }
      ]
    }
  };

  const currentCategory = categoryData[category] || categoryData['formal-elegance'];

  return (
    <div className="category-page">
      {/* Navigation */}
      <nav className="category-nav">
        <div className="category-nav-content">
          <button onClick={() => navigate('/home')} className="back-to-home-category">
            ← Back to Home
          </button>
          <div className="category-logo">GLAMOURÉ</div>
          <div className="nav-right-category">
            <div className="user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="user-name-btn-category"
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
                <div className="user-dropdown-menu-category">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="dropdown-item-category"
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
                    className="dropdown-item-category"
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
            <button onClick={handleLogout} className="logout-btn-category">Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Category Header */}
      <section className="category-header">
        <div className="category-header-content">
          <h1 className="category-title">{currentCategory.title}</h1>
          <p className="category-description">{currentCategory.description}</p>
        </div>
      </section>

      {/* Items Grid */}
      <section className="category-items-section">
        <div className="category-items-grid">
          {currentCategory.items.map(item => (
            <div key={item.id} className="category-item-card" onClick={() => setSelectedItem(item)}>
              <div className="category-item-image">
                <img src={item.image} alt={item.name} />
                <span className={`status-badge status-${item.status || 'resell'}`}>
                  {(item.status || 'resell').toUpperCase()}
                </span>
              </div>
              <div className="category-item-info">
                <h3>{item.name}</h3>
                {(item.status === 'resell' || item.status === 'exchange' || !item.status) && (
                  <p className="category-item-price">{item.price}</p>
                )}
                <p className="category-item-brand">{item.brand}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                {(selectedItem.status === 'resell' || selectedItem.status === 'exchange' || !selectedItem.status) && (
                  <div className="info-row">
                    <span className="info-label">Price:</span>
                    <span className="info-value price-value">{selectedItem.price}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge-detail status-${selectedItem.status || 'resell'}`}>
                    {(selectedItem.status || 'resell').toUpperCase()}
                  </span>
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
                  <button 
                    className="add-to-wardrobe-btn"
                    onClick={() => setShowWardrobeSelector(true)}
                  >
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
    </div>
  );
};

export default CategoryPage;
