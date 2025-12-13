const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this is the admin email
    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

    // Create new user
    const user = new User({ name, email, password, authProvider: 'local', role });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user registered with OAuth
    if (user.authProvider !== 'local') {
      return res.status(400).json({ 
        message: `This account is registered with ${user.authProvider}. Please use ${user.authProvider} login.` 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google OAuth Routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token and user data
    const userData = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
      authProvider: req.user.authProvider,
      role: req.user.role
    }));

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`);
  }
);

// Forgot Password - Send Reset Token and OTP via Email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Check if user registered with OAuth
    if (user.authProvider !== 'local') {
      return res.status(400).json({ 
        message: `This account is registered with ${user.authProvider}. Password reset is not available for OAuth accounts.` 
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Hash OTP before storing
    const bcrypt = require('bcryptjs');
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Store both OTP and token with expiry
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with both OTP and reset link
    try {
      await sendPasswordResetEmail(email, resetToken, otp, user.name);
      
      res.json({
        message: 'Password reset email sent successfully. Check your email for OTP and reset link.',
        email: user.email
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still return success but with a note
      res.json({
        message: 'Reset initiated. For development: OTP and token generated.',
        resetToken, // Remove in production
        otp, // Remove in production
        email: user.email,
        note: 'Email service not configured. Use the token/OTP above for testing.'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists and hasn't expired
    if (!user.resetPasswordOTP || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'No password reset request found' });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    const bcrypt = require('bcryptjs');
    const isValidOTP = await bcrypt.compare(otp, user.resetPasswordOTP);

    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Generate a temporary token for password reset
    const tempToken = jwt.sign(
      { userId: user._id, email: user.email, verified: true },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Short-lived token after OTP verification
    );

    res.json({
      message: 'OTP verified successfully',
      tempToken,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password (works with both token from link and tempToken from OTP)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token (either resetToken from email link or tempToken from OTP verification)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if reset request hasn't expired
    if (user.resetPasswordExpires && Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }

    // Update password
    user.password = newPassword;
    
    // Clear reset fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;