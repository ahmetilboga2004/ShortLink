const multer = require("multer");
const path = require("path");
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error("Bu resim tipi desteklenmiyor"), false);
  }
  cb(null, true);
};
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    const extension = file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let url = `image_${uniqueSuffix}.${extension}`;
    cb(null, url);
  },
});

const upload = multer({ storage, fileFilter });

module.exports = upload;
