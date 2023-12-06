// * THIRD-PARTY
const passport = require("passport");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const validator = require("validator");

// * MY-MODULES
const User = require("../models/User");
const passwordUtils = require("../lib/passwordUtils");

// E-posta gönderen işlev
async function sendVerificationEmail(email, verificationKey) {
  // E-posta gönderme işlemleri için nodemailer veya başka bir e-posta gönderme modülü kullanılabilir
  // Bu örnekte, nodemailer kullanılıyor
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "ilbogaahmet4747@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Verify Account", // Subject line
    html: `<strong><a href='http://localhost:3000/verify?email=${email}&key=${verificationKey}'>Verify Account Link</a><strong>`, // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("E-posta gönderilemedi:", error);
    } else {
      console.log("E-posta gönderildi:", info.response);
    }
  });
}

exports.registerUser = async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    const errors = {};

    const validateName = (fullname) => {
      const nameParts = fullname.split(" ");

      if (nameParts.length !== 2) {
        return false; // İsim ve soyisim arasında sadece bir boşluk olmalı
      }

      const [firstName, lastName] = nameParts;

      // İsim ve soyisimde sadece harf içermelidir
      if (
        !validator.isAlpha(firstName, "tr-TR") ||
        !validator.isAlpha(lastName, "tr-TR")
      ) {
        return false;
      }

      return true;
    };

    // Kullanımı
    if (!validateName(fullname)) {
      const error = {};
      error.fullname = "Lütfen isminizi kontrol edin!";
      // Hata işlemleri
    }

    if (!validator.isEmail(email)) {
      errors.email = "Lütfen geçerli bir email adresi girin!";
    }

    if (!validator.isLength(password, { min: 6 })) {
      errors.password = "Şifre en az 6 karakter olmalıdır";
    }
    // Hatalar kontrol ediliyor
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const verificationKey = crypto.randomBytes(32).toString("hex");
    const saltHash = await passwordUtils.genPassword(password);

    const newUser = new User({
      fullname: fullname,
      email: email,
      hash: saltHash.hash,
      salt: saltHash.salt,
      verificationKey,
    });

    try {
      const savedUser = await newUser.save();
      await sendVerificationEmail(email, verificationKey);
      if (savedUser) {
        console.log(savedUser);
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/register");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Kullanıcı doğrulama
exports.verify = async (req, res) => {
  const { email, key } = req.query;

  try {
    const user = await User.findOne({ email, verificationKey: key });
    if (user) {
      // Kullanıcıyı doğrula
      user.isVerified = true;
      user.verificationKey = "";
      await user.save();

      console.log("Hesabınız başarıyla doğrulandı");
      res.redirect("/dashboard");
    } else {
      console.log("Geçersiz doğrulama bağlantısı");
      res.render("verify", {
        is_header: false,
        message:
          "Bağlantı süresi bitmiş yada geçersiz bir doğrulama bağlantısı..",
      });
    }
  } catch (error) {
    console.error("Doğrulama işlemi hatası:", error);
    res.status(500).send("Doğrulama işlemi sırasında bir hata oluştu.");
  }
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.redirect("/");
  });
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, password_confirm, logout_devices } = req.body;
    if (!(password === password_confirm)) {
      return res
        .status(400)
        .json({ message: "Hata girdiğiniz şifreler aynı değil" });
    }
    const saltHash = await passwordUtils.genPassword(password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    // Güncellenmiş şifreyi veritabanında kaydet
    await User.findByIdAndUpdate(req.user.id, { hash, salt });
    if (logout_devices) {
      // Kullanıcının oturumda olduğunu kontrol et
      if (req.isAuthenticated()) {
        // MongoDB'den ilgili session'ları silelim
        const userSessions = await new Promise((resolve, reject) => {
          req.sessionStore.all((error, sessions) => {
            if (error) {
              reject(error);
            } else {
              resolve(sessions);
            }
          });
        });

        // Kontrol: Eğer userSessions undefined veya null ise, boş bir dizi atayalım
        const userSessionValues = userSessions
          ? Object.values(userSessions)
          : [];

        for (const session of userSessionValues) {
          if (
            session.passport &&
            session.passport.user &&
            session.passport.user.toString() === req.user.id
          ) {
            await req.sessionStore.destroy(session._id);
          }
        }

        // req.logout() fonksiyonunu bir Promise içinde sarmala
        await new Promise((resolve, reject) => {
          req.logout((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });

        res.redirect("/"); // veya başka bir sayfaya yönlendirme yapabilirsiniz
      } else {
        res.redirect("/"); // Kullanıcı zaten oturumda değilse, ana sayfaya yönlendir
      }
    } else {
      return res.redirect("/dashboard"); // veya başka bir sayfaya yönlendirme yapabilirsiniz
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendPasswordForgotEmail = async (email, resetKey) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "ilbogaahmet4747@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Reset Password", // Subject line
    html: `<strong><a href='http://localhost:3000/reset-forgot-password?email=${email}&key=${resetKey}'>Reset Password</a><strong>`, // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("E-posta gönderilemedi:", error);
    } else {
      console.log("E-posta gönderildi:", info.response);
    }
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Bu emaile ait bir hesap bulunamadı" });
    }

    // Şifre sıfırlama anahtarı oluştur
    const resetKey = crypto.randomBytes(32).toString("hex");

    // Anahtarın geçerlilik süresini ayarla (örneğin, bir saat)
    const resetKeyExpires = new Date();
    resetKeyExpires.setHours(resetKeyExpires.getHours() + 1);

    // Kullanıcı modelini güncelle
    user.resetKey = resetKey;
    user.resetKeyExpires = resetKeyExpires;
    await user.save();

    // E-posta ile şifre sıfırlama bağlantısı gönder
    await sendPasswordForgotEmail(user.email, resetKey);

    return res
      .status(200)
      .json({ message: "Şifre sıfırlama bağlantısı e-posta ile gönderildi." });
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    return res
      .status(500)
      .json({ message: "Şifre sıfırlama işlemi sırasında bir hata oluştu." });
  }
};

