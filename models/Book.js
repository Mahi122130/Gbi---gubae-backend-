const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true }, // History, Science, etc.
  isAvailable: { type: Boolean, default: true },
  coverImage: { type: String }, // Path to the uploaded image
  pdfUrl: { type: String },      // Path to the soft copy (if exists)
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', BookSchema);