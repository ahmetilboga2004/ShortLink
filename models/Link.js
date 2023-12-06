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
    type: Boolean,
    default: false,
  },
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
