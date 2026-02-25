const express = require('express');
const router = express.Router();
const { protect, librarianOnly } = require('../middleware/authMiddleware');
const { getAdminStats, getAllStudents, getAllBorrows } = require('../controllers/adminController');

router.get('/stats', protect, librarianOnly, getAdminStats);
router.get('/students', protect, librarianOnly, getAllStudents);
router.get('/borrows', protect, librarianOnly, getAllBorrows);

module.exports = router;