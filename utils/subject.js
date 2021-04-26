const Subject = require("../models/Subject");

const getSubjectDetail = async (subjectId) => {
  const subject = await Subject.findById(subjectId).select(
    "name image description numOfPlayers numOfQuestions"
  );
  if (subject) return subject;
  return {};
};

module.exports = { getSubjectDetail };
