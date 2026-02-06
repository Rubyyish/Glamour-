require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const makeAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'np03cs4a230458@heraldcollege.edu.np';

    // Find user by email
    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log(`❌ User with email ${adminEmail} not found.`);
      console.log('Please register an account first.');
      process.exit(1);
    }

    // Update user to admin
    user.role = 'admin';
    user.isActive = true;
    await user.save();

    console.log('✅ Success!');
    console.log(`User ${user.name} (${user.email}) is now an admin.`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();
