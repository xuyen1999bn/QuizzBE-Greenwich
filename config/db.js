const mongoose = require("mongoose");

const connectDB = () => {
  mongoose.connect(
    process.env.MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        console.log("Error occur when connect to db");
        process.exit(1);
      } else {
        console.log(`MongoDB connected!!!`);
      }
    }
  );
};

module.exports = { connectDB };
