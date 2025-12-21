const mongoose = require('mongoose');

const wardrobeItemSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID
    required: true,
    index: true
  },
  item_name: {
    type: String,
    required: true,
    trim: true
  },
  image_url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  season: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'wardrobe_items'
});

module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);
