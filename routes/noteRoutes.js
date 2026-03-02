const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Note = require('../models/Note');

// 1. SAVE A NOTE
router.post('/', protect, async (req, res) => {
  try {
    const { bookId, content, pageNumber } = req.body;
    const newNote = new Note({ user: req.user.id, book: bookId, content, pageNumber });
    await newNote.save();
    res.status(201).json({ message: "Note saved!", note: await newNote.populate('book', 'title') });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. GET ALL BOOKS I HAVE NOTES FOR (The "Folder" List)
router.get('/my-folders', protect, async (req, res) => {
  try {
    // This finds unique books you have written notes for
    const bookIds = await Note.find({ user: req.user.id }).distinct('book');
    const Book = require('../models/Book');
    const books = await Book.find({ _id: { $in: bookIds } });
    res.json(books);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. GET NOTES FOR A SPECIFIC BOOK
router.get('/:bookId', protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, book: req.params.bookId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. DELETE A SPECIFIC NOTE
router.delete('/:noteId', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Security: Ensure only the owner can delete it
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this note" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. DOWNLOAD NOTES AS .TXT
router.get('/download/:bookId', protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, book: req.params.bookId }).populate('book', 'title');
    if (!notes.length) return res.status(404).json({ message: "No notes found" });

    const bookTitle = notes[0].book.title;
    let fileContent = `STUDY NOTES: ${bookTitle}\n------------------\n\n`;
    notes.forEach((n, i) => fileContent += `[Page ${n.pageNumber}] ${n.content}\n\n`);

    res.setHeader('Content-disposition', `attachment; filename=${bookTitle.replace(/\s+/g, '_')}.txt`);
    res.send(fileContent);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;