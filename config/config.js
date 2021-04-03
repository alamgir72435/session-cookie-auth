const mongoose = require("mongoose");
const keys = require("./keys");
const config = {};

config.__db_connect = async () => {
  try {
    const connection = await mongoose.connect(keys.mongo_URI, {
      useFindAndModify: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("mongoDB is Connected with " + connection.connection.host);
  } catch (error) {
    process.exit(1);
    console.log(error);
  }
};

module.exports = config;
