const express = require("express");
const { check } = require("express-validator");
const {
  createQuestion,
  updateQuestion,
  getListActiveQuestion,
  deleteQuestion,
  getQuestionById,
  activateQuestion,
  getListPendingQuestion,
  getListActiveQuestionBySubject,
} = require("../handlers/question");
const authMiddleware = require("../middlewares/auth");
const isAdminAuthMiddleware = require("../middlewares/isAdminAuth");

const router = express.Router();

router.get("/pending", isAdminAuthMiddleware, getListPendingQuestion);

router.use(authMiddleware);

router.get("/subject/:id", getListActiveQuestionBySubject);

router.get("/", getListActiveQuestion);

router.post(
  "/",
  [
    check("name", "Question name must not be empty").not().isEmpty(),
    check("optionA", "Option A must not be empty").not().isEmpty(),
    check("optionB", "Option B must not be empty").not().isEmpty(),
    check("optionC", "Option C must not be empty").not().isEmpty(),
    check("optionD", "Option D must not be empty").not().isEmpty(),
    check(
      "correctOptionPosition",
      "Correct Option Position must not be empty & must be a number"
    )
      .not()
      .isEmpty()
      .isNumeric(),
    check("subject", "Subject must not be empty").not().isEmpty(),
  ],
  createQuestion
);

router.put("/activate/:id", activateQuestion);

router.put(
  "/:id",
  [
    check("name", "Question name must not be empty").not().isEmpty(),
    check("optionA", "Option A must not be empty").not().isEmpty(),
    check("optionB", "Option B must not be empty").not().isEmpty(),
    check("optionC", "Option C must not be empty").not().isEmpty(),
    check("optionD", "Option D must not be empty").not().isEmpty(),
    check(
      "correctOptionPosition",
      "Correct Option Position must not be empty & must be a number"
    )
      .not()
      .isEmpty()
      .isNumeric(),
  ],
  updateQuestion
);

router.delete("/:id", isAdminAuthMiddleware, deleteQuestion);

router.get("/:id", getQuestionById);

router.use(isAdminAuthMiddleware);

module.exports = router;
