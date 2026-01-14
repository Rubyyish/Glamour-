const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { extractTexture, getAverageColor, makeSeamless } = require('../utils/textureUtils');
const Jimp = require('jimp');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Ensure output directory exists
const outputDir = path.join(__dirname, '../public/textures');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Global state for latest texture (can be replaced with Redis for production)
let latestTextureState = {
  texturePath: null,
  garment: 'sweatshirt',
  version: 0
};

// ============================================
// Process Garment & Extract Texture
// ============================================

/**
 * POST /api/ar-tryon/process-garment
 * Upload an image and process it into a seamless texture
 */
router.post('/process-garment', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No image uploaded' 
      });
    }

    // Get garment type from request
    const garmentType = req.body.garment || 'sweatshirt';
    latestTextureState.garment = garmentType;

    console.log(`Processing garment: ${garmentType}`);

    // Extract texture from image
    const textureBuffer = await extractTexture(req.file.buffer);

    // Save texture to disk
    const filename = `texture-${uuidv4()}.png`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, textureBuffer);

    latestTextureState.texturePath = filepath;
    latestTextureState.version++;

    const textureUrl = `/api/ar-tryon/textures/${filename}`;

    console.log(`Texture saved: ${filename} (v${latestTextureState.version})`);

    res.json({ 
      success: true, 
      texture: textureUrl,
      filename,
      version: latestTextureState.version,
      garment: garmentType
    });
  } catch (error) {
    console.error('Garment processing failed:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * GET /api/ar-tryon/latest-texture
 * Get the file for the latest processed texture
 */
router.get('/latest-texture', (req, res) => {
  try {
    if (!latestTextureState.texturePath || !fs.existsSync(latestTextureState.texturePath)) {
      return res.status(404).json({ 
        success: false,
        error: 'No texture available' 
      });
    }
    res.sendFile(latestTextureState.texturePath);
  } catch (error) {
    console.error('Error serving latest texture:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * GET /api/ar-tryon/latest-config
 * Get the latest texture configuration (garment type, version)
 */
router.get('/latest-config', (req, res) => {
  res.json({
    garment: latestTextureState.garment,
    version: latestTextureState.version,
    textureUrl: latestTextureState.texturePath ? `/api/ar-tryon/textures/latest` : null
  });
});

/**
 * POST /api/ar-tryon/latest-config
 * Update the garment type configuration
 */
router.post('/latest-config', (req, res) => {
  try {
    if (req.body.garment) {
      latestTextureState.garment = req.body.garment;
      console.log(`Garment updated to: ${latestTextureState.garment}`);
    }
    
    res.json({ 
      success: true, 
      garment: latestTextureState.garment,
      version: latestTextureState.version
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Save processed texture to user profile
 */
router.post('/save-texture', auth, async (req, res) => {
  try {
    const { filename, garmentType, description } = req.body;

    if (!filename) {
      return res.status(400).json({ 
        success: false, 
        message: 'Texture filename is required' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add new texture
    user.textures.push({
      garmentType: garmentType || 'shirt',
      textureUrl: `/api/ar-tryon/textures/${filename}`,
      textureFilename: filename,
      textureMetadata: {
        width: 1024,
        height: 1024,
        seamless: true,
        version: latestTextureState.version
      },
      description: description || '',
      isActive: true
    });

    await user.save();

    res.json({ 
      success: true, 
      message: 'Texture saved successfully',
      texture: user.textures[user.textures.length - 1]
    });
  } catch (error) {
    console.error('Error saving texture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save texture' 
    });
  }
});

/**
 * Get all textures for current user
 */
router.get('/my-textures', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('textures');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Sort by most recent first
    const textures = user.textures.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ 
      success: true, 
      textures 
    });
  } catch (error) {
    console.error('Error fetching textures:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch textures' 
    });
  }
});

/**
 * Delete a texture
 */
router.delete('/textures/:textureId', auth, async (req, res) => {
  try {
    const { textureId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find and delete texture
    const texture = user.textures.id(textureId);
    if (!texture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Texture not found' 
      });
    }

    // Delete file from disk
    const filepath = path.join(outputDir, texture.textureFilename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    user.textures.id(textureId).deleteOne();
    await user.save();

    res.json({ 
      success: true, 
      message: 'Texture deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting texture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete texture' 
    });
  }
});

// Save AR try-on photo
router.post('/save', auth, async (req, res) => {
  try {
    const { itemName, itemImage, itemCategory, photoData } = req.body;

    if (!photoData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Photo data is required' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add new AR photo
    user.arTryOnPhotos.push({
      itemName: itemName || 'AR Try-On',
      itemImage: itemImage || '',
      itemCategory: itemCategory || 'General',
      photoData,
      createdAt: new Date()
    });

    await user.save();

    res.json({ 
      success: true, 
      message: 'AR photo saved successfully',
      photo: user.arTryOnPhotos[user.arTryOnPhotos.length - 1]
    });
  } catch (error) {
    console.error('Error saving AR photo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save AR photo' 
    });
  }
});

// Get all AR try-on photos for user
router.get('/photos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('arTryOnPhotos');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Sort by most recent first
    const photos = user.arTryOnPhotos.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ 
      success: true, 
      photos 
    });
  } catch (error) {
    console.error('Error fetching AR photos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch AR photos' 
    });
  }
});

// Delete AR try-on photo
router.delete('/photos/:photoId', auth, async (req, res) => {
  try {
    const { photoId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Remove photo
    user.arTryOnPhotos = user.arTryOnPhotos.filter(
      photo => photo._id.toString() !== photoId
    );

    await user.save();

    res.json({ 
      success: true, 
      message: 'AR photo deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting AR photo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete AR photo' 
    });
  }
});

// Check if user has tried on a specific item
router.get('/check/:itemName', auth, async (req, res) => {
  try {
    const { itemName } = req.params;

    const user = await User.findById(req.user._id).select('arTryOnPhotos');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const hasTried = user.arTryOnPhotos.some(
      photo => photo.itemName === itemName
    );

    res.json({ 
      success: true, 
      hasTried 
    });
  } catch (error) {
    console.error('Error checking AR try-on:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check AR try-on' 
    });
  }
});

module.exports = router;
