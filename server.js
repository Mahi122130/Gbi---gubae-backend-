const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

/* ---------------- MODELS (For Inline Logic) ---------------- */
const Question = require('./models/Question');
const Answer = require('./models/Answer');

/* ---------------- STANDARD ROUTES ---------------- */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/discussion', require('./routes/discussionRoutes'));

// NEW: Added the Notes route for the Notebook feature
app.use('/api/notes', require('./routes/noteRoutes'));

/* ---------------- DISCUSSION LOGIC (Refactored for Security) ---------------- */

/* Edit Question (Owner Only) */
app.put("/api/discussion/edit-question/:id", protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json("Question not found");

    // Check ownership using the ID from the JWT token (req.user.id)
    if (question.user.toString() !== req.user.id)
      return res.status(403).json("You can only edit your own question");

    question.title = title || question.title;
    question.description = description || question.description;

    await question.save();
    res.json({ message: "Question updated", question });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* Edit Answer (Owner Only) */
app.put("/api/discussion/edit-answer/:id", protect, async (req, res) => {
  try {
    const { text } = req.body;

    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json("Answer not found");

    if (answer.user.toString() !== req.user.id)
      return res.status(403).json("You can only edit your own answer");

    answer.text = text || answer.text;

    await answer.save();
    res.json({ message: "Answer updated", answer });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* Delete Question (Owner Only) */
app.delete("/api/discussion/delete-question/:id", protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).json("Question not found");
    if (question.user.toString() !== req.user.id)
      return res.status(403).json("You can only delete your own question");

    await question.deleteOne();

    // Clean up: Delete all answers associated with this question
    await Answer.deleteMany({ questionId: req.params.id });

    res.json({ message: "Question and its answers deleted" });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* Delete Answer (Owner Only) */
app.delete("/api/discussion/delete-answer/:id", protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) return res.status(404).json("Answer not found");
    if (answer.user.toString() !== req.user.id)
      return res.status(403).json("You can only delete your own answer");

    await answer.deleteOne();
    res.json({ message: "Answer deleted" });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 System Online: Port ${PORT}`)
);