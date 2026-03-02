const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'librarian'], default: 'student' },
  
  // --- NEW FIELDS FOR PROFILE UPDATES ---
  bio: { 
    type: String, 
    default: "Books are a uniquely portable magic." 
  },
  avatar: { 
    type: String, 
    default: "" // This will store the URL of the profile picture
  },
  // --------------------------------------

  wallet: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);