const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to MongoDB
    user = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'student'
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    // Create Token (Includes ID and Role)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET PROFILE & LIBRARY DETAILS (New functionality you requested)
exports.getProfile = async (req, res) => {
  try {
    // 1. Find the user by the ID stored in the token
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Get counts for the dashboard
    // Note: This tries to count from the 'Book' collection
    const totalBooks = await mongoose.model('Book').countDocuments();
    
    // For now, this is 0 until we create the 'Borrow' routes
    const borrowedCount = 0; 

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      libraryStats: {
        totalBooksInSystem: totalBooks,
        booksYouHaveBorrowed: borrowedCount
      },
      message: `Welcome back to the Gibi Library, ${user.role}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};