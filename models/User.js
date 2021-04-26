const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Game = require("./Game");

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default:
      "https://media.istockphoto.com/photos/illustration-of-smiling-happy-man-with-laptop-sitting-in-armchair-picture-id1226886130",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  resetPasswordToken: {
    type: String,
  },
  role: {
    type: Number,
    default: 1,
  },
  recentActivity: [
    {
      type: Schema.Types.ObjectId,
      ref: "Game",
    },
  ],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
