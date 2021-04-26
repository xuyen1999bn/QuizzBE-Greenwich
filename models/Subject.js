const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Question = require("./Question");

const levelTypes = ["EASY", "MEDIUM", "HARD"];

const SubjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default:
      "https://media.istockphoto.com/photos/illustration-of-smiling-happy-man-with-laptop-sitting-in-armchair-picture-id1226886130",
  },
  numOfPlayers: {
    type: Number,
    default: 0,
  },
  numOfQuestions: {
    type: Number,
    default: 15,
  },
  level: {
    type: String,
    default: "EASY",
    validate: {
      validator: function (v) {
        return levelTypes.includes(v);
      },
      message: "Question level is not valid",
    },
  },
  questionList: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  description: {
    type: String,
    default: "This is subject description",
  },
});

SubjectSchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    weights: {
      name: 5,
      description: 1,
    },
  }
);

const Subject = mongoose.model("Subject", SubjectSchema);

module.exports = Subject;
