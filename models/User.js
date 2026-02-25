const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'librarian'], default: 'student' },
  wallet: { type: Number, default: 0 }, // For your ETB display
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' }
});

module.exports = mongoose.model('User', UserSchema);