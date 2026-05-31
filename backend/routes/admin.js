const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wardrobe = require('../models/Wardrobe');
const Transaction = require('../models/Transaction');
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

    // Transaction statistics
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const failedTransactions = await Transaction.countDocuments({ status: 'failed' });
    const flaggedTransactions = await Transaction.countDocuments({ flaggedForReview: true });

    // Calculate total revenue
    const revenueData = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Recent transactions (last 7 days)
    const recentTransactions = await Transaction.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo },
      status: 'completed'
    });

    // Revenue last 7 days
    const recentRevenueData = await Transaction.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const recentRevenue = recentRevenueData.length > 0 ? recentRevenueData[0].total : 0;

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
        },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: pendingTransactions,
          failed: failedTransactions,
          flagged: flaggedTransactions,
          recent: recentTransactions
        },
        revenue: {
          total: totalRevenue,
          recent: recentRevenue
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

// Get all transactions with filters
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const { status, flagged, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (flagged === 'true') query.flaggedForReview = true;
    if (userId) query.userId = userId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email profilePicture')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Get single transaction details
router.get('/transactions/:id', adminAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email profilePicture authProvider createdAt')
      .populate('reviewedBy', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
});

// Flag/unflag transaction for review
router.patch('/transactions/:id/flag', adminAuth, async (req, res) => {
  try {
    const { flagged, adminNotes } = req.body;
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction.flaggedForReview = flagged;
    if (adminNotes) transaction.adminNotes = adminNotes;
    
    if (flagged) {
      transaction.reviewedBy = req.user._id;
      transaction.reviewedAt = new Date();
    }

    await transaction.save();

    res.json({
      success: true,
      message: flagged ? 'Transaction flagged for review' : 'Transaction unflagged',
      transaction
    });
  } catch (error) {
    console.error('Flag transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction'
    });
  }
});

// Add admin notes to transaction
router.patch('/transactions/:id/notes', adminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { 
        adminNotes,
        reviewedBy: req.user._id,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Notes added successfully',
      transaction
    });
  } catch (error) {
    console.error('Add notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add notes'
    });
  }
});

// Get transaction statistics
router.get('/transactions/stats/overview', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Revenue by status
    const revenueByStatus = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Top items
    const topItems = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$itemName',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Daily revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyRevenue = await Transaction.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        revenueByStatus,
        topItems,
        dailyRevenue
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics'
    });
  }
});

module.exports = router;
