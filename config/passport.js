const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const passwordUtils = require("../lib/passwordUtils");

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

const verifyCallback = async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return done(null, false);
    }

    const isValid = passwordUtils.validPassword(password, user.hash, user.salt);

    if (isValid) {
      return done(null, user, "Kullanıcı başarıyla giriş yaptı");
    } else {
      return done(null, false, "Başarısız kullanıcı şifresi hatalı girildi.");
    }
  } catch (err) {
    done(err);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findById(userId);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
