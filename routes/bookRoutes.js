const express = require('express');
const router = express.Router();
const { protect, librarianOnly } = require('../middleware/authMiddleware');
const Book = require('../models/Book');
const Notification = require('../models/Notification');
const Borrow = require('../models/Borrow');

// 1. SEARCH BOOKS (Public)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const filter = query 
      ? { $or: [{ title: { $regex: query, $options: 'i' } }, { author: { $regex: query, $options: 'i' } }] }
      : {};
    const books = await Book.find(filter).limit(20);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ADD BOOK (Librarian Only)
router.post('/add', protect, librarianOnly, async (req, res) => {
  try {
    const { title, author, category } = req.body;
    const newBook = new Book({ title, author, category });
    const savedBook = await newBook.save();
    const notification = new Notification({ message: `New Wisdom Added: "${title}" by ${author}` });
    await notification.save();
    res.status(201).json({ message: "Book uploaded!", book: savedBook });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. BORROW BOOK (Authenticated Users)
router.post('/borrow', protect, async (req, res) => {
  try {
    const { bookId, returnInDays } = req.body; 
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!book.isAvailable) return res.status(400).json({ message: "Book is currently borrowed" });

    const days = returnInDays || 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const newBorrow = new Borrow({ user: req.user.id, book: bookId, dueDate: dueDate });
    await newBorrow.save();
    book.isAvailable = false;
    await book.save();

    res.status(201).json({ message: "Borrowed successfully!", dueDate: dueDate.toDateString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. RETURN BOOK (Librarian Only) <--- THIS WAS MISSING
router.post('/return', protect, librarianOnly, async (req, res) => {
  try {
    const { borrowId } = req.body;
    const borrowRecord = await Borrow.findById(borrowId);
    if (!borrowRecord) return res.status(404).json({ message: "Record not found" });
    if (borrowRecord.status === 'returned') return res.status(400).json({ message: "Already returned" });

    borrowRecord.status = 'returned';
    await borrowRecord.save();

    const book = await Book.findById(borrowRecord.book);
    if (book) { book.isAvailable = true; await book.save(); }

    res.json({ message: "Book returned successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PERSONAL STATUS (My Borrows)
router.get('/my-status', protect, async (req, res) => {
  try {
    const activeBorrows = await Borrow.find({ user: req.user.id, status: 'borrowed' }).populate('book');
    const statusReport = activeBorrows.map(item => {
      const today = new Date();
      const diffDays = Math.ceil((item.dueDate - today) / (1000 * 60 * 60 * 24));
      let alert = "Active";
      if (diffDays <= 2 && diffDays > 0) alert = `⚠️ Only ${diffDays} days left!`;
      else if (diffDays <= 0) alert = `🚨 OVERDUE!`;
      return { bookTitle: item.book.title, dueDate: item.dueDate, alert };
    });
    res.json(statusReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GLOBAL NOTIFICATIONS
router.get('/notifications', async (req, res) => {
  try {
    const alerts = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;