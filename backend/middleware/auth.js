const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('🔐 Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Auth middleware: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully, userId:', decoded.userId);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ Auth middleware: User not found for token, userId:', decoded.userId);
      return res.status(401).json({ message: 'Token is not valid - user not found' });
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('❌ Auth middleware: Token expired at', error.expiredAt);
      return res.status(401).json({ message: 'Token expired', expired: true });
    }
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Auth middleware: Invalid token format -', error.message);
      return res.status(401).json({ message: 'Invalid token format' });
    }
    console.error('❌ Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;