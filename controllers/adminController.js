const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');

// DASHBOARD STATS
exports.getAdminStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const borrowedBooks = await Borrow.countDocuments({ status: 'borrowed' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const lateReturns = await Borrow.countDocuments({ 
      status: 'borrowed', 
      borrowDate: { $lt: twoWeeksAgo } 
    });

    res.json({
      totalBooks,
      borrowedBooks,
      lateReturns,
      totalStudents,
      totalBirr: 0 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// STUDENT LIST
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// BORROW RECORDS (Fixed the export that caused your crash)
exports.getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate('user', 'fullName email')
      .populate('book', 'title author')
      .sort({ borrowDate: -1 });
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};