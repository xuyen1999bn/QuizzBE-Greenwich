const HttpError = require("../models/HttpError");
const { validationResult } = require("express-validator");
const Question = require("../models/Question");
const User = require("../models/User");
const Subject = require("../models/Subject");

const createQuestion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  let user;
  try {
    user = await User.findById(req.userId);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when find user to authorize!!!",
      500
    );
    return next(err);
  }
  if (!user) {
    const err = new HttpError("Can not find user to authorized", 401);
    return next(err);
  }
  const {
    name,
    image,
    level,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOptionPosition,
    subject,
    point,
  } = req.body;
  let updatedSubject;
  try {
    updatedSubject = await Subject.findById(subject);
  } catch (error) {
    const err = new HttpError("Can not find subject to add question to", 404);
    return next(err);
  }
  if (!updatedSubject) {
    const err = new HttpError("Can not find subject to add question to", 404);
    return next(err);
  }
  const newQuestion = new Question({
    name,
    image,
    level,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOptionPosition,
    subject,
    point,
    creator: req.userId,
    isActive: user.role === 2 ? true : false,
  });
  try {
    await newQuestion.save();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when save new question!!!",
      500
    );
    return next(err);
  }
  try {
    updatedSubject.questionList.push(newQuestion._id);
    await updatedSubject.save();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when save updated subject!!!",
      500
    );
    return next(err);
  }
  return res.status(201).json({
    newQuestion,
  });
};

const updateQuestion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  let user;
  try {
    user = await User.findById(req.userId);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when finding user to authorize!!!",
      500
    );
    return next(err);
  }
  if (!user) {
    const err = new HttpError("Can not find user to authorized", 401);
    return next(err);
  }
  const {
    name,
    image,
    level,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOptionPosition,
    point,
  } = req.body;
  let updatedQuestion;
  try {
    updatedQuestion = await Question.findById(req.params.id);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when finding question to update!!!",
      500
    );
    return next(err);
  }
  if (!updatedQuestion) {
    const err = new HttpError("Can not finding question to update!!!", 404);
    return next(err);
  }
  if (updatedQuestion.creator.toString() !== req.userId) {
    const err = new HttpError(
      "Ypu do not have permission to update this question!!!",
      401
    );
    return next(err);
  }
  try {
    updatedQuestion = await Question.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        name,
        image,
        level,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOptionPosition,
        point,
      },
      {
        new: true,
      }
    );
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when finding question to update!!!",
      500
    );
    return next(err);
  }
  return res.status(200).json(updatedQuestion);
};

const deleteQuestion = async (req, res, next) => {
  let question;
  try {
    question = await Question.findById(req.params.id);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when find question to delete!!!",
      500
    );
    return next(err);
  }
  if (!question) {
    const err = new HttpError("Can not find question to delete", 404);
    return next(err);
  }
  if (req.userId != question.creator && req.role !== 2) {
    const err = new HttpError(
      "You do not have authorization to delete this question!!!",
      401
    );
    return next(err);
  }
  let updatedSubject;
  try {
    updatedSubject = await Subject.findById(question.subject);
  } catch (error) {
    const err = new HttpError(
      "Can not find subject to remove question from",
      404
    );
    return next(err);
  }
  if (!updatedSubject) {
    const err = new HttpError("Can not find subject to add question to", 404);
    return next(err);
  }
  try {
    await question.remove();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when delete question!!!",
      500
    );
    return next(err);
  }
  try {
    updatedSubject.questionList = updatedSubject.questionList.filter(
      (q) => q.toString() !== req.params.id
    );
    await updatedSubject.save();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when save updated subject!!!",
      500
    );
    return next(err);
  }
  return res.json({
    code: "200",
    message: "Delete question successfully",
  });
};

const getQuestionById = async (req, res, next) => {
  let question;
  let user;
  try {
    user = await User.findById(req.userId);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when find user to authorize!!!",
      500
    );
    return next(err);
  }
  if (!user) {
    const err = new HttpError("Can not find user to authorized", 401);
    return next(err);
  }
  try {
    question = await Question.findById(req.params.id);
  } catch (error) {
    const err = new HttpError("Server error.Some thing went wrong!!!", 500);
    return next(err);
  }
  if (!question) {
    const err = new HttpError("Can not find question with this id", 404);
    return next(err);
  }
  if (user.role === 1) {
    question.correctOptionPosition = undefined;
  }
  return res.json({
    question,
  });
};

const getListActiveQuestion = async (req, res, next) => {
  let questions;
  let user;
  try {
    user = await User.findById(req.userId);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when find user to authorize!!!",
      500
    );
    return next(err);
  }
  if (!user) {
    const err = new HttpError("Can not find user to authorized", 401);
    return next(err);
  }
  try {
    if (user.role === 1) {
      questions = await Question.find({ isActive: true }).select(
        "-correctOptionPosition"
      );
    } else {
      questions = await Question.find({ isActive: true }).populate(
        "subject",
        "name"
      );
    }
  } catch (error) {
    const err = new HttpError("Server error. Some thing went wrong!!!", 500);
    return next(err);
  }
  if (!questions) {
    const err = new HttpError("Can not find active questions", 404);
    return next(err);
  }
  return res.json({
    questions,
  });
};

const getListActiveQuestionBySubject = async (req, res, next) => {
  let questions;
  let user;
  try {
    user = await User.findById(req.userId);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when find user to authorize!!!",
      500
    );
    return next(err);
  }
  if (!user) {
    const err = new HttpError("Can not find user to authorized", 401);
    return next(err);
  }
  try {
    let options = {
      isActive: true,
      subject: req.params.id,
    };
    if (user.role === 1) {
      questions = await Question.find(options).select("-correctOptionPosition");
    } else {
      questions = await Question.find(options).populate("subject", "name");
    }
  } catch (error) {
    const err = new HttpError("Server error. Some thing went wrong!!!", 500);
    return next(err);
  }
  if (!questions) {
    const err = new HttpError("Can not find active questions by subject", 404);
    return next(err);
  }
  return res.json({
    questions,
  });
};

const getListPendingQuestion = async (req, res, next) => {
  let questions;
  let user;
  try {
    user = await User.findById(req.userId);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when find user to authorize!!!",
      500
    );
    return next(err);
  }
  if (!user) {
    const err = new HttpError("Can not find user to authorized", 401);
    return next(err);
  }
  try {
    questions = await Question.find({ isActive: false }).populate(
      "subject",
      "name"
    );
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when find pending questions!!!",
      500
    );
    return next(err);
  }
  if (!questions) {
    const err = new HttpError("Can not find pending questions", 404);
    return next(err);
  }
  return res.json({
    questions,
  });
};

const activateQuestion = async (req, res, next) => {
  let question;
  try {
    question = await Question.findById(req.params.id);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when find question to activate!!!",
      500
    );
    return next(err);
  }
  if (!question) {
    const err = new HttpError("Can not find question to activate!!!", 404);
    return next(err);
  }
  question.isActive = true;
  try {
    await question.save();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when save updated question!!!",
      500
    );
    return next(err);
  }
  return res.json({
    code: "200",
    message: "Activate question successfully",
  });
};

module.exports = {
  createQuestion,
  getListActiveQuestion,
  deleteQuestion,
  getQuestionById,
  activateQuestion,
  getListPendingQuestion,
  updateQuestion,
  getListActiveQuestionBySubject,
};
