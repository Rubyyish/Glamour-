const express = require('express');
const router = express.Router();
const { storage } = require('../config/firebaseAdmin');
const WardrobeItem = require('../models/WardrobeItem');
const firebaseAuth = require('../middleware/firebaseAuth');
const upload = require('../middleware/uploadMiddleware');
const { getDownloadURL } = require('firebase-admin/storage');

/**
 * @route GET /api/wardrobe/:userId
 * @desc Get all wardrobe items for a specific user
 * @access Private
 */
router.get('/:userId', firebaseAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Security check: Only allow users to fetch their own wardrobe
    if (userId !== req.user.uid) {
      return res.status(403).json({ error: "Access denied. You can only fetch your own wardrobe." });
    }

    const items = await WardrobeItem.find({ userId }).select('_id item_name image_url category color season brand');
    res.json(items);
  } catch (error) {
    console.error('Fetch wardrobe error:', error);
    res.status(500).json({ error: "Failed to fetch wardrobe" });
  }
});

/**
 * @route POST /api/wardrobe
 * @desc Upload a wardrobe item image and save details to MongoDB
 * @access Private
 */
router.post('/', firebaseAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user.uid;
    const { item_name, category, color, season, brand } = req.body;
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const destination = `wardrobe/${userId}/${fileName}`;

    const bucket = storage.bucket();
    const file = bucket.file(destination);

    // Upload buffer to Firebase Storage
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Make file public or get download URL
    // Note: getDownloadURL from 'firebase-admin/storage' provides a long-lived URL
    const imageUrl = await getDownloadURL(file);

    // Save to MongoDB
    const newItem = new WardrobeItem({
      userId,
      item_name,
      image_url: imageUrl,
      category,
      color,
      season,
      brand
    });

    await newItem.save();

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Upload wardrobe item error:', error);
    res.status(500).json({ error: "Failed to upload wardrobe item" });
  }
});

module.exports = router;
