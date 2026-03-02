const express = require('express');
const router = express.Router();
const { protect, librarianOnly } = require('../middleware/authMiddleware');

// Import the Controller
const adminController = require('../controllers/adminController');

// Define Routes - All prefixed with /api/admin
router.get('/stats', protect, librarianOnly, adminController.getAdminStats);
router.get('/students', protect, librarianOnly, adminController.getAllStudents);
router.delete('/student/:id', protect, librarianOnly, adminController.deleteUser);

// Book Management
router.put('/book/:id', protect, librarianOnly, adminController.updateBook);
router.delete('/book/:id', protect, librarianOnly, adminController.deleteBook);
router.get('/categories', adminController.getCategories);

// Borrowing Management
router.get('/borrows', protect, librarianOnly, adminController.getAllBorrows);
router.post('/approve-lend', protect, librarianOnly, adminController.approveLend);
router.post('/return-book', protect, librarianOnly, adminController.returnBook);

module.exports = router;