const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const upload = require('../middleware/uploadMiddleware');

// 1. ADD NEW BOOK (Librarian Only)
router.post('/add', protect, upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, author, category, description } = req.body;

        // Safety check: if req.files exists, use the path; otherwise, set to null
        // This prevents the "Cannot read properties of undefined" error
        const coverImage = (req.files && req.files['cover']) ? req.files['cover'][0].path : null;
        const pdfUrl = (req.files && req.files['pdf']) ? req.files['pdf'][0].path : null;

        const newBook = new Book({
            title,
            author,
            category,
            description,
            coverImage,
            pdfUrl,
            isAvailable: true
        });

        await newBook.save();
        res.status(201).json({ message: "Book Uploaded!", book: newBook });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. SEARCH BOOKS (Public/Student)
router.get('/search', async (req, res) => {
    try {
        const { query, category } = req.query;
        let filter = {};
        
        if (query) filter.title = { $regex: query, $options: 'i' };
        if (category) filter.category = category;

        const books = await Book.find(filter);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. BORROW REQUEST (Student)
router.post('/borrow', protect, async (req, res) => {
    try {
        const { bookId } = req.body;
        const book = await Book.findById(bookId);

        if (!book) return res.status(404).json({ message: "Book not found" });
        
        // Validation to ensure book is not already out
        if (!book.isAvailable) {
            return res.status(400).json({ message: "Book is currently borrowed by someone else" });
        }

        const newBorrow = new Borrow({
            user: req.user.id,
            book: bookId,
            status: 'pending' // Admin/Librarian will approve this later
        });

        await newBorrow.save();
        res.status(201).json({ message: "Borrow request sent to Admin", borrow: newBorrow });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;