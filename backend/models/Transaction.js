const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },

  // Item Information
  itemName: {
    type: String,
    required: true
  },
  itemPrice: {
    type: Number,
    required: true
  },
  itemImage: {
    type: String
  },
  itemCategory: {
    type: String
  },

  // Payment Information
  stripeSessionId: {
    type: String,
    required: true,
    unique: true
  },
  stripePaymentIntentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  currency: {
    type: String,
    default: 'usd'
  },

  // Transaction Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Transaction Details
  amount: {
    type: Number,
    required: true
  },
  amountRefunded: {
    type: Number,
    default: 0
  },

  // Timestamps
  completedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },

  // Additional Information
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  // Admin Notes
  adminNotes: {
    type: String
  },
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ stripeSessionId: 1 });
transactionSchema.index({ flaggedForReview: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
