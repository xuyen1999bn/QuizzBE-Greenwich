const express = require("express");
const {
  clearUserCollection,
  getListUser,
  getUserActivities,
  getUserProfile,
} = require("../handlers/user");
const isAdminAuthMiddleware = require("../middlewares/isAdminAuth");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);

router.get("/activities", getUserActivities);

router.use(isAdminAuthMiddleware);

router.delete("/clear-users", clearUserCollection);

router.get("/list-user", getListUser);

module.exports = router;
