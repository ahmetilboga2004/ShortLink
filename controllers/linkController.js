const passport = require("passport");
const crypto = require("crypto");
const validator = require("validator");

// * MY-MODULES
const Link = require("../models/Link");
const User = require("../models/User");

const getOriginalLink = async (shortLink) => {
  try {
    const link = await Link.findOne({ shortLink });
    return link; // Eğer belirli bir alan almak gerekirse, originalLink.field şeklinde değiştirilebilir.
  } catch (error) {
    console.error("Error in getOriginalLink:", error);
    return null;
  }
};

exports.getLink = async (req, res) => {
  try {
    const shortUrl = req.params.shortLink;
    const link = await getOriginalLink(shortUrl);

    if (link) {
      // Tıklanma sayısını artır
      link.click++;
      await link.save();
      return res.render("redirect", {
        is_header: false,
        originalUrl: link.originalUrl,
      });
    } else {
      return res.json({ success: false, message: "Hata Link bulunamadı" });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: `Beklenmedik bir hata oluştu: ${error.message}`,
    });
  }
};

const sortLinksByDate = async (query) => {
  try {
    const links = await query.sort({ createdAt: -1 }).exec();
    return links;
  } catch (error) {
    throw error;
  }
};

exports.getAllLinks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let links;

    if (userRole === "admin") {
      links = await sortLinksByDate(Link.find());
    } else if (userRole === "mod") {
      links = await sortLinksByDate(
        Link.find({
          $or: [{ createdBy: userId }, { role: "mod" }],
        })
      );
    } else {
      links = await sortLinksByDate(Link.find({ createdBy: userId }));
    }

    if (!links || links.length === 0) {
      return res.json({ success: false, message: "Links not found" });
    }

    return res.json(links);
  } catch (error) {
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

const sortUsersByDate = async (query) => {
  try {
    const users = await query.sort({ createdAt: -1 }).exec();
    return users;
  } catch (error) {
    throw error;
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let users;

    if (userRole === "admin" || userRole === "mod") {
      users = await sortUsersByDate(User.find());
    }

    if (!users || users.length === 0) {
      return res.json({ success: false, message: "Users not found" });
    }

    return res.json(users);
  } catch (error) {
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

const isValidName = (name) => {
  // Harf ve rakam kontrolü
  const alphanumericRegex = /^[a-zA-Z0-9ğüşöçİĞÜŞÖÇ\s]*$/;

  // Harf ve rakam dışında karakter içeriyorsa false döndür
  return alphanumericRegex.test(name);
};

exports.shortLink = async (req, res) => {
  try {
    const { urlAdress, urlName, urlTime } = req.body;
    const createdBy = req.user.id;
    const errors = {};

    if (!urlAdress && !validator.isURL(urlAdress)) {
      errors.urlAdress = "Lütfen geçerli bir url girin!";
    }
    // Kullanımı
    if (!validator.isEmpty(urlName) && !isValidName(urlName)) {
      errors.urlName =
        "Lütfen sadece harflerden ve rakamlardan oluşan bir isim girin.";
    }

    // urlTime'ı uygun bir zaman formatına çevir
    let expirationDate = null;
    if (urlTime !== "Never") {
      expirationDate = new Date();
      switch (urlTime) {
        case "1 day":
          expirationDate.setDate(expirationDate.getDate() + 1);
          break;
        case "1 week":
          expirationDate.setDate(expirationDate.getDate() + 7);
          break;
        case "1 month":
          expirationDate.setMonth(expirationDate.getMonth() + 1);
          break;
        case "3 months":
          expirationDate.setMonth(expirationDate.getMonth() + 3);
          break;
        default:
          errors.urlTime = "Lütfen geçerli bir zaman dilimi seçiniz";
      }
    }

    // Hatalar kontrol ediliyor
    if (Object.keys(errors).length > 0) {
      return res.json({ errors });
    }

    let shortLink = generateShortLink();

    // Kısaltılmış linkin benzersiz olduğunu kontrol et
    while (!(await isUniqueShortLink(shortLink))) {
      shortLink = generateShortLink();
    }

    // Link modeline kaydet
    const newLink = new Link({
      originalUrl: urlAdress,
      name: urlName,
      leftTime: expirationDate,
      shortLink: shortLink,
      createdBy: createdBy,
    });

    await newLink.save();

    // Başarılı yanıtı gönder
    return res.json({
      success: true,
      message: "Link başarıyla oluşturuldu.",
      data: newLink,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Kısaltılmış link oluşturma fonksiyonu
const generateShortLink = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = Math.floor(Math.random() * (10 - 2 + 1)) + 2; // En az 2, en fazla 10 karakter
  let shortLink = "";
  for (let i = 0; i < length; i++) {
    shortLink += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return shortLink;
};

// Kısaltılmış linkin benzersiz olup olmadığını kontrol etme fonksiyonu
const isUniqueShortLink = async (shortLink) => {
  const existingLink = await Link.findOne({ shortLink });
  return !existingLink; // true ise benzersiz, false ise kullanılmış
};

exports.deleteLink = async (req, res) => {
  try {
    const linkId = req.params.linkId;
    const deletedLink = await Link.findByIdAndDelete(linkId);
    if (deletedLink) {
      return res.json({
        status: true,
        message: "Link successfully deleted.",
      });
    } else {
      return res.json({
        status: false,
        message: "Link not found.",
      });
    }
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
};