// Şifre sıfırlama bağlantısına tıklama için route
exports.resetForgot = async (req, res) => {
  const { email, key } = req.query;

  try {
    const user = await User.findOne({ email, resetKey: key });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Geçersiz şifre sıfırlama bağlantısı." });
    }

    // Şifre sıfırlama bağlantısının süresi geçmemişse
    if (user.resetKeyExpires > new Date()) {
      // Şifre sıfırlama sayfasını göster
      return res.render("resetForgotPassword", { email, key });
    } else {
      return res
        .status(400)
        .json({ message: "Şifre sıfırlama bağlantısının süresi geçmiş." });
    }
  } catch (error) {
    console.error("Şifre sıfırlama bağlantısı kontrol hatası:", error);
    return res.status(500).json({
      message: "Şifre sıfırlama bağlantısı kontrol sırasında bir hata oluştu.",
    });
  }
};

exports.resetForgotPassword = async (req, res) => {
  try {
    const { password, password_confirm, logout_devices } = req.body;
    const { email, key } = req.query;

    // Şifre ve şifre onayı kontrolü
    if (!(password === password_confirm)) {
      return res
        .status(400)
        .json({ message: "Hata: Girdiğiniz şifreler aynı değil" });
    }

    // Kullanıcıyı e-posta ve reset anahtarı ile bul
    const user = await User.findOne({ email, resetKey: key });

    // Kullanıcı bulunamazsa
    if (!user) {
      return res
        .status(400)
        .json({ message: "Geçersiz şifre sıfırlama bağlantısı." });
    }

    // Şifre sıfırlama bağlantısının süresi geçmemişse
    if (user.resetKeyExpires > new Date()) {
      // Yeni şifreyi hashle
      const saltHash = await passwordUtils.genPassword(password);
      const salt = saltHash.salt;
      const hash = saltHash.hash;

      // Kullanıcının şifresini güncelle
      user.hash = hash;
      user.salt = salt;
      await user.save();

      // Oturumu kapatma işlemleri
      if (logout_devices) {
        // Kullanıcının oturumda olduğunu kontrol et
        if (req.isAuthenticated()) {
          // MongoDB'den ilgili session'ları silelim
          const userSessions = await new Promise((resolve, reject) => {
            req.sessionStore.all((error, sessions) => {
              if (error) {
                reject(error);
              } else {
                resolve(sessions);
              }
            });
          });

          // Kontrol: Eğer userSessions undefined veya null ise, boş bir dizi atayalım
          const userSessionValues = userSessions
            ? Object.values(userSessions)
            : [];

          for (const session of userSessionValues) {
            if (
              session.passport &&
              session.passport.user &&
              session.passport.user.toString() === user.id
            ) {
              await req.sessionStore.destroy(session._id);
            }
          }

          // req.logout() fonksiyonunu bir Promise içinde sarmala
          await new Promise((resolve, reject) => {
            req.logout((err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });

          return res.redirect("/"); // veya başka bir sayfaya yönlendirme yapabilirsiniz
        } else {
          return res.redirect("/"); // Kullanıcı zaten oturumda değilse, ana sayfaya yönlendir
        }
      } else {
        return res.redirect("/dashboard"); // veya başka bir sayfaya yönlendirme yapabilirsiniz
      }
    } else {
      return res
        .status(400)
        .json({ message: "Şifre sıfırlama bağlantısının süresi geçmiş." });
    }
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    return res
      .status(500)
      .json({ message: "Şifre sıfırlama işlemi sırasında bir hata oluştu." });
  }
};
