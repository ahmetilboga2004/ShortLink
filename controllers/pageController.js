exports.getIndexPage = (req, res) => {
  res.render("index", {
    is_header: true,
    pageName: "home",
  });
};

exports.getAboutPage = (req, res) => {
  res.render("about", {
    is_header: true,
    pageName: "about",
  });
};

exports.getContactPage = (req, res) => {
  res.render("contact", {
    is_header: false,
    pageName: "contact",
  });
};

exports.getDashboardPage = (req, res) => {
  res.render("dashboard", {
    is_header: false,
    pageName: "dashboard",
  });
};

exports.getLoginPage = (req, res) => {
  res.render("login", {
    is_header: false,
    pageName: "login",
  });
};

exports.getRegisterPage = (req, res) => {
  res.render("register", {
    is_header: false,
    pageName: "register",
  });
};

exports.getResetPage = (req, res) => {
  res.render("reset", {
    is_header: false,
    pageName: "reset",
  });
};

exports.getForgotPage = (req, res) => {
  res.render("forgot", {
    is_header: false,
    pageName: "forgot",
  });
};
