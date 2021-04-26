const HttpError = require("../models/HttpError");
const User = require("../models/User");

const getMyProfile = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userId).select(
      "name email image role _id recentActivity"
    );
  } catch (error) {
    const err = new HttpError("Server error.Some thing went wrong!!!", 500);
    return next(err);
  }
  if (!user) {
    const err = new HttpError(
      "Can not find user. Please try with another account",
      403
    );
    return next(err);
  }
  return res.status(200).json({
    user,
  });
};

const updateProfile = async (req, res, next) => {
  let user;
  const { name, image } = req.body;
  try {
    user = await User.findOneAndUpdate(
      {
        _id: req.userId,
      },
      {
        name,
        image,
      },
      {
        new: true,
      }
    );
  } catch (error) {
    const err = new HttpError(
      "Server error.Some thing went wrong when updating user profile!!!",
      500
    );
    return next(err);
  }
  if (!user) {
    const err = new HttpError(
      "Can not find user. Please try with another account",
      403
    );
    return next(err);
  }
  user.password = undefined;
  return res.status(200).json(user);
};

module.exports = { getMyProfile, updateProfile };
