// * THIRD-PARTY MODULES
const express = require("express");
const nunjucks = require("nunjucks");

// * CORE MODULES
const path = require("path");

// * MY MODULES

const app = express();
const port = 3000;

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ! ROUTES
app.get("/", (req, res) => {
  res.render("index", {
    is_header: true,
    pageName: "home",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    is_header: true,
    pageName: "about",
  });
});

app.get("/faq", (req, res) => {
  res.render("faq", {
    is_header: false,
    pageName: "faq",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    is_header: false,
    pageName: "contact",
  });
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", {
    is_header: false,
    pageName: "dashboard",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    is_header: false,
    pageName: "login",
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    is_header: false,
    pageName: "register",
  });
});

app.get("/reset", (req, res) => {
  res.render("reset", {
    is_header: false,
    pageName: "reset",
  });
});

app.get("/forgot", (req, res) => {
  res.render("forgot", {
    is_header: false,
    pageName: "forgot",
  });
});

app.get("/adminDashboard", (req, res) => {
  res.render("adminDashboard", {
    is_header: false,
    pageName: "adminDashboard",
  });
});

// RUN LİSTEN SERVER
app.listen(port, () => {
  console.log("Server is running...");
});
