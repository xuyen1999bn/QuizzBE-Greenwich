const HttpError = require("../models/HttpError");
const { validationResult } = require("express-validator");
const Subject = require("../models/Subject");
const Question = require("../models/Question");

const createSubject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { name, image, level, description } = req.body;
  const newSubject = new Subject({
    name,
    image,
    level,
    description,
  });
  try {
    await newSubject.save();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when creating subject!!!",
      500
    );
    return next(err);
  }
  return res.status(201).json({
    newSubject,
  });
};

const updateSubject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { name, image, level, description } = req.body;
  let updatedSubject;

  try {
    updatedSubject = await Subject.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        name,
        image,
        level,
        description,
      },
      {
        new: true,
      }
    );
  } catch (error) {
    const err = new HttpError(
      "Server error. Some thing went wrong when updating subject!!!",
      500
    );
    return next(err);
  }

  if (!updatedSubject) {
    const err = new HttpError(
      "Can not update this subject. Please try again",
      403
    );
    return next(err);
  }

  return res.status(200).json(updatedSubject);
};

const deleteSubject = async (req, res, next) => {
  let subject;
  try {
    subject = await Subject.findById(req.params.id);
    await Question.deleteMany({ subject: req.params.id });
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when finding subject to delete!!!",
      500
    );
    return next(err);
  }
  if (!subject) {
    const err = new HttpError("Can not find subject to delete", 404);
    return next(err);
  }
  try {
    await subject.remove();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when removing subject!!!",
      500
    );
    return next(err);
  }
  return res.json({
    code: "200",
    message: "Delete subject successfully",
  });
};

const removeQuestionFromSubject = async (req, res, next) => {
  let subject;
  try {
    subject = await Subject.findById(req.params.id);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when finding subject to delete!!!",
      500
    );
    return next(err);
  }
  if (!subject) {
    const err = new HttpError("Can not find subject to delete question", 404);
    return next(err);
  }
  let question;
  try {
    question = subject.questionList.find(
      (q) => q.toString() === req.params.qId
    );
    if (!question) {
      const err = new HttpError("Can not find question to delete!!!", 404);
      return next(err);
    } else {
      subject.questionList = subject.questionList.filter(
        (q) => q.toString() !== req.params.qId
      );
    }
    await subject.save();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when removing subject!!!",
      500
    );
    return next(err);
  }
  return res.json({
    code: "200",
    message: "Delete question from subject successfully",
  });
};

const getListSubject = async (req, res, next) => {
  let subjects;
  try {
    subjects = await Subject.find();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when get list subjects!!!",
      500
    );
    return next(err);
  }
  if (!subjects) {
    const err = new HttpError("Can not find subjects", 404);
    return next(err);
  }
  return res.json({
    subjects,
  });
};

const getSubjectById = async (req, res, next) => {
  let subject;
  try {
    subject = await Subject.findById(req.params.id);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when finding subject by id!!!",
      500
    );
    return next(err);
  }
  if (!subject) {
    const err = new HttpError("Can not find subject by this id", 404);
    return next(err);
  }
  return res.json({
    subject,
  });
};

const searchSubject = async (req, res, next) => {
  let subjects;
  try {
    subjects = await Subject.find({
      $text: { $search: req.query.term, $caseSensitive: false },
    });
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when search list subjects by term!!!",
      500
    );
    return next(err);
  }
  if (!subjects) {
    const err = new HttpError("Can not search subjects by term", 404);
    return next(err);
  }
  return res.json(subjects);
};

module.exports = {
  createSubject,
  getListSubject,
  deleteSubject,
  getSubjectById,
  updateSubject,
  removeQuestionFromSubject,
  searchSubject,
};
