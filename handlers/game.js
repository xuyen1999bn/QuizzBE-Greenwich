const HttpError = require("../models/HttpError");
const Game = require("../models/Game");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const { getTwoWrongAnswer, random_item } = require("../utils/game");

const playGame = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { subject } = req.body;
  let game, user, findedSubject;
  try {
    findedSubject = await Subject.findById(subject);
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when finding subject!!",
        500
      )
    );
  }
  if (!findedSubject) {
    return next(new HttpError("Can not find subject. Please try again!!", 404));
  }
  try {
    user = await User.findById(req.userId);
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when finding user!!",
        500
      )
    );
  }
  game = new Game({
    subject: subject,
    player: req.userId,
  });
  try {
    const newGame = await game.save();
    findedSubject.numOfPlayers = findedSubject.numOfPlayers + 1;
    user.recentActivity.push(newGame._id);
    await user.save();
    await findedSubject.save();
    return res.status(201).json(newGame);
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when playing game!!",
        500
      )
    );
  }
};

const updateGame = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }
  const { playerAnswerPosition, question, doingTime, isFinished } = req.body;
  let game, questionItem;
  try {
    questionItem = await Question.findById(question);
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when finding question!!",
        500
      )
    );
  }
  if (!questionItem) {
    return next(
      new HttpError("Can not find question to compare answer!!!", 404)
    );
  }
  try {
    game = await Game.findById(req.params.id);
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when finding game by id!!",
        500
      )
    );
  }
  if (!game) {
    return next(new HttpError("Can not find game to update!!!", 404));
  }
  if (req.userId !== game.player.toString()) {
    return next(new HttpError("You can not play this game!!", 401));
  }
  if (game.isFinished) {
    return next(new HttpError("This game has finished!!", 400));
  }
  let isCorrect = false;
  try {
    if (questionItem.correctOptionPosition === Number(playerAnswerPosition)) {
      game.score = game.score + questionItem.point;
      isCorrect = true;
    }
    game.currentQuestionPosition = game.currentQuestionPosition + 1;
    if (game.time - Number(doingTime) > 0) {
      game.time = game.time - Number(doingTime);
    } else {
      game.time = 0;
      game.isFinished = true;
    }
    game.isFinished = Boolean(isFinished);
    await game.save();
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when updating game!!",
        500
      )
    );
  }
  return res.json({ game, isCorrect });
};

const getListGame = async (req, res, next) => {
  let games;
  try {
    games = await Game.find({ player: req.userId });
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when fetching games!!",
        500
      )
    );
  }
  if (games) {
    return res.json(games);
  } else {
    return next(new HttpError("Can not find game list", 404));
  }
};

const getRankScoreBySubject = async (req, res, next) => {
  let games;
  try {
    games = await Game.find({
      subject: req.params.id,
      isFinished: true,
    }).populate("player", "name image email");
  } catch (error) {
    return next(
      new HttpError(
        "Server error.Something went wrong when fetching rank score for this subject",
        500
      )
    );
  }
  if (!games) {
    return next(new HttpError("Can not find rank score for this subject", 403));
  }
  const rankList = [];
  for (let i = 0; i < games.length; i++) {
    if (
      rankList.some(
        (el) => el.player._id.toString() === games[i].player._id.toString()
      )
    ) {
      continue;
    }
    let currentUserGames = games.filter(
      (g) => g.player._id.toString() === games[i].player._id.toString()
    );
    currentUserGames.sort((a, b) => a.score - b.score);
    rankList.push(currentUserGames[currentUserGames.length - 1]);
  }
  return res.json(rankList.sort((a, b) => b.score - a.score));
};

