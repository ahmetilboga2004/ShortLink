const express = require("express");
const nunjucks = require("nunjucks");
const path = require("path");

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

app.get("/", (req, res) => {
  res.render("index", { is_header: true });
});

app.get("/about", (req, res) => {
  res.render("about", { is_header: true });
});

app.get("/faq", (req, res) => {
  res.render("faq", { is_header: false });
});

app.get("/contact", (req, res) => {
  res.render("contact", { is_header: false });
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { is_header: false });
});

app.get("/login", (req, res) => {
  res.render("login", { is_header: false });
});

app.get("/register", (req, res) => {
  res.render("register", { is_header: false });
});

app.get("/reset", (req, res) => {
  res.render("reset", { is_header: false });
});

app.get("/forgot", (req, res) => {
  res.render("forgot", { is_header: false });
});

app.listen(port, () => {
  console.log("Server is running...");
});
