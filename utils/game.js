const getTwoWrongAnswer = (correctAnswer) => {
  const answers = [1, 2, 3, 4];
  const wrongAnswers = answers.filter((a) => a !== correctAnswer);
  const randPos = Math.round(Math.random() * (wrongAnswers.length - 1));
  const rmNum = wrongAnswers[randPos];
  return wrongAnswers.filter((n) => n !== rmNum);
};

const removeDuplicateRankItems = (rankList) => {
  return 1;
};

function random_item(arr_items) {
  return arr_items[Math.floor(Math.random() * arr_items.length)];
}

module.exports = {
  getTwoWrongAnswer,
  removeDuplicateRankItems,
  random_item,
};
