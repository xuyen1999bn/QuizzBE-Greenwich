const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const HttpError = require("./models/HttpError");
const { connectDB } = require("./config/db");

const result = dotenv.config({
  debug: process.env.DEBUG,
});

if (result.error) {
  throw result.error;
}

const app = express();

// middlewares config
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type , X-Requested-With, Accept, Authorization"
  );
  next();
});

connectDB();

app.get("/", (req, res) => {
  return res.json({
    message: "Api connected success",
  });
});

// api routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/profile", require("./routes/profile"));
app.use("/api/v1/user", require("./routes/user"));
app.use("/api/v1/subject", require("./routes/subject"));
app.use("/api/v1/question", require("./routes/question"));
app.use("/api/v1/game", require("./routes/game"));

// 404 routes

app.use((req, res, next) => {
  const error = new HttpError("Could not find any data for this route", 404);
  throw error;
});

// error occur

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "Unknown error occur" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
