const Borrow = require('../models/Borrow');
const Book = require('../models/Book');

exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book || !book.isAvailable) {
      return res.status(400).json({ message: "Book is not available" });
    }

    // 1. Create Borrow Record
    const newBorrow = new Borrow({
      user: req.user.id, // From 'protect' middleware
      book: bookId
    });
    await newBorrow.save();

    // 2. Mark Book as unavailable
    book.isAvailable = false;
    await book.save();

    res.json({ message: "Success! You have borrowed the book.", borrowInfo: newBorrow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};