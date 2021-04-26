const jwt = require("jsonwebtoken");
const HttpError = require("../models/HttpError");

const authMiddleware = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  let token = req.headers.authorization;
  if (!token) {
    return next(new HttpError("Unauthorized .No token was provided.", 401));
  }
  token = token.trim().split("Bearer ")[1];
  let decodedTokenData;
  try {
    decodedTokenData = await jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(
      new HttpError("Token is not invalid anymore. Authorization failed", 401)
    );
  }
  if (!decodedTokenData) {
    return next(
      new HttpError("Token can not be decoded. Please try again!", 400)
    );
  }
  req.userId = decodedTokenData.userId;
  return next();
};

module.exports = authMiddleware;
