const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
    status: { 
        type: String, 
        enum: ['pending', 'borrowed', 'returned'], // Make sure 'pending' is here in lowercase
        default: 'pending' 
    }
});

module.exports = mongoose.model('Borrow', borrowSchema);