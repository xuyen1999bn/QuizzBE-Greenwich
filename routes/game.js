const express = require("express");
const { check } = require("express-validator");
const {
  playGame,
  getListGame,
  getGameById,
  updateGame,
  getRankScoreBySubject,
  getRightAnswer,
  removeTwoWrongAnswer,
  callSupport,
} = require("../handlers/game");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get("/rank/:id", getRankScoreBySubject);

router.use(authMiddleware);

router.get("/right-answer/:gId/question/:qId", getRightAnswer);

router.get("/remove-wrong-answer/:gId/question/:qId", removeTwoWrongAnswer);

router.get("/call-support/:gId/question/:qId", callSupport);

router.post(
  "/",
  [check("subject", "Subject must not be empty").not().isEmpty()],
  playGame
);

router.put(
  "/:id",
  [
    check(
      "playerAnswerPosition",
      "Player answer position must not be empty & must be a number"
    )
      .not()
      .isEmpty()
      .isNumeric(),
    check("question", "Question id must not be empty").not().isEmpty(),
    check(
      "isFinished",
      "Finished status must not be empty & must be boolean value"
    )
      .not()
      .isEmpty()
      .isBoolean(),
    check("doingTime", "Time doing must not be empty & must be number")
      .not()
      .isEmpty()
      .isNumeric(),
  ],
  updateGame
);

router.get("/", getListGame);

router.get("/:id", getGameById);

module.exports = router;
