const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    // Gelen verileri al
    const { name, username, email, password } = req.body;

    // Verileri kullanarak yeni bir kullanıcı oluştur
    const user = await User.create({ name, username, email, password });

    // Başarılı kayıt durumunda mesajı ayarla
    res.status(201).json({
      success: true,
      message: "Account created successfully. Redirecting to login...",
    });
  } catch (error) {
    // Hata durumunda mesajı ve hatayı döndür
    res.status(400).json({
      success: false,
      message: "Registration failed. Please check your login credentials.",
      error: error.message,
    });
  }
};
