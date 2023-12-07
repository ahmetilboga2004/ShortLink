const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LinkSchema = new Schema({
  name: {
    type: String,
    trim: true,
    lowercase: true,
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true,
  },
  shortLink: {
    type: String,
    unique: true,
  },
  click: {
    type: Number,
    default: 0,
  },
  leftTime: Date,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Link = mongoose.model("Link", LinkSchema);
module.exports = Link;
