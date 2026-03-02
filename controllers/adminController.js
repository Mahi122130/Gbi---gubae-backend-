const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');

// 1. DASHBOARD STATS
exports.getAdminStats = async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const borrowedBooks = await Borrow.countDocuments({ status: 'borrowed' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        res.json({ totalBooks, borrowedBooks, totalStudents });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. USER MANAGEMENT
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find().select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. BOOK CATEGORIES
exports.getCategories = async (req, res) => {
    try {
        const categories = await Book.distinct('category');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. BORROW MANAGEMENT (LIST ALL)
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

// 5. APPROVE LEND (Admin lends the book)
exports.approveLend = async (req, res) => {
    try {
        const { borrowId } = req.body;
        const record = await Borrow.findById(borrowId);
        if (!record) return res.status(404).json({ message: "Request not found" });

        record.status = 'borrowed';
        await record.save();

        // Mark the book as unavailable
        await Book.findByIdAndUpdate(record.book, { isAvailable: false });

        res.json({ message: "Book officially lent to user" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. RETURN BOOK (Admin receives the book back)
exports.returnBook = async (req, res) => {
    try {
        const { borrowId } = req.body;
        const record = await Borrow.findById(borrowId);
        if (!record) return res.status(404).json({ message: "Record not found" });

        record.status = 'returned';
        await record.save();

        // Mark the book as available again
        await Book.findByIdAndUpdate(record.book, { isAvailable: true });

        res.json({ message: "Book returned and marked as Available" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 7. BOOK UPDATES
exports.updateBook = async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Book updated!", updatedBook });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Book deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};