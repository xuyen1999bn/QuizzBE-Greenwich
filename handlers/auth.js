const HttpError = require("../models/HttpError");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { email, password } = req.body;
  let existedUser;
  try {
    existedUser = await User.findOne({ email });
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when check user exist or not!!!",
      500
    );
    return next(err);
  }
  if (!existedUser) {
    const err = new HttpError("Unauthozied! Credentials is not valid", 401);
    return next(err);
  }
  let isPwMatched;
  try {
    isPwMatched = await bcrypjs.compare(password, existedUser.password);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when compare password!!!",
      500
    );
    return next(err);
  }
  if (!isPwMatched) {
    const err = new HttpError("Unauthozied! Credentials is not valid", 401);
    return next(err);
  }
  let token;
  try {
    token = await jwt.sign(
      { userId: existedUser._id, role: existedUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when encode data to jwt token!!!",
      500
    );
    return next(err);
  }
  if (!token) {
    return next(new HttpError("Server error. Can not encode token!!!", 500));
  }
  return res.status(200).json({
    token,
    userId: existedUser._id,
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { name, email, password, image } = req.body;
  let existedUser;
  try {
    existedUser = await User.findOne({ email });
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when check user exist or not!!!",
      500
    );
    return next(err);
  }
  if (existedUser) {
    const err = new HttpError(
      "User with that email already exist. Please login instead",
      422
    );
    return next(err);
  }
  let hashPassword;
  try {
    hashPassword = await bcrypjs.hash(password, 12);
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when hash password!!!",
      500
    );
    return next(err);
  }
  const user = new User({
    name,
    email,
    password: hashPassword,
    image,
  });
  try {
    await user.save();
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when save user!!!",
      500
    );
    return next(err);
  }
  let token;
  try {
    token = await jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
  } catch (error) {
    const err = new HttpError(
      "Server error.Something went wrong when encode data to jwt!!!",
      500
    );
    return next(err);
  }
  if (!token) {
    return next(new HttpError("Token can not be encoded!!!", 500));
  }
  return res.status(201).json({
    token,
    userId: user._id,
  });
};

module.exports = { signup, login };
