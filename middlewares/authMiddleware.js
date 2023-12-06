const User = require("../models/User");

exports.afterLoginCheckVerify = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user && !user.isVerified) {
      // Kullanıcı girişi yapıldıktan sonra, ancak hesabı doğrulanmamışsa, isteği hemen sonlandırarak yönlendirme yapabilirsiniz.
      return res.render("verify", {
        is_header: false,
        message: "Lütfen hesabınızı doğrulayın.",
      }); // Doğrulama sayfasına yönlendirme
    }

    next();
  } catch (error) {
    console.error("Doğrulama kontrolü hatası:", error);
  }
};

exports.checkVerifyEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user && user.isVerified) {
      return res.redirect("/login");
    }
    next();
  } catch (error) {
    console.error("Doğrulama kontrolü hatası:", error);
  }
};
