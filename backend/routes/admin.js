const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wardrobe = require('../models/Wardrobe');
const adminAuth = require('../middleware/adminAuth');

// Get all users with statistics
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get wardrobe counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const wardrobeCount = await Wardrobe.countDocuments({ userId: user._id });
        const wardrobes = await Wardrobe.find({ userId: user._id });
        const itemCount = wardrobes.reduce((total, wardrobe) => total + wardrobe.items.length, 0);
        
        return {
          ...user.toObject(),
          stats: {
            wardrobes: wardrobeCount,
            items: itemCount
          }
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      total: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get single user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's wardrobes
    const wardrobes = await Wardrobe.find({ userId: user._id });
    const itemCount = wardrobes.reduce((total, wardrobe) => total + wardrobe.items.length, 0);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          wardrobes: wardrobes.length,
          items: itemCount
        },
        wardrobes
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, isActive, role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Prevent admin from removing their own admin role
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin privileges'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (role && ['user', 'admin'].includes(role)) user.role = role;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Delete user's wardrobes
    await Wardrobe.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalWardrobes = await Wardrobe.countDocuments();
    
    const wardrobes = await Wardrobe.find();
    const totalItems = wardrobes.reduce((total, wardrobe) => total + wardrobe.items.length, 0);

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Auth provider breakdown
    const localUsers = await User.countDocuments({ authProvider: 'local' });
    const googleUsers = await User.countDocuments({ authProvider: 'google' });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          recent: recentUsers
        },
        wardrobes: totalWardrobes,
        items: totalItems,
        authProviders: {
          local: localUsers,
          google: googleUsers
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
