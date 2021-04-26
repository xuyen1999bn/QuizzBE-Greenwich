const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");
const Subject = require("./Subject");

const GameSchema = new Schema({
  player: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: "Subject",
  },
  score: {
    type: Number,
    default: 0,
  },
  isPaused: {
    type: Boolean,
    default: false,
  },
  isFinished: {
    type: Boolean,
    default: false,
  },
  time: {
    type: Number,
    default: 120,
  },
  currentQuestionPosition: {
    type: Number,
    default: 0,
  },
  isGetRightAnswer: {
    type: Boolean,
    default: false,
  },
  isRemoveTwoWrongAnswer: {
    type: Boolean,
    default: false,
  },
  isCalledSupport: {
    type: Boolean,
    default: false,
  },
});

const Game = mongoose.model("Game", GameSchema);

module.exports = Game;
