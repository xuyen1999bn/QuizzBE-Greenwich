const HttpError = require("../models/HttpError");
const User = require("../models/User");
const { getSubjectDetail } = require("../utils/subject");

const getListUser = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}).select("_id name email image recentActivity");
  } catch (error) {
    const err = new HttpError("Server error.Some thing went wrong!!!", 500);
    return next(err);
  }
  if (!users) {
    const err = new HttpError("Can not find user collection", 400);
    return next(err);
  }
  return res.json({
    users,
  });
};

const getUserActivities = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userId)
      .select("recentActivity")
      .populate(
        "recentActivity",
        "subject score isFinished time currentQuestionPosition"
      );
  } catch (error) {
    const err = new HttpError("Server error.Some thing went wrong!!!", 500);
    return next(err);
  }
  if (!user) {
    const err = new HttpError("Can not find user activity", 404);
    return next(err);
  }
  const activities = [];
  const appendSubjectDetail = async (_) => {
    for (let index = 0; index < user.recentActivity.length; index++) {
      const subjectDetail = await getSubjectDetail(
        user.recentActivity[index].subject
      );
      activities.push({
        game: user.recentActivity[index],
        subjectDetail,
      });
    }
  };
  await appendSubjectDetail();
  return res.json({
    activities,
  });
};

const getUserProfile = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.userId).select("_id name email image role");
  } catch (error) {
    const err = new HttpError("Server error.Some thing went wrong!!!", 500);
    return next(err);
  }
  if (!user) {
    const err = new HttpError("Can not find user", 400);
    return next(err);
  }
  return res.json(user);
};

const clearUserCollection = async (req, res, next) => {
  let user;
  try {
    user = await User.find({});
  } catch (error) {
    const err = new HttpError("Server error.Some thing went wrong!!!", 500);
    return next(err);
  }
  if (user) {
    try {
      user.forEach(async (item) => {
        await item.remove();
      });
    } catch (error) {
      const err = new HttpError("Server error.Some thing went wrong!!!", 500);
      return next(err);
    }
  } else {
    const err = new HttpError("Can not clear user collection", 400);
    return next(err);
  }
  return res.json({
    message: "Clear user collection successfully",
  });
};

module.exports = {
  clearUserCollection,
  getListUser,
  getUserActivities,
  getUserProfile,
};
