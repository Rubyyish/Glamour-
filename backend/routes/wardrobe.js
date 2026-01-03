const express = require('express');
const router = express.Router();
const Wardrobe = require('../models/Wardrobe');
const auth = require('../middleware/auth');

// Get all wardrobes for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const wardrobes = await Wardrobe.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      wardrobes
    });
  } catch (error) {
    console.error('Get wardrobes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wardrobes'
    });
  }
});

// Get single wardrobe by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const wardrobe = await Wardrobe.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wardrobe) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe not found'
      });
    }

    res.json({
      success: true,
      wardrobe
    });
  } catch (error) {
    console.error('Get wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wardrobe'
    });
  }
});

// Create new wardrobe
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Wardrobe name is required'
      });
    }

    const wardrobe = new Wardrobe({
      name: name.trim(),
      description: description?.trim() || '',
      userId: req.user._id,
      items: []
    });

    await wardrobe.save();

    res.status(201).json({
      success: true,
      message: 'Wardrobe created successfully',
      wardrobe
    });
  } catch (error) {
    console.error('Create wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create wardrobe'
    });
  }
});

// Update wardrobe
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, items } = req.body;

    const wardrobe = await Wardrobe.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wardrobe) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe not found'
      });
    }

    if (name) wardrobe.name = name.trim();
    if (description !== undefined) wardrobe.description = description.trim();
    if (items) wardrobe.items = items;

    await wardrobe.save();

    res.json({
      success: true,
      message: 'Wardrobe updated successfully',
      wardrobe
    });
  } catch (error) {
    console.error('Update wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wardrobe'
    });
  }
});

// Delete wardrobe
router.delete('/:id', auth, async (req, res) => {
  try {
    const wardrobe = await Wardrobe.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wardrobe) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe not found'
      });
    }

    res.json({
      success: true,
      message: 'Wardrobe deleted successfully'
    });
  } catch (error) {
    console.error('Delete wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete wardrobe'
    });
  }
});

// Add item to wardrobe
router.post('/:id/items', auth, async (req, res) => {
  try {
    const { 
      name, 
      imageUrl, 
      category, 
      colors, 
      tags, 
      brand, 
      size, 
      visibility, 
      price, 
      datePurchased, 
      season, 
      stylingTags, 
      status, 
      comments 
    } = req.body;

    if (!name || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name and image are required'
      });
    }

    const wardrobe = await Wardrobe.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wardrobe) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe not found'
      });
    }

    const newItem = {
      name,
      imageUrl,
      category: category || 'Other',
      colors: colors || [],
      tags: tags || [],
      brand: brand || '',
      size: size || '',
      visibility: visibility || 'Private',
      price: price || 0,
      datePurchased: datePurchased || null,
      season: season || 'All Season',
      stylingTags: {
        occasion: stylingTags?.occasion || [],
        mood: stylingTags?.mood || []
      },
      status: status || 'Keep',
      comments: comments || '',
      addedAt: new Date()
    };

    wardrobe.items.push(newItem);
    await wardrobe.save();

    res.json({
      success: true,
      message: 'Item added to wardrobe',
      wardrobe
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to wardrobe'
    });
  }
});

// Remove item from wardrobe
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const wardrobe = await Wardrobe.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wardrobe) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe not found'
      });
    }

    wardrobe.items = wardrobe.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await wardrobe.save();

    res.json({
      success: true,
      message: 'Item removed from wardrobe',
      wardrobe
    });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wardrobe'
    });
  }
});

// Update item in wardrobe
router.put('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const wardrobe = await Wardrobe.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wardrobe) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe not found'
      });
    }

    const itemIndex = wardrobe.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Update item fields
    const updatedFields = req.body;
    Object.keys(updatedFields).forEach(key => {
      if (updatedFields[key] !== undefined) {
        wardrobe.items[itemIndex][key] = updatedFields[key];
      }
    });

    await wardrobe.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      wardrobe
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item'
    });
  }
});

// Toggle favorite status
router.patch('/:id/items/:itemId/favorite', auth, async (req, res) => {
  try {
    const wardrobe = await Wardrobe.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wardrobe) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe not found'
      });
    }

    const item = wardrobe.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    item.isFavorite = !item.isFavorite;
    await wardrobe.save();

    res.json({
      success: true,
      message: item.isFavorite ? 'Added to favorites' : 'Removed from favorites',
      wardrobe
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite'
    });
  }
});

module.exports = router;
