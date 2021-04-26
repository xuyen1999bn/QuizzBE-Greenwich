const express = require("express");
const { getMyProfile, updateProfile } = require("../handlers/profile");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/me", getMyProfile);

router.put("/me", updateProfile);

module.exports = router;
