// * THIRD-PARTY MODULES
const express = require("express");
const mongoose = require("mongoose");
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");
const session = require("express-session");
// * CORE MODULES
const path = require("path");

// * MY MODULES
// # Routes
const pageRoutes = require("./routes/pageRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Mongoose connect to MongoDb
mongoose.connect("mongodb://localhost:27017/shortDb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ! TEMPLATE ENGINE
app.engine("html", nunjucks.render);
app.set("view engine", "html");
nunjucks.configure("views", {
  autoescape: true,
  noCache: true,
  express: app,
});

// ! MIDDLEWARES
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// ! ROUTES
app.use("/", pageRoutes);
app.use("/user", userRoutes);

// RUN LİSTEN SERVER
const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`Server is running on ${port} Port`);
});
