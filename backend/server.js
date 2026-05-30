require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const passport = require('./config/passport');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5173',
  'https://glamour-livid.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean).map(o => o.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    const clean = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(clean)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
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
// Snap Remote API expects specific response format
app.get('/get_image', (req, res) => {
  console.log('🔵 Snap Lens requesting texture via Remote API');
  console.log('Query params:', req.query);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  
  try {
    const { id } = req.query;
    
    // For now, return the latest texture
    // In production, you'd use the id to fetch specific textures
    const fs = require('fs');
    const texturesDir = path.join(__dirname, 'public/textures');
    
    // Ensure directory exists
    if (!fs.existsSync(texturesDir)) {
      console.log('❌ Textures directory does not exist:', texturesDir);
      fs.mkdirSync(texturesDir, { recursive: true });
      console.log('✅ Created textures directory');
    }
    
    // Get the most recent texture file
    const files = fs.readdirSync(texturesDir)
      .filter(file => file.startsWith('texture-') && file.endsWith('.png'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(texturesDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length === 0) {
      console.log('❌ No texture files found in', texturesDir);
      // Return proper error response for Snap Remote API
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      return res.status(404).json({ 
        error: 'No texture available',
        message: 'Please upload a garment image first.' 
      });
    }
    
    const latestTexture = files[0].name;
    const texturePath = path.join(texturesDir, latestTexture);
    
    console.log('✅ Serving texture:', latestTexture);
    console.log('📁 File path:', texturePath);
    console.log('📊 File size:', fs.statSync(texturePath).size, 'bytes');
    
    // Set CORS headers for Snap Lens - must be permissive
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    
    // Set content type explicitly
    res.header('Content-Type', 'image/png');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Send the texture file as binary
    res.sendFile(texturePath, (err) => {
      if (err) {
        console.error('❌ Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to send texture' });
        }
      } else {
        console.log('✅ Texture sent successfully');
      }
    });
  } catch (error) {
    console.error('❌ Error serving texture to Snap Lens:', error);
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Failed to serve texture', 
      details: error.message 
    });
  }
});

// Handle OPTIONS preflight for CORS
app.options('/get_image', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});