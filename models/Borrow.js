const mongoose = require('mongoose');

const BorrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowDate: { type: Date, default: Date.now },
  
  dueDate: { type: Date, required: false }, 
  status: { type: String, enum: ['borrowed', 'returned'], default: 'borrowed' }
});

module.exports = mongoose.model('Borrow', BorrowSchema);