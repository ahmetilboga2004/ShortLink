const User = require("../models/User");

exports.afterLoginCheckVerify = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user && !user.isVerified) {
      // Kullanıcı girişi yapıldıktan sonra, ancak hesabı doğrulanmamışsa, isteği hemen sonlandırarak yönlendirme yapabilirsiniz.
      return res.redirect("/verify"); // Doğrulama sayfasına yönlendirme
    }

    next();
  } catch (error) {
    console.error("Doğrulama kontrolü hatası:", error);
  }
};
