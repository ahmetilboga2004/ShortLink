// * THIRD-PARTY
const passport = require("passport");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const validator = require("validator");
const path = require("path");

// * MY-MODULES
const User = require("../models/User");
const passwordUtils = require("../lib/passwordUtils");
const Link = require("../models/Link");

// Doğrulama için E-posta gönderen işlev
const sendVerificationEmail = async (email, verificationKey) => {
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
    from: "fastshorterlink@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Verify Account", // Subject line
    html: `<strong><a href='https://short-link-flax.vercel.app/verify?email=${email}&key=${verificationKey}'>Verify Account Link</a><strong>`, // html body
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    if (info) {
      console.log(info);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

exports.registerUser = async (req, res) => {
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
      errors.email = "Lütfen geçerli bir eposta adresi girin!";
    }
    const validEmail = await User.findOne({ email: email });
    console.log(validEmail);
    if (validEmail) {
      errors.email = "Bu E-posta hesabı zaten kullanılmış!";
    }

    if (!validator.isLength(password, { min: 6 })) {
      errors.password = "Şifre en az 6 karakter olmalıdır";
    }
    // Hatalar kontrol ediliyor
    if (Object.keys(errors).length > 0) {
      return res.json({ errors });
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
      const verifyMail = await sendVerificationEmail(email, verificationKey);
      console.log(verifyMail);
      if (verifyMail) {
        res.json({
          success: true,
          message: "Doğrulama E-postası başarıyla gönderilmiştir.",
        });
      } else {
        res.json({
          success: false,
          message: "Doğrulama E-postası gönderilemedi!",
        });
      }
    } catch (error) {
      res.json({
        success: false,
        message: "Doğrulama E-postası gönderme işlemi başarısız oldu.",
      });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

exports.profileUser = async (req, res) => {
  try {
    const user = req.user;
    const linkCount = await Link.countDocuments({ createdBy: user.id });

    res.render("profile", {
      is_header: false,
      pageName: "profile",
      linkCount: linkCount,
    });
  } catch (error) {
    res.render("profile", {
      is_header: false,
      pageName: "profile",
      linkCount: linkCount,
    });
  }
};

// Contact için E-posta gönderen işlev
const sendContactMail = async (nameSurname, email, message) => {
  // E-posta gönderme işlemleri için nodemailer veya başka bir e-posta gönderme modülü kullanılabilir
  // Bu örnekte, nodemailer kullanılıyor
  const transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "fastshorterlink@gmail.com",
    to: email,
    subject: "Contact Mail",
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (info) {
      console.log(info);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

exports.contactform = async (req, res) => {
  try {
    const { nameSurname, email, message } = req.body;
    const errors = {};
    const validateName = (nameSurname) => {
      const nameParts = nameSurname.split(" ");

      if (nameParts.length !== 2) {
        return false;
      }

      const [firstName, lastName] = nameParts;

      if (
        !validator.isAlpha(firstName, "tr-TR") ||
        !validator.isAlpha(lastName, "tr-TR")
      ) {
        return false;
      }

      return true;
    };

    if (!validateName(nameSurname)) {
      errors.nameSurname = "Lütfen isminizi kontrol edin!";
    }

    if (!validator.isEmail(email)) {
      errors.email = "Lütfen geçerli bir email adresi girin!";
    }
    if (!validator.isLength(message, { min: 30 })) {
      errors.message = "Mesajınız en az 30 karakter olmalıdır";
    }

    if (Object.keys(errors).length > 0) {
      return res.json({ errors });
    }

    const sendMessage = await sendContactMail(nameSurname, email, message);
    if (sendMessage) {
      res.json({
        success: true,
        message: "Mesajınız başarıyla gönderilmiştir.",
      });
    } else {
      res.json({
        success: false,
        message: "Mesajınız gönderilemedi!",
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

exports.loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err || !user) {
      // Giriş başarısız
      return res.json({
        success: false,
        message: "Giriş başarısız. Kullanıcı adı veya şifre hatalı.",
      });
    }
    // Giriş başarılı, oturumu başlat
    req.logIn(user, async (err) => {
      if (err) {
        console.error(err);
      }
      // Oturumu başlattıktan sonra istediğiniz işlemleri yapabilirsiniz
      //  Burada latLogin bilgisi güncellenecek.
      user.lastLogin = new Date();
      await user.save(); // lastLogin alanını güncelleyin

      return res.json({
        success: true,
        message: "Giriş başarılı. Kontrol paneline yönlendiriliyorsunuz...",
      });
    });
  })(req, res, next);
};

exports.verify = async (req, res) => {
  try {
    const { email, key } = req.query;
    if (email || key) {
      const user = await User.findOne({ email, verificationKey: key });
      if (user) {
        // Kullanıcıyı doğrula
        user.isVerified = true;
        user.verificationKey = "";
        await user.save();
        res.render("verify", {
          success: true,
          message: "Hesabınız başarıyla doğrulandı.",
        });
      } else if (req.user) {
        const user = await User.findById(req.user.id);
        if (user.isVerified) {
          res.redirect("/dashboard");
        }
      } else {
        res.render("verify", {
          success: false,
          message: "Geçersiz bağlantı",
        });
      }
    } else {
      if (req.user) {
        const user = await User.findById(req.user.id);
        if (user.isVerified) {
          res.redirect("/dashboard");
        } else {
          res.render("verify", {
            success: false,
            message: "Lütfen hesabınızı doğrulayın",
          });
        }
      } else {
        res.redirect("/login");
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Doğrulama işlemi sırasında bir hata oluştu.",
    });
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
      return res.json({
        success: false,
        message: "Hata girdiğiniz şifreler aynı değil",
      });
    }
    const saltHash = await passwordUtils.genPassword(password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    // Güncellenmiş şifreyi veritabanında kaydet
    const newPass = await User.findByIdAndUpdate(req.user.id, { hash, salt });
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

        res.json({
          success: true,
          message:
            "Şifreniz başarıyla değiştirildi. Anasayfaya yönlendiriliyorsunuz.",
        }); // veya başka bir sayfaya yönlendirme yapabilirsiniz
      } else {
        res.redirect("/"); // Kullanıcı zaten oturumda değilse, ana sayfaya yönlendir
      }
    } else {
      return res.json({
        success: true,
        message: "Şifreniz başarıyla güncellendi",
      }); // veya başka bir sayfaya yönlendirme yapabilirsiniz
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
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
    from: "fastshorterlink@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Reset Password", // Subject line
    html: `<strong><a href='https://short-link-flax.vercel.app/reset-forgot-password?email=${email}&key=${resetKey}'>Reset Password</a><strong>`, // html body
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
      return res.json({
        success: false,
        message: "Böyle bir E-posta hesabı yok",
      });
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

    res.json({
      success: true,
      message: "Şifre sıfırlama bağlantısı başarılı bir şekilde gönderildi.",
    });
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    res.json({
      success: false,
      message: "Şifre sıfırlama bağlantısı gönderilemedi!.",
    });
  }
};

// Şifre sıfırlama bağlantısına tıklama için route
exports.resetForgot = async (req, res) => {
  const { email, key } = req.query;

  try {
    const user = await User.findOne({ email, resetKey: key });

    if (!user) {
      return res.render("resetForgotPassword", {
        success: false,
        message: "Geçersiz Bağlantı..",
      });
    }

    // Şifre sıfırlama bağlantısının süresi geçmemişse
    if (user.resetKeyExpires > new Date()) {
      // Şifre sıfırlama sayfasını göster
      res.render("resetForgotPassword", {
        success: true,
        email: email,
        key: key,
      });
    } else {
      res.render("resetForgotPassword", {
        success: false,
        message: "Şifre sıfırlama bağlantısının süresi geçmiş!",
      });
    }
  } catch (error) {
    console.error("Şifre sıfırlama bağlantısı kontrol hatası:", error);
    res.render("resetForgotPassword", {
      success: false,
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
      return res.json({
        success: false,
        message: "Hata: Girdiğiniz şifreler aynı değil",
      });
    }

    // Kullanıcıyı e-posta ve reset anahtarı ile bul
    const user = await User.findOne({ email, resetKey: key });

    // Kullanıcı bulunamazsa
    if (!user) {
      res.json({
        success: false,
        message: "Geçersiz şifre sıfırlama bağlantısı.",
      });
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

          res.json({
            success: true,
            message:
              "Şifreniz başarılı bir şekilde değiştirildi. Çıkış yapılıyor...",
          }); // veya başka bir sayfaya yönlendirme yapabilirsiniz
        } else {
          res.json({
            success: true,
            message:
              "Şifreniz değiştirildi. Giriş sayfasına yönlendiriliyorsunuz",
          }); // Kullanıcı zaten oturumda değilse, ana sayfaya yönlendir
        }
      } else {
        res.json({
          success: true,
          message:
            "Şifre sıfırlama işlemi başarılı. Giriş sayfasına yönlendiriliyorsunuz",
        }); // veya başka bir sayfaya yönlendirme yapabilirsiniz
      }
    } else {
      res.json({
        success: false,
        message: "Şifre sıfırlama bağlantısının süresi geçmiş.",
      });
    }
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    res.json({
      success: false,
      message: "Şifre sıfırlama işlemi sırasında bir hata oluştu.",
    });
  }
};
