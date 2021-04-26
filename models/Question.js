const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Subject = require("../models/Subject");
const User = require("../models/User");

const levelTypes = ["EASY", "MEDIUM", "HARD"];

const QuestionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default:
      "https://media.istockphoto.com/photos/illustration-of-smiling-happy-man-with-laptop-sitting-in-armchair-picture-id1226886130",
  },
  optionA: {
    type: String,
    required: true,
  },
  optionB: {
    type: String,
    required: true,
  },
  optionC: {
    type: String,
    required: true,
  },
  optionD: {
    type: String,
    required: true,
  },
  correctOptionPosition: {
    type: Number,
    required: true,
  },
  level: {
    type: String,
    default: "EASY",
    validate: {
      validator: function (v) {
        return levelTypes.includes(v);
      },
      message: "Question Level is not valid",
    },
  },
  point: {
    type: Number,
    default: 10,
  },
  subject: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Subject",
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;
