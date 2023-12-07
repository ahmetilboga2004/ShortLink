// * THIRD-PARTY MODULES
const express = require("express");
const passport = require("passport");
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);

// * CORE MODULES
const path = require("path");

// * MY MODULES
const UserModel = require("./models/User");
const dotenv = require("dotenv");
const db = require("./config/database");

// # Routes
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");

const app = express();
dotenv.config();

// ! TEMPLATE ENGINE
app.engine("html", nunjucks.render);
app.set("view engine", "html");
nunjucks.configure("views", {
  autoescape: true,
  noCache: true,
  express: app,
});

// ! MONGO STORE
const store = new MongoDBSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// ! MIDDLEWARES
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

// Need to require the entire Passport config module so app.js knows about it
require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  res.locals.user = req.isAuthenticated() ? req.user : null;
  next();
});

// ! ROUTES
app.use(pageRoutes);
app.use(authRoutes);
app.use(linkRoutes);

// 404 Not Found middleware
app.use((req, res, next) => {
  res.send("404 Not Found");
});

// RUN LISTEN SERVER
const port = process.env.PORT || 3000;
db();
app.listen(port, () => {
  console.log(`Server is running on ${port} Port`);
});
