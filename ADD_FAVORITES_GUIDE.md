# Add to Favorites Feature - Implementation Guide

## ✅ Backend Complete
- ✅ User model updated with favorites array
- ✅ Favorites routes created (`/api/favorites`)
- ✅ Routes registered in server.js
- ✅ API endpoints ready:
  - GET `/api/favorites` - Get all favorites
  - POST `/api/favorites` - Add to favorites
  - DELETE `/api/favorites/:itemId` - Remove from favorites
  - POST `/api/favorites/toggle` - Toggle favorite status

## ✅ Frontend API Complete
- ✅ `favoritesApi.js` created with all methods

## 🔧 What Needs to be Added

### 1. Collections.jsx - Add Favorite Button

Add these imports at the top:
```javascript
import { getFavorites, toggleFavorite } from '../../api/favoritesApi';
```

Add state for favorites:
```javascript
const [favorites, setFavorites] = useState([]);
```

Add useEffect to load favorites:
```javascript
useEffect(() => {
  loadFavorites();
}, []);

const loadFavorites = async () => {
  try {
    const response = await getFavorites();
    if (response.success) {
      setFavorites(response.favorites);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
};
```

Add toggle favorite function:
```javascript
const handleToggleFavorite = async (item, e) => {
  e.stopPropagation();
  
  try {
    const response = await toggleFavorite({
      itemId: `collection-${item.id}`,
      itemName: item.name,
      itemImage: item.image,
      itemPrice: item.price,
      itemBrand: item.brand,
      itemCategory: item.category
    });
    
    if (response.success) {
      setFavorites(response.favorites);
      toast.success(response.message);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error('Failed to update favorites');
  }
};
```

Add helper function to check if item is favorited:
```javascript
const isFavorite = (itemId) => {
  return favorites.some(fav => fav.itemId === `collection-${itemId}`);
};
```

Add favorite button to each item card (in the render section):
```jsx
<div className="item-card" onClick={() => handleItemClick(item)}>
  <div className="item-image-container">
    <img src={item.image} alt={item.name} />
    <button
      onClick={(e) => handleToggleFavorite(item, e)}
      className={`favorite-btn ${isFavorite(item.id) ? 'active' : ''}`}
      title={isFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  </div>
  <div className="item-info">
    <h3>{item.name}</h3>
    <p className="item-price">{item.price}</p>
  </div>
</div>
```

### 2. CategoryPage.jsx - Add Favorite Button

Same changes as Collections.jsx:
- Add imports
- Add state
- Add useEffect to load favorites
- Add handleToggleFavorite function
- Add isFavorite helper
- Add favorite button to item cards

### 3. Collections.css - Add Favorite Button Styles

```css
.item-image-container {
  position: relative;
  overflow: hidden;
}

.favorite-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  z-index: 10;
}

.favorite-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.favorite-btn.active {
  background: #ff6b6b;
  color: white;
}

.favorite-btn.active:hover {
  background: #ff5252;
}
```

### 4. Create Favorites Page (Optional)

Create `frontend/src/Components/Favorites/Favorites.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, removeFromFavorites } from '../../api/favoritesApi';
import { toast } from 'react-toastify';
import './Favorites.css';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await getFavorites();
      if (response.success) {
        setFavorites(response.favorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const response = await removeFromFavorites(itemId);
      if (response.success) {
        setFavorites(response.favorites);
        toast.success('Removed from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (loading) {
    return <div className="loading">Loading favorites...</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="empty-favorites">
        <h2>No Favorites Yet</h2>
        <p>Start adding items to your favorites!</p>
        <button onClick={() => navigate('/collections')}>Browse Items</button>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1>My Favorites ({favorites.length})</h1>
      <div className="favorites-grid">
        {favorites.map((item) => (
          <div key={item.itemId} className="favorite-item">
            <img src={item.itemImage} alt={item.itemName} />
            <h3>{item.itemName}</h3>
            <p>{item.itemPrice}</p>
            <button onClick={() => handleRemove(item.itemId)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
```

### 5. Add Route in App.jsx

```jsx
import Favorites from './Components/Favorites/Favorites';

// In routes:
<Route path="/favorites" element={<Favorites />} />
```

### 6. Add Favorites Link to Navigation

In HomePage or Navigation component:
```jsx
<button onClick={() => navigate('/favorites')}>
  <svg>...</svg>
  Favorites
</button>
```

## 🎨 Icon SVG for Heart

```jsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>
```

## 📝 Summary

The backend is complete. To finish the feature:
1. Update Collections.jsx with favorite button
2. Update CategoryPage.jsx with favorite button  
3. Add CSS styles for favorite button
4. (Optional) Create dedicated Favorites page
5. (Optional) Add favorites link to navigation

Would you like me to implement these changes now?
