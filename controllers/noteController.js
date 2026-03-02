const Note = require('../models/Note');
const mongoose = require('mongoose');

// 1. SAVE A NEW NOTE
exports.addNote = async (req, res) => {
    try {
        const { bookId, content, pageNumber } = req.body;

        // Validation: Ensure bookId is a valid MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: "Invalid Book ID" });
        }

        const note = new Note({
            user: req.user.id, // From protect middleware
            book: bookId,
            content,
            pageNumber: pageNumber || 0
        });

        await note.save();
        
        // Return the note and populate book info immediately for the frontend
        const savedNote = await Note.findById(note._id).populate('book', 'title author');
        
        res.status(201).json({ message: "Note saved!", note: savedNote });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. GET NOTES FOR A SPECIFIC BOOK
exports.getNotesByBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: "Invalid Book ID" });
        }

        const notes = await Note.find({ 
            user: req.user.id, 
            book: bookId 
        })
        .sort({ createdAt: -1 }); // Newest notes first

        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. UPDATE AN EXISTING NOTE
exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, pageNumber } = req.body;

        const note = await Note.findOneAndUpdate(
            { _id: id, user: req.user.id }, // Security: User can only update their own note
            { content, pageNumber },
            { new: true }
        );

        if (!note) return res.status(404).json({ message: "Note not found" });

        res.json({ message: "Note updated!", note });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. DELETE A NOTE
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        
        if (!note) return res.status(404).json({ message: "Note not found" });

        res.json({ message: "Note deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};