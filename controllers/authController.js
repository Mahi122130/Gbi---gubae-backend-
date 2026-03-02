const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// REGISTER USER (Existing)
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

// LOGIN USER (Existing)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

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

// GET PROFILE (Updated to include actual borrow counts)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    const totalBooks = await mongoose.model('Book').countDocuments();
    
    // NEW: Count actual borrows for this specific user
    const Borrow = mongoose.model('Borrow');
    const borrowedCount = await Borrow.countDocuments({ user: req.user.id, status: 'borrowed' });

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        bio: user.bio || "", // Added for frontend
        avatar: user.avatar || "" // Added for frontend
      },
      libraryStats: {
        totalBooksInSystem: totalBooks,
        booksYouHaveBorrowed: borrowedCount
      },
      message: `Welcome back, ${user.fullName}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PROFILE (New functionality)
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, bio, avatar } = req.body;
        
        // Find user and update fields
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { fullName, bio, avatar } },
            { new: true }
        ).select('-password');

        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};