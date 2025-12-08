require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const passport = require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (textures) with CORS headers
app.use('/api/ar-tryon/textures', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'public/textures')));

// Snap Lens Remote API endpoint - get_image
// This endpoint is called by the Snap Lens to fetch the texture
app.get('/get_image', (req, res) => {
  try {
    const { id } = req.query;
    
    // For now, return the latest texture
    // In production, you'd use the id to fetch specific textures
    const fs = require('fs');
    const texturesDir = path.join(__dirname, 'public/textures');
    
    // Get the most recent texture file
    const files = fs.readdirSync(texturesDir)
      .filter(file => file.startsWith('texture-') && file.endsWith('.png'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(texturesDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'No texture available' });
    }
    
    const latestTexture = files[0].name;
    const texturePath = path.join(texturesDir, latestTexture);
    
    // Set CORS headers for Snap Lens
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Content-Type', 'image/png');
    
    // Send the texture file
    res.sendFile(texturePath);
  } catch (error) {
    console.error('Error serving texture to Snap Lens:', error);
    res.status(500).json({ error: 'Failed to serve texture' });
  }
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Import routes
const wardrobeRoutes = require('./routes/wardrobeRoutes');
const paymentRoutes = require('./routes/payment');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/wardrobe', require('./routes/wardrobe'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ar-tryon', require('./routes/arTryOn'));
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});