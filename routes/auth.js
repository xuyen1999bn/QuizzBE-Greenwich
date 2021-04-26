const express = require("express");
const { check } = require("express-validator");
const { signup, login } = require("../handlers/auth");
const router = express.Router();

router.post(
  "/signup",
  [
    check("name", "Name must not be empty").not().isEmpty(),
    check("email", "Email must not be empty").isEmail().normalizeEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  signup
);

router.post(
  "/login",
  [
    check("email", "Email must not be empty").isEmail().normalizeEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  login
);

module.exports = router;
