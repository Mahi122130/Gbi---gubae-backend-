const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/discussionController");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

/* ------------------- QUESTIONS ------------------- */
// Ask a question (logged-in users only)
router.post("/ask", protect, upload.single("file"), ctrl.askQuestion);

// Get all questions (logged-in users only)
router.get("/questions", protect, ctrl.getQuestions);

// Edit own question (logged-in users only)
router.put("/edit-question/:id", protect, ctrl.editQuestion);

// Delete own question (logged-in users only)
router.delete("/delete-question/:id", protect, ctrl.deleteQuestion);

/* ------------------- ANSWERS ------------------- */
// Answer a question
router.post("/answer/:id", protect, upload.single("file"), ctrl.answerQuestion);

// Get answers for a question
router.get("/answers/:id", protect, ctrl.getAnswers);

// Edit own answer
router.put("/edit-answer/:id", protect, ctrl.editAnswer);

// Delete own answer
router.delete("/delete-answer/:id", protect, ctrl.deleteAnswer);

/* ------------------- LIKE ------------------- */
// Like an answer
router.put("/like/:id", protect, ctrl.likeAnswer);

module.exports = router;