const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Other'],
    default: 'Other'
  },
  colors: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  brand: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  visibility: {
    type: String,
    enum: ['Private', 'Public', 'Friends'],
    default: 'Private'
  },
  price: {
    type: Number,
    min: 0
  },
  datePurchased: {
    type: Date
  },
  season: {
    type: String,
    enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'],
    default: 'All Season'
  },
  stylingTags: {
    occasion: [{
      type: String,
      trim: true
    }],
    mood: [{
      type: String,
      trim: true
    }]
  },
  status: {
    type: String,
    enum: ['Keep', 'Swap', 'Donate', 'Resell'],
    default: 'Keep'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wardrobeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [itemSchema],
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
wardrobeSchema.index({ userId: 1 });

module.exports = mongoose.model('Wardrobe', wardrobeSchema);