const getGameById = async (req, res, next) => {
  let game;
  try {
    game = await Game.findById(req.params.id).populate(
      "subject",
      "name image numOfQuestions numOfPlayers"
    );
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when fetching game by id!!",
        500
      )
    );
  }
  if (game) {
    if (game.player.toString() !== req.userId) {
      return next(new HttpError("You can not view this game!!", 401));
    }
    let questionList;
    try {
      const subject = await Subject.findById(game.subject._id).populate(
        "questionList",
        "_id level"
      );
      questionList = [...subject.questionList];
      if (questionList.length < 15) {
        return next(
          new HttpError(
            "This subject does not have enough question to playing!!",
            400
          )
        );
      }
      let hardQuestion = questionList.filter((item) => item.level === "HARD");
      let mediumQuestion = questionList.filter(
        (item) => item.level === "MEDIUM"
      );
      let easyQuestion = questionList.filter((item) => item.level === "EASY");

      if (
        easyQuestion.length < 7 ||
        mediumQuestion.length < 5 ||
        hardQuestion.length < 3
      ) {
        return next(
          new HttpError(
            "This subject does not have enough question to playing!!",
            400
          )
        );
      }
      const randomQuestion = [];

      for (let i = 0; i < 7; i++) {
        const questionItem = random_item(easyQuestion);
        randomQuestion.push(questionItem._id);
        easyQuestion = easyQuestion.filter(
          (q) => q._id.toString() !== questionItem._id.toString()
        );
      }
      for (let i = 0; i < 5; i++) {
        const questionItem = random_item(mediumQuestion);
        randomQuestion.push(questionItem._id);
        mediumQuestion = mediumQuestion.filter(
          (q) => q._id.toString() !== questionItem._id.toString()
        );
      }
      for (let i = 0; i < 3; i++) {
        const questionItem = random_item(hardQuestion);
        randomQuestion.push(questionItem._id);
        hardQuestion = hardQuestion.filter(
          (q) => q._id.toString() !== questionItem._id.toString()
        );
      }
      game.subject.questionList = [...randomQuestion];
    } catch (error) {
      return next(
        new HttpError(
          "Server error. Something went wrong when fetching game by id!!",
          500
        )
      );
    }

    return res.json(game);
  } else {
    return next(new HttpError("Can not find game by id", 404));
  }
};

const removeTwoWrongAnswer = async (req, res, next) => {
  let game;
  try {
    game = await Game.findById(req.params.gId).populate(
      "subject",
      "questionList"
    );
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when fetching game by id!!",
        500
      )
    );
  }
  if (game) {
    if (game.player.toString() !== req.userId) {
      return next(new HttpError("You can not view this game!!", 401));
    }
    if (game.isRemoveTwoWrongAnswer) {
      return next(new HttpError("You've used this suggestion before!!", 400));
    }
    let isExisted = game.subject.questionList.find(
      (q) => q.toString() === req.params.qId
    );
    if (isExisted) {
      const question = await Question.findById(req.params.qId);
      const rmAnswers = getTwoWrongAnswer(question.correctOptionPosition);
      game.isRemoveTwoWrongAnswer = true;
      await game.save();
      return res.json(rmAnswers);
    } else {
      return next(
        new HttpError(
          "This question cannot find in this game.Pls try again",
          404
        )
      );
    }
  } else {
    return next(new HttpError("Can not find game by id", 404));
  }
};

const getRightAnswer = async (req, res, next) => {
  let game;
  try {
    game = await Game.findById(req.params.gId).populate(
      "subject",
      "questionList"
    );
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when fetching game by id!!",
        500
      )
    );
  }
  if (game) {
    if (game.player.toString() !== req.userId) {
      return next(new HttpError("You can not view this game!!", 401));
    }
    if (game.isGetRightAnswer) {
      return next(new HttpError("You've used this suggestion before!!", 400));
    }
    let isExisted = game.subject.questionList.find(
      (q) => q.toString() === req.params.qId
    );
    if (isExisted) {
      const question = await Question.findById(req.params.qId);
      game.isGetRightAnswer = true;
      await game.save();
      return res.json(question.correctOptionPosition);
    } else {
      return next(
        new HttpError(
          "This question cannot find in this game.Pls try again",
          404
        )
      );
    }
  } else {
    return next(new HttpError("Can not find game by id", 404));
  }
};

const callSupport = async (req, res, next) => {
  let game;
  try {
    game = await Game.findById(req.params.gId).populate(
      "subject",
      "questionList"
    );
  } catch (error) {
    return next(
      new HttpError(
        "Server error. Something went wrong when fetching game by id!!",
        500
      )
    );
  }
  if (game) {
    if (game.player.toString() !== req.userId) {
      return next(new HttpError("You can not view this game!!", 401));
    }
    if (game.isCalledSupport) {
      return next(new HttpError("You've used this suggestion before!!", 400));
    }
    let isExisted = game.subject.questionList.find(
      (q) => q.toString() === req.params.qId
    );
    if (isExisted) {
      game.isCalledSupport = true;
      await game.save();
      return res.json({
        supportAnswer: Math.ceil(Math.random() * 4),
      });
    } else {
      return next(
        new HttpError(
          "This question cannot find in this game.Pls try again",
          404
        )
      );
    }
  } else {
    return next(new HttpError("Can not find game by id", 404));
  }
};

module.exports = {
  playGame,
  getListGame,
  getGameById,
  updateGame,
  getRankScoreBySubject,
  removeTwoWrongAnswer,
  getRightAnswer,
  callSupport,
};
