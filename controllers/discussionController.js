const Question = require("../models/Question");
const Answer = require("../models/Answer");

/* ------------------- ASK QUESTION ------------------- */
exports.askQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      user: req.user.fullName || req.user.id, // use logged-in user's fullName
      title: req.body.title,
      description: req.body.description,
      file: req.file ? req.file.filename : null
    });
    res.json(question);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* ------------------- GET ALL QUESTIONS ------------------- */
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* ------------------- ANSWER QUESTION ------------------- */
exports.answerQuestion = async (req, res) => {
  try {
    const answer = await Answer.create({
      questionId: req.params.id,
      user: req.user.fullName || req.user.id, // use logged-in user's fullName
      text: req.body.text,
      file: req.file ? req.file.filename : null,
      likes: 0
    });
    res.json(answer);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* ------------------- GET ANSWERS ------------------- */
exports.getAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.id }).sort({ createdAt: -1 });
    res.json(answers);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* ------------------- LIKE ANSWER ------------------- */
exports.likeAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json("Answer not found");

    answer.likes++;
    await answer.save();
    res.json(answer);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* ------------------- EDIT QUESTION (OWNER ONLY) ------------------- */
exports.editQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json("Question not found");

    if (question.user !== req.user.fullName) // owner check
      return res.status(403).json("You can only edit your own question");

    question.title = req.body.title || question.title;
    question.description = req.body.description || question.description;

    await question.save();
    res.json({ message: "Question updated", question });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* ------------------- DELETE QUESTION (OWNER ONLY) ------------------- */
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json("Question not found");

    if (question.user !== req.user.fullName) // owner check
      return res.status(403).json("You can only delete your own question");

    await Answer.deleteMany({ questionId: question._id }); // delete related answers
    await question.deleteOne();

    res.json({ message: "Question and its answers deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* ------------------- EDIT ANSWER (OWNER ONLY) ------------------- */
exports.editAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json("Answer not found");

    if (answer.user !== req.user.fullName) // owner check
      return res.status(403).json("You can only edit your own answer");

    answer.text = req.body.text || answer.text;

    await answer.save();
    res.json({ message: "Answer updated", answer });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

/* ------------------- DELETE ANSWER (OWNER ONLY) ------------------- */
exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json("Answer not found");

    if (answer.user !== req.user.fullName) // owner check
      return res.status(403).json("You can only delete your own answer");

    await answer.deleteOne();
    res.json({ message: "Answer deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};