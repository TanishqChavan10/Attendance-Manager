const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import User model
const User = require('../models/User');

// MongoDB connection URL
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-manager';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected successfully');
  
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    
    if (existingUser) {
      console.log('Test user already exists');
      mongoose.connection.close();
      return;
    }
    
    // Create a password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create a new user
    const newUser = new User({
      username: 'testuser',
      password: hashedPassword,
      requiredAttendancePercentage: 75
    });
    
    // Save the user to the database
    await newUser.save();
    console.log('Test user created successfully');
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test user:', error);
    mongoose.connection.close();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
}); 