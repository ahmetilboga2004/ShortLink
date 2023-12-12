const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  profileImage: String,
  hash: String,
  salt: String,
  role: {
    type: String,
    enum: ["user", "mod", "admin"],
    default: "user",
  },
  verificationKey: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetKey: String,
  resetKeyExpires: Date,
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
