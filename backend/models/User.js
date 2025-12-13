const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if not using OAuth
      return !this.googleId;
    },
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordOTP: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  arTryOnPhotos: [{
    itemName: String,
    itemImage: String,
    itemCategory: String,
    photoData: String, // Base64 image data
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  textures: [{
    garmentType: {
      type: String,
      enum: ['shirt', 'pants', 'sweatshirt', 'jacket', 'dress', 'skirt', 'sweater', 'other'],
      default: 'shirt'
    },
    textureUrl: String,
    textureFilename: String,
    originalImageUrl: String,
    textureMetadata: {
      width: Number,
      height: Number,
      averageColor: {
        r: Number,
        g: Number,
        b: Number
      },
      seamless: Boolean,
      version: Number
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);