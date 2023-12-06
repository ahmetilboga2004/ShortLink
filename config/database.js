const mongoose = require("mongoose");

const db = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDb Connected Successfull");
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = db;
