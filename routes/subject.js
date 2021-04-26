const express = require("express");
const { check } = require("express-validator");
const {
  createSubject,
  getListSubject,
  deleteSubject,
  getSubjectById,
  updateSubject,
  removeQuestionFromSubject,
  searchSubject,
} = require("../handlers/subject");
const isAdminAuthMiddleware = require("../middlewares/isAdminAuth");
const router = express.Router();

router.get("/search", searchSubject);

router.get("/", getListSubject);

router.get("/:id", getSubjectById);

router.use(isAdminAuthMiddleware);

router.post(
  "/",
  [check("name", "Subject name must not be empty").not().isEmpty()],
  createSubject
);

router.put(
  "/:id",
  [check("name", "Subject name must not be empty").not().isEmpty()],
  updateSubject
);

router.delete("/:id", deleteSubject);

router.delete("/:id/question/:qId", removeQuestionFromSubject);

module.exports = router;
