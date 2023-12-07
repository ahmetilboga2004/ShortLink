const passport = require("passport");
const crypto = require("crypto");
const validator = require("validator");

// * MY-MODULES
const Link = require("../models/Link");

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
      console.log(link);
      res.render("redirect", {
        is_header: false,
        originalUrl: link.originalUrl,
      });
    } else {
      res.status(404).send("404 Not Found");
    }
  } catch (error) {
    console.error(error);
  }
};

exports.shortLink = async (req, res) => {
  try {
    const { urlAdress, urlName, urlTime } = req.body;
    const createdBy = req.user.id;
    const errors = {};

    if (!urlAdress && !validator.isURL(urlAdress)) {
      errors.urlAdress = "Lütfen geçerli bir url girin!";
    }
    // urlName değerinin boş olup olmadığını kontrol et
    if (!validator.isEmpty(urlName)) {
      // urlName'in alfanumerik olup olmadığını kontrol et
      if (!validator.isAlphanumeric(urlName)) {
        errors.urlName =
          "Lütfen sadece harflerden ve rakamlardan oluşan bir isim giriniz.";
      }
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
      return res.status(400).json({ errors });
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
    res.status(200).json({
      success: true,
      message: "Link başarıyla oluşturuldu.",
      data: newLink,
    });
  } catch (error) {
    console.log("Link oluşturulurken Bir hata oluştu", error);
    res.status(500).json({
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
      res.status(200).json({
        status: true,
        message: "Link successfully deleted.",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Link not found.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
