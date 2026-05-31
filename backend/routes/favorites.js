const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('favorites');
    
    res.json({
      success: true,
      favorites: user.favorites || []
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites'
    });
  }
});

// Add item to favorites
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, itemName, itemImage, itemPrice, itemBrand, itemCategory } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Check if already in favorites
    const existingIndex = user.favorites.findIndex(fav => fav.itemId === itemId);
    
    if (existingIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Item already in favorites'
      });
    }
    
    user.favorites.push({
      itemId,
      itemName,
      itemImage,
      itemPrice,
      itemBrand,
      itemCategory,
      addedAt: new Date()
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Added to favorites',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites'
    });
  }
});

// Remove item from favorites
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.favorites = user.favorites.filter(fav => fav.itemId !== req.params.itemId);
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Removed from favorites',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites'
    });
  }
});

// Toggle favorite status
router.post('/toggle', auth, async (req, res) => {
  try {
    const { itemId, itemName, itemImage, itemPrice, itemBrand, itemCategory } = req.body;
    
    const user = await User.findById(req.user._id);
    
    const existingIndex = user.favorites.findIndex(fav => fav.itemId === itemId);
    
    if (existingIndex !== -1) {
      // Remove from favorites
      user.favorites.splice(existingIndex, 1);
      await user.save();
      
      return res.json({
        success: true,
        message: 'Removed from favorites',
        isFavorite: false,
        favorites: user.favorites
      });
    } else {
      // Add to favorites
      user.favorites.push({
        itemId,
        itemName,
        itemImage,
        itemPrice,
        itemBrand,
        itemCategory,
        addedAt: new Date()
      });
      
      await user.save();
      
      return res.json({
        success: true,
        message: 'Added to favorites',
        isFavorite: true,
        favorites: user.favorites
      });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite'
    });
  }
});

module.exports = router;
